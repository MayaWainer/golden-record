import { Injectable } from '@nestjs/common'
import { JsonFileDataSourceAdapter } from '../json-file-data-source.adapter'
import { RawRecord } from '../source-adapter.interface'
import { NormalizedRecord } from '../../models/normalized-record'
import { normalizeName } from '../../normalization/name.normalizer'
import { normalizeEmail } from '../../normalization/email.normalizer'
import { normalizeAddress } from '../../normalization/address.normalizer'

@Injectable()
export class SourceAAdapter extends JsonFileDataSourceAdapter {
  readonly sourceName = 'crm'
  protected readonly fileName = 'data-source-a.json'

  protected toNormalized(record: RawRecord): NormalizedRecord {
    return {
      source: this.sourceName,
      recordId: String(record.uid),

      firstName: normalizeName(record.first_name as string),
      middleName: normalizeName(record.middle_name as string),
      lastName: normalizeName(record.last_name as string),

      email: normalizeEmail(record.email_address as string),

      address: normalizeAddress(record.address as string),
    }
  }
}
