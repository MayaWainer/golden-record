import { cleanString } from './utils'

export interface ParsedFullName {
  firstName?: string
  middleName?: string
  lastName?: string
}

export function splitFullName(fullName?: string | null): ParsedFullName {
  const cleaned = cleanString(fullName)
  if (!cleaned) return {}

  const parts = cleaned.split(/\s+/)

  if (parts.length === 1) {
    return { firstName: parts[0] }
  }

  if (parts.length === 2) {
    return { firstName: parts[0], lastName: parts[1] }
  }

  return {
    firstName: parts[0],
    middleName: parts.slice(1, parts.length - 1).join(' '),
    lastName: parts[parts.length - 1],
  }
}
