import { Injectable } from '@nestjs/common'
import { DataSourceName } from '../models/golden-record'

export interface FieldVote {
  value: unknown
  sources: { source: DataSourceName; recordId: string | number }[]
}

export type VotesByField = Record<string, FieldVote[]>

@Injectable()
export class ConfidenceService {
  calculate(votes: VotesByField): number {
    let score = 0

    const keyFields = [
      'firstName',
      'lastName',
      'middleName',
      'email',
      'address',
    ]

    for (const field of keyFields) {
      const fieldVotes = votes[field]
      if (!fieldVotes || !fieldVotes.length) continue

      const bestSupport = fieldVotes.reduce(
        (max, v) => (v.sources.length > max ? v.sources.length : max),
        0,
      )

      if (bestSupport === 0) continue

      if (field === 'email') {
        score += Math.min(40, bestSupport * 20)
      } else if (field === 'address') {
        score += Math.min(25, bestSupport * 10)
      } else {
        score += Math.min(20, bestSupport * 10)
      }
    }

    if (score > 100) score = 100
    return score
  }
}
