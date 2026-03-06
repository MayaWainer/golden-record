import { Injectable } from '@nestjs/common'
import { JsonFileDataSourceAdapter } from '../json-file-data-source.adapter'
import { RawRecord } from '../source-adapter.interface'
import { NormalizedRecord } from '../../models/normalized-record'
import { normalizeEmail } from '../../normalization/email.normalizer'
import { normalizeName } from '../../normalization/name.normalizer'
import { normalizePhone } from '../../normalization/phone.normalizer'
import { normalizeAddress } from '../../normalization/address.normalizer'

@Injectable()
export class SourceCAdapter extends JsonFileDataSourceAdapter {
  readonly sourceName = 'support'
  protected readonly fileName = 'data-source-c.json'

  protected toNormalized(record: RawRecord): NormalizedRecord {
    return {
      source: this.sourceName,
      recordId: String(record.t_id),

      middleName: normalizeName(record.middle_name as string),

      email: normalizeEmail(record.user_email as string),

      phoneNumber: normalizePhone(record.phone as string),

      address: normalizeAddress(record.address as string),
    }
  }
}
