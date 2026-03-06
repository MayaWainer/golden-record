import { normalizeString } from './utils'

export function normalizeName(value?: string | null): string | undefined {
  return normalizeString(value, {
    proper: true,
    rejectJunk: true,
  })
}
