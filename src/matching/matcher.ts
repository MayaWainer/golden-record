import { Injectable } from '@nestjs/common'
import { NormalizedRecord } from '../models/normalized-record'
import {
  MatchRule,
  RuleResult,
  addressRule,
  emailRule,
  nameRule,
  phoneRule,
} from './match-rules'

export interface MatchResult {
  isMatch: boolean
  score: number
  reasons: string[]
}

@Injectable()
export class Matcher {
  private readonly rules: MatchRule[] = [
    emailRule,
    nameRule,
    phoneRule,
    addressRule,
  ]

  match(subject: NormalizedRecord, candidate: NormalizedRecord): MatchResult {
    let score = 0
    const reasons: string[] = []

    for (const rule of this.rules) {
      const result: RuleResult = rule(subject, candidate)
      score += result.scoreDelta
      if (result.reasons.length) {
        reasons.push(...result.reasons)
      }
    }

    if (score > 100) score = 100
    if (score < 0) score = 0

    const isMatch = score >= 70

    return { isMatch, score, reasons }
  }
}
