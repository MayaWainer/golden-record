import { NormalizedRecord } from '../models/normalized-record'

export interface DataSourceAdapter {
  readonly sourceName: string
  loadRecords(): Promise<NormalizedRecord[]>
}

export interface RawRecord {
  [key: string]: unknown
}
