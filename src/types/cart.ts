export interface CartItem {
  product_id: string
  slug: string
  name: string
  club: string
  size: string
  patches: string[]
  patch_names: string[]
  flocage_name: string | null
  flocage_number: string | null
  price: number
  photo: string
  qty: number
}
