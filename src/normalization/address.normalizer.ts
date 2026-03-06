import { NormalizedAddress } from '../models/normalized-record'
import { cleanString, isJunkValue } from './utils'

export function normalizeAddress(
  addressLine?: string | null,
  street?: string | null,
  city?: string | null,
  country?: string | null,
): NormalizedAddress | undefined {
  const cleanedAddress = cleanString(addressLine)
  if (cleanedAddress) return normalizeRawAddress(cleanedAddress)
  return normalizeStructuredAddress(street, city, country)
}

// Parses a raw comma-separated address string (Assuming format: "street, city, country")
function normalizeRawAddress(raw: string): NormalizedAddress | undefined {
  if (isJunkValue(raw)) return undefined

  const parts = raw.split(',').map((p) => cleanString(p))

  if (!parts.some(Boolean)) return undefined

  return {
    streetLine: parts[0] || undefined,
    city: normalizeCity(parts[1]),
    country: parts[2] || undefined,
    raw,
  }
}

// Builds an address from structured components (street, city, and country)
function normalizeStructuredAddress(
  street?: string | null,
  city?: string | null,
  country?: string | null,
): NormalizedAddress | undefined {
  const cleanedStreet = cleanString(street)
  const cleanedCity = cleanString(city)
  const cleanedCountry = cleanString(country)

  if (!cleanedStreet && !cleanedCity && !cleanedCountry) return undefined

  if (
    (cleanedStreet && isJunkValue(cleanedStreet)) ||
    (cleanedCity && isJunkValue(cleanedCity)) ||
    (cleanedCountry && isJunkValue(cleanedCountry))
  ) {
    return undefined
  }

  return {
    streetLine: cleanedStreet,
    city: normalizeCity(cleanedCity),
    country: cleanedCountry,
    raw:
      [cleanedStreet, cleanedCity, cleanedCountry].filter(Boolean).join(', ') ||
      undefined,
  }
}

// Normalizes city values by removing common geographic suffixes.
function normalizeCity(city?: string): string | undefined {
  if (!city) return undefined

  let c = city.trim()

  c = c.replace(/\b(area|region|district|metro)\b/i, '').trim()

  return c || undefined
}
