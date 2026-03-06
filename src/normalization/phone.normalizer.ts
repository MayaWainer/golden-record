export function normalizePhone(phone?: string | null): string | undefined {
  if (!phone) return

  const digits = phone.replace(/\D/g, '')

  return digits.length >= 7 ? digits : undefined
}
