export interface NormalizedAddress {
  streetLine?: string
  city?: string
  country?: string
  raw?: string
}

export interface NormalizedRecord {
  source: string
  recordId: string | number

  firstName?: string
  middleName?: string
  lastName?: string

  email?: string
  phoneNumber?: string

  address?: NormalizedAddress
}
