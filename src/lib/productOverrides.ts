import type { Product } from '@/types/product'
import type { ProductManualOverride, ProductManualOverrideField } from '@/types/productAdmin'

export const PRODUCT_MANUAL_OVERRIDE_FIELDS: ProductManualOverrideField[] = [
  'name',
  'club',
  'league',
  'country',
  'season',
  'product_kind',
  'type',
  'is_retro',
  'photos',
]

type ProductWithManualOverride = Product & {
  manual_override?: unknown
}

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

function normalizeStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined

  const normalized = value
    .map((entry) => normalizeString(entry))
    .filter((entry): entry is string => Boolean(entry))

  return normalized
}

function normalizeBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined
}

export function normalizeProductManualOverride(value: unknown): ProductManualOverride {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }

  const source = value as Record<string, unknown>
  const override: ProductManualOverride = {}

  const name = normalizeString(source.name)
  if (name) override.name = name

  const club = normalizeString(source.club)
  if (club) override.club = club

  const league = normalizeString(source.league)
  if (league) override.league = league

  const country = normalizeString(source.country)
  if (country) override.country = country

  const season = normalizeString(source.season)
  if (season) override.season = season

  const productKind = normalizeString(source.product_kind) as Product['product_kind'] | undefined
  if (productKind) override.product_kind = productKind

  const type = normalizeString(source.type) as Product['type'] | undefined
  if (type) override.type = type

  const isRetro = normalizeBoolean(source.is_retro)
  if (typeof isRetro === 'boolean') override.is_retro = isRetro

  const photos = normalizeStringArray(source.photos)
  if (photos) override.photos = photos

  return override
}

export function applyProductManualOverride<T extends ProductWithManualOverride>(
  product: T,
  manualOverrideInput: unknown = product.manual_override,
): T {
  const manualOverride = normalizeProductManualOverride(manualOverrideInput)

  return {
    ...product,
    ...manualOverride,
    photos: manualOverride.photos ?? product.photos,
  }
}

export function getManualOverrideFieldList(value: unknown): ProductManualOverrideField[] {
  const normalized = normalizeProductManualOverride(value)
  return PRODUCT_MANUAL_OVERRIDE_FIELDS.filter((field) => field in normalized)
}

export function hasManualOverride(value: unknown): boolean {
  return getManualOverrideFieldList(value).length > 0
}
