export function toProperCase(value?: string | null): string | undefined {
  if (!value) return undefined

  const cleaned = value.trim().toLowerCase()

  if (!cleaned) return undefined

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

export function cleanString(value?: string | null): string | undefined {
  if (!value) return undefined

  const cleaned = value.trim()

  return cleaned.length ? cleaned : undefined
}

const JUNK_VALUES = ['test', 'unknown', 'null', 'error']

export function isJunkValue(value?: string): boolean {
  if (!value) return false
  const v = value.toLowerCase()

  return JUNK_VALUES.some((j) => v.includes(j))
}

export function normalizeString(
  value?: string | null,
  options?: {
    lower?: boolean
    proper?: boolean
    rejectJunk?: boolean
  },
): string | undefined {
  if (!value) return undefined

  let v = value.trim()
  if (!v) return undefined

  if (options?.lower) v = v.toLowerCase()

  if (options?.proper) {
    v = v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()
  }

  if (options?.rejectJunk && isJunkValue(v)) {
    return undefined
  }

  return v
}
