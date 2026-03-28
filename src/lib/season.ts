const FUTURE_YEAR_TOLERANCE = 5

function getCurrentYear(): number {
  return new Date().getFullYear()
}

function expandTwoDigitYear(value: number): number {
  const pivot = (getCurrentYear() + FUTURE_YEAR_TOLERANCE) % 100
  return value <= pivot ? 2000 + value : 1900 + value
}

export function normalizeSeasonYear(year: number): number {
  const maxAllowedYear = getCurrentYear() + FUTURE_YEAR_TOLERANCE
  if (year > maxAllowedYear && year >= 2000 && year <= 2099) {
    return expandTwoDigitYear(year % 100)
  }

  return year
}

export function normalizeSeasonLabel(value: string): string {
  return value.replace(/\b(19\d{2}|20\d{2})\b/g, (match) => {
    const normalized = normalizeSeasonYear(Number.parseInt(match, 10))
    return String(normalized)
  })
}

export function normalizeProductTextSeasons(value: string): string {
  return normalizeSeasonLabel(value)
}

export function extractSeasonKey(value: string): number | null {
  const normalized = normalizeSeasonLabel(value)
  const matches = normalized.match(/\b(19\d{2}|20\d{2})\b/g)
  if (!matches?.length) {
    return null
  }

  return Math.max(...matches.map((match) => Number.parseInt(match, 10)))
}
