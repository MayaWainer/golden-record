import { cleanString, isJunkValue } from './utils'

// Basic email structure validation: <local>@<domain>.<tld>
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EMAIL_PREFIXES = ['mailto:']

function stripPrefixes(value: string, prefixes: string[]): string {
  let result = value

  for (const prefix of prefixes) {
    if (result.startsWith(prefix)) {
      result = result.slice(prefix.length)
    }
  }

  return result
}

export function normalizeEmail(value?: string | null): string | undefined {
  let cleaned = cleanString(value)?.toLowerCase()
  if (!cleaned) return undefined

  cleaned = stripPrefixes(cleaned, EMAIL_PREFIXES)

  if (isJunkValue(cleaned)) return undefined

  if (!EMAIL_REGEX.test(cleaned)) return undefined

  return cleaned
}
