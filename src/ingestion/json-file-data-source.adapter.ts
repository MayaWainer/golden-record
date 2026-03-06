import { readFile } from 'fs/promises'
import { DataSourceAdapter, RawRecord } from './source-adapter.interface'
import { NormalizedRecord } from '../models/normalized-record'
import { join } from 'path'

export abstract class JsonFileDataSourceAdapter implements DataSourceAdapter {
  abstract readonly sourceName: string
  protected abstract readonly fileName: string

  async loadRecords(): Promise<NormalizedRecord[]> {
    const filePath = join(process.cwd(), 'data', this.fileName)

    const raw = JSON.parse(await readFile(filePath, 'utf8')) as RawRecord[]

    return raw.map((r) => this.toNormalized(r))
  }

  protected abstract toNormalized(record: RawRecord): NormalizedRecord
}
