export interface CartItem {
  product_id: string
  slug: string
  name: string
  club: string
  size: string
  patch: string | null
  patch_name: string | null
  flocage_name: string | null
  flocage_number: string | null
  price: number
  photo: string
  qty: number
}
