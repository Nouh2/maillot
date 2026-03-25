export interface Order {
  id: string
  stripe_session_id: string
  status: 'paid' | 'pending' | 'cancelled'
  customer_name?: string | null
  customer_email?: string | null
  customer_phone?: string | null
  shipping_address?: {
    street?: string | null
    line2?: string | null
    city?: string | null
    state?: string | null
    postal_code?: string | null
    country?: string | null
  } | null
  items: Array<{
    product_id: string
    name: string
    size: string
    patches?: string[] | null
    patch_names?: string[] | null
    flocage_name?: string | null
    flocage_number?: string | null
    qty: number
    price: number
    photo?: string | null
  }>
  total_amount?: number | null
  telegram_notified?: boolean
  created_at: string
}
