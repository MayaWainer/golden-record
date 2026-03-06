import { NormalizedRecord } from '../models/normalized-record'

export interface RuleResult {
  scoreDelta: number
  reasons: string[]
}

export type MatchRule = (
  subject: NormalizedRecord,
  candidate: NormalizedRecord,
) => RuleResult

export const emailRule: MatchRule = (subject, candidate) => {
  const reasons: string[] = []
  if (subject.email && candidate.email && subject.email === candidate.email) {
    reasons.push('Primary email matches')
    return { scoreDelta: 70, reasons }
  }
  return { scoreDelta: 0, reasons }
}

export const nameRule: MatchRule = (subject, candidate) => {
  const reasons: string[] = []

  const sFirst = subject.firstName
  const sLast = subject.lastName
  const cFirst = candidate.firstName
  const cLast = candidate.lastName

  if (!sFirst || !sLast || !cFirst || !cLast) {
    return { scoreDelta: 0, reasons }
  }

  if (sFirst === cFirst && sLast === cLast) {
    reasons.push('First and last name match')
    let score = 40

    const sMiddle = subject.middleName
    const cMiddle = candidate.middleName

    if (sMiddle && cMiddle) {
      if (sMiddle === cMiddle) {
        score += 10
        reasons.push('Middle name matches')
      } else if (sMiddle[0] === cMiddle[0]) {
        score += 5
        reasons.push('Middle initial matches')
      } else {
        score -= 15
        reasons.push('Middle name conflicts')
      }
    }

    return { scoreDelta: score, reasons }
  }

  return { scoreDelta: 0, reasons }
}

export const phoneRule: MatchRule = (subject, candidate) => {
  const reasons: string[] = []

  if (!subject.phoneNumber || !candidate.phoneNumber) {
    return { scoreDelta: 0, reasons }
  }

  if (subject.phoneNumber === candidate.phoneNumber) {
    reasons.push('Phone number matches')
    return { scoreDelta: 25, reasons }
  }

  return { scoreDelta: 0, reasons }
}

export const addressRule: MatchRule = (subject, candidate) => {
  const reasons: string[] = []

  if (!subject.address || !candidate.address) {
    return { scoreDelta: 0, reasons }
  }

  let score = 0

  if (
    subject.address.city &&
    candidate.address.city &&
    subject.address.city === candidate.address.city
  ) {
    score += 10
    reasons.push('Shares city with subject')
  }

  if (
    subject.address.country &&
    candidate.address.country &&
    subject.address.country === candidate.address.country
  ) {
    score += 10
    reasons.push('Shares country with subject')
  }

  return { scoreDelta: score, reasons }
}
