import { NormalizedAddress } from './normalized-record'

export type DataSourceName = 'A' | 'B' | 'C' | string

export interface GoldenRecord {
  firstName?: string
  middleName?: string
  lastName?: string

  emails: string[]
  phoneNumbers: string[]
  addresses: NormalizedAddress[]

  evidence: SourceEvidence[]

  confidenceScore: number
}

export interface SourceEvidence {
  source: DataSourceName
  sourceId: string
  matchScore: number
  reasons: string[]
}
