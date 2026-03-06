import { Injectable } from '@nestjs/common'
import { SourceAAdapter } from '../ingestion/adapters/source-a.adapter'
import { SourceBAdapter } from '../ingestion/adapters/source-b.adapter'
import { SourceCAdapter } from '../ingestion/adapters/source-c.adapter'
import { Matcher } from '../matching/matcher'
import { Merger } from '../merge/merger'
import { GoldenRecord } from '../models/golden-record'
import { VotesByField } from '../merge/confidence'
import { NormalizedRecord } from '../models/normalized-record'

@Injectable()
export class GoldenRecordService {
  constructor(
    private readonly sourceA: SourceAAdapter,
    private readonly sourceB: SourceBAdapter,
    private readonly sourceC: SourceCAdapter,
    private readonly matcher: Matcher,
    private readonly merger: Merger,
  ) {}

  // Constructs the golden record for the Subject defined as the first record in data-source-a.json.
  async buildGoldenRecordForSeed(): Promise<GoldenRecord> {
    const aRecords = await this.sourceA.loadRecords()
    if (!aRecords.length) {
      throw new Error('No records found in source A')
    }

    const seed = aRecords[0]
    const { record: initialGolden, votes: initialVotes } =
      this.merger.createFromSeed(seed)
    let golden = initialGolden
    let votesState = initialVotes

    const [bRecords, cRecords] = await Promise.all([
      this.sourceB.loadRecords(),
      this.sourceC.loadRecords(),
    ])
    const otherSources = [
      ...aRecords.slice(1),
      ...bRecords,
      ...cRecords,
    ]
    
    let subject = this.toMatchSubject(golden)
    
    for (const candidate of otherSources) {
      const { golden: updated, votes, subject: newSubject } = this.processCandidate(
        golden,
        votesState,
        candidate,
        subject,
      )
      golden = updated
      votesState = votes
      if (newSubject) subject = newSubject
    }

    return golden
  }

  private processCandidate(
    golden: GoldenRecord,
    votesState: VotesByField,
    candidate: NormalizedRecord,
    subject: NormalizedRecord,
  ): { golden: GoldenRecord; votes: VotesByField; subject?: NormalizedRecord } {
    const result = this.matcher.match(subject, candidate)

    if (!result.isMatch) {
      return { golden, votes: votesState }
    }

    const { updated, votes } = this.merger.absorb(
      golden,
      candidate,
      votesState,
      result.score,
      result.reasons,
    )

    return { golden: updated, votes, subject: this.toMatchSubject(updated) }
  }

  private toMatchSubject(golden: GoldenRecord): NormalizedRecord {
    return {
      source: 'golden',
      recordId: 'golden',

      firstName: golden.firstName,
      middleName: golden.middleName,
      lastName: golden.lastName,

      // choose the strongest email, phone number, and address
      email: golden.emails[0],
      phoneNumber: golden.phoneNumbers[0],
      address: golden.addresses[0],
    }
  }
}
