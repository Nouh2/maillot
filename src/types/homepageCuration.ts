import type { OpsProductSummary } from '@/types/productAdmin'
import type { Product } from '@/types/product'

export type HomepageCurationSection = 'top_moment' | 'fast_movers'

export type HomepageCurationAssignment = {
  section: HomepageCurationSection
  group_key: string
  slot_index: number
  product_id: string
}

export type HomepageBestsellerTab = {
  key: string
  label: string
  href: string
  featuredProduct: Product | null
  cards: Product[]
}

export type HomepageFastMoverGroup = {
  key: string
  label: string
  href: string
  products: Product[]
}

export type HomepageCurationProductOption = Pick<
  OpsProductSummary,
  'id' | 'slug' | 'name' | 'club' | 'league' | 'season' | 'photos' | 'is_active' | 'is_retro' | 'is_concept'
>

export type HomepageCurationEditorGroup = {
  key: string
  label: string
  description: string
  href: string
  slot_labels: string[]
  assignments: Array<string | null>
  suggested_product_ids: string[]
}

export type HomepageCurationEditorSection = {
  id: HomepageCurationSection
  label: string
  description: string
  groups: HomepageCurationEditorGroup[]
}

