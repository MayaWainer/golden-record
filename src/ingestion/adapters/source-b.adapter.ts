import { Injectable } from '@nestjs/common'
import { JsonFileDataSourceAdapter } from '../json-file-data-source.adapter'
import { RawRecord } from '../source-adapter.interface'
import { NormalizedRecord } from '../../models/normalized-record'
import { normalizeName } from '../../normalization/name.normalizer'
import { normalizeEmail } from '../../normalization/email.normalizer'
import { normalizeAddress } from '../../normalization/address.normalizer'
import { splitFullName } from '../../normalization/full-name.parser'

@Injectable()
export class SourceBAdapter extends JsonFileDataSourceAdapter {
  readonly sourceName = 'marketing'
  protected readonly fileName = 'data-source-b.json'

  protected toNormalized(record: RawRecord): NormalizedRecord {
    const fullName = splitFullName(record.full_name as string)

    return {
      source: this.sourceName,
      recordId: String(record.id),

      firstName: normalizeName(fullName.firstName),
      middleName: normalizeName(
        (record.middle_name as string) ?? fullName.middleName,
      ),
      lastName: normalizeName(fullName.lastName),

      email: normalizeEmail(record.contact_email as string),

      address: normalizeAddress(
        undefined,
        record.street as string,
        record.city as string,
        record.country as string,
      ),
    }
  }
}
