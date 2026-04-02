const FUTURE_YEAR_TOLERANCE = 5

function getCurrentYear(): number {
  return new Date().getFullYear()
}

function expandTwoDigitYear(value: number): number {
  const pivot = (getCurrentYear() + FUTURE_YEAR_TOLERANCE) % 100
  return value <= pivot ? 2000 + value : 1900 + value
}

function parseCompactSeason(value: string): string | null {
  // Format 6 chiffres : "202526" → "2025-2026"
  const match6 = value.match(/\b(20\d{2})(\d{2})\b/)
  if (match6) {
    const start = Number.parseInt(match6[1], 10)
    const end = expandTwoDigitYear(Number.parseInt(match6[2], 10))
    if (end >= start) return `${start}-${end}`
  }

  // Format 4 chiffres : "2526" → "2025-2026"
  const match4 = value.match(/\b(?!19|20)(\d{2})(\d{2})\b/)
  if (match4) {
    const start = expandTwoDigitYear(Number.parseInt(match4[1], 10))
    const end = expandTwoDigitYear(Number.parseInt(match4[2], 10))
    if (end >= start) return `${start}-${end}`
  }

  return null
}

export function normalizeSeasonYear(year: number): number {
  const maxAllowedYear = getCurrentYear() + FUTURE_YEAR_TOLERANCE
  if (year > maxAllowedYear && year >= 2000 && year <= 2099) {
    return expandTwoDigitYear(year % 100)
  }

  return year
}

export function normalizeSeasonLabel(value: string): string {
  // Convertit "202526" → "2025-2026" dans les titres
  const withExpanded = value.replace(/\b(20\d{2})(\d{2})\b/g, (_, y1, y2) => {
    const start = Number.parseInt(y1, 10)
    const end = expandTwoDigitYear(Number.parseInt(y2, 10))
    return end >= start ? `${start}-${end}` : `${y1}${y2}`
  })
  return withExpanded.replace(/\b(19\d{2}|20\d{2})\b/g, (match) => {
    const normalized = normalizeSeasonYear(Number.parseInt(match, 10))
    return String(normalized)
  })
}

export function isPlaceholderSeason(value: string | null | undefined): boolean {
  if (!value) return true

  const normalized = value.trim().toLowerCase()
  return normalized === 'a definir' || normalized === 'a définir'
}

export function expandCompactSeasonLabel(value: string): string | null {
  return parseCompactSeason(value)
}

export function resolveSeasonLabel(value: string, fallbackText?: string): string | null {
  if (!isPlaceholderSeason(value)) {
    return normalizeSeasonLabel(value)
  }

  if (!fallbackText) return null
  return expandCompactSeasonLabel(fallbackText)
}

export function resolveProductSeasonLabel(product: { season: string; name?: string | null; club?: string | null }): string {
  return resolveSeasonLabel(product.season, `${product.name ?? ''} ${product.club ?? ''}`) ?? ''
}

export function normalizeProductTextSeasons(value: string): string {
  return normalizeSeasonLabel(value)
}

export function extractSeasonKey(value: string): number | null {
  const normalized = normalizeSeasonLabel(value)
  const matches = normalized.match(/\b(19\d{2}|20\d{2})\b/g)
  if (!matches?.length) {
    const compact = parseCompactSeason(value)
    if (!compact) return null
    const compactMatches = compact.match(/\b(19\d{2}|20\d{2})\b/g)
    if (!compactMatches?.length) return null
    return Math.max(...compactMatches.map((match) => Number.parseInt(match, 10)))
  }

  return Math.max(...matches.map((match) => Number.parseInt(match, 10)))
}
