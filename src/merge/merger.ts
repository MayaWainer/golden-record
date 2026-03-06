import { Injectable } from '@nestjs/common'
import {
  NormalizedRecord,
  NormalizedAddress,
} from '../models/normalized-record'
import {
  DataSourceName,
  GoldenRecord,
  SourceEvidence,
} from '../models/golden-record'
import { ConfidenceService, VotesByField } from './confidence'

@Injectable()
export class Merger {
  constructor(private readonly confidence: ConfidenceService) {}

  createFromSeed(seed: NormalizedRecord): {
    record: GoldenRecord
    votes: VotesByField
  } {
    const base: GoldenRecord = {
      firstName: seed.firstName,
      middleName: seed.middleName,
      lastName: seed.lastName,
      emails: seed.email ? [seed.email] : [],
      phoneNumbers: seed.phoneNumber ? [seed.phoneNumber] : [],
      addresses: seed.address ? [seed.address] : [],
      evidence: [],
      confidenceScore: 0,
    }

    const votes: VotesByField = {}
    this.addVotesForRecord(votes, seed)

    base.confidenceScore = this.confidence.calculate(votes)

    return { record: base, votes }
  }

  absorb(
    current: GoldenRecord,
    snapshot: NormalizedRecord,
    existingVotes: VotesByField,
    matchScore: number,
    reasons: string[],
  ): { updated: GoldenRecord; votes: VotesByField } {
    const votes: VotesByField = { ...existingVotes }
    this.addVotesForRecord(votes, snapshot)

    const updated: GoldenRecord = {
      ...current,
      emails: this.mergeUnique(current.emails, snapshot.email),
      phoneNumbers: this.mergeUnique(
        current.phoneNumbers,
        snapshot.phoneNumber,
      ),
      addresses: this.mergeAddresses(current.addresses, snapshot.address),
      evidence: this.mergeEvidence(
        current.evidence,
        snapshot.source as DataSourceName,
        String(snapshot.recordId),
        matchScore,
        reasons,
      ),
      confidenceScore: 0,
    }

    updated.firstName =
      current.firstName ?? (snapshot.firstName || current.firstName)
    updated.middleName =
      current.middleName ?? (snapshot.middleName || current.middleName)
    updated.lastName =
      current.lastName ?? (snapshot.lastName || current.lastName)

    updated.confidenceScore = this.confidence.calculate(votes)

    return { updated, votes }
  }

  private addVotesForRecord(votes: VotesByField, snapshot: NormalizedRecord) {
    const addVote = (field: string, value: unknown) => {
      if (value === undefined || value === null || value === '') return
      const existing = votes[field] ?? []
      let vote = existing.find((v) => v.value === value)
      if (!vote) {
        vote = { value, sources: [] }
        existing.push(vote)
        votes[field] = existing
      }
      if (
        !vote.sources.find(
          (s) =>
            s.source === (snapshot.source as DataSourceName) &&
            s.recordId === snapshot.recordId,
        )
      ) {
        vote.sources.push({
          source: snapshot.source as DataSourceName,
          recordId: snapshot.recordId,
        })
      }
    }

    addVote('firstName', snapshot.firstName)
    addVote('middleName', snapshot.middleName)
    addVote('lastName', snapshot.lastName)
    addVote('email', snapshot.email)

    if (snapshot.address) {
      addVote(
        'address',
        `${snapshot.address.streetLine ?? ''}|${snapshot.address.city ?? ''}|${
          snapshot.address.country ?? ''
        }`,
      )
    }
  }

  private mergeUnique<T>(existing: T[], incoming?: T): T[] {
    if (incoming === undefined || incoming === null) return existing
    return existing.includes(incoming) ? existing : [...existing, incoming]
  }

  private addressContains(a: NormalizedAddress, b: NormalizedAddress): boolean {
    if (!a.city || !b.city) return false
    if (a.city !== b.city) return false

    const streetMatch = !b.streetLine || a.streetLine === b.streetLine

    const countryMatch = !b.country || a.country === b.country

    return streetMatch && countryMatch
  }

  private mergeAddresses(
    existing: NormalizedAddress[],
    incoming?: NormalizedAddress,
  ): NormalizedAddress[] {
    if (!incoming) return existing

    for (const addr of existing) {
      // existing address already covers incoming
      if (this.addressContains(addr, incoming)) {
        return existing
      }

      // incoming address is more complete → replace existing
      if (this.addressContains(incoming, addr)) {
        return existing.map((a) => (a === addr ? incoming : a))
      }
    }

    return [...existing, incoming]
  }

  private mergeEvidence(
    existing: SourceEvidence[],
    source: DataSourceName,
    sourceId: string,
    matchScore: number,
    reasons: string[],
  ): SourceEvidence[] {
    const already = existing.find(
      (e) => e.source === source && e.sourceId === sourceId,
    )
    if (already) {
      return existing
    }
    return [
      ...existing,
      {
        source,
        sourceId,
        matchScore,
        reasons,
      },
    ]
  }
}
