import type { Product } from '@/types/product'

export type ProductManualOverrideField =
  | 'name'
  | 'club'
  | 'league'
  | 'country'
  | 'season'
  | 'product_kind'
  | 'type'
  | 'is_retro'
  | 'photos'

export type ProductManualOverride = Partial<Pick<Product, ProductManualOverrideField>>

export type OpsProductSummary = Pick<
  Product,
  'id' | 'slug' | 'name' | 'club' | 'league' | 'season' | 'photos' | 'is_active' | 'is_retro' | 'is_concept' | 'created_at'
> & {
  has_manual_override: boolean
  manual_override_updated_at: string | null
  source_provider: string | null
  source_title: string | null
  last_synced_at: string | null
}

export type OpsProductDetail = Product & {
  has_manual_override: boolean
  manual_override_fields: ProductManualOverrideField[]
  manual_override_updated_at: string | null
}

export type OpsProductDraft = Pick<
  Product,
  'name' | 'club' | 'league' | 'country' | 'season' | 'product_kind' | 'type' | 'is_retro' | 'is_active' | 'photos'
> & {
  is_concept: boolean
}
