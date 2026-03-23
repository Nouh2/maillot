export interface Product {
  id: string
  slug: string
  name: string
  club: string
  league: string
  country: string
  product_kind: 'jersey' | 'goalkeeper' | 'training' | 'pre_match' | 'lifestyle' | 'jacket' | 'pants' | 'shorts' | 'set' | 'vest'
  type: 'domicile' | 'exterieur' | 'third'
  season: string
  price: number
  description: string | null
  sizes: string[]
  available_patches: string[]
  photos: string[]
  stock: number
  is_active: boolean
  is_featured: boolean
  created_at: string
}

export interface League {
  id: string
  slug: string
  name: string
  country: string
  flag_emoji: string
  display_order: number
}

export interface Club {
  id: string
  slug: string
  name: string
  league_id: string | null
  country: string
}

export interface Patch {
  id: string
  code: string
  name: string
  emoji: string
  countries: string[]
  competitions: string[]
}
