export interface Order {
  id: string
  stripe_session_id: string
  status: 'paid' | 'pending' | 'cancelled'
  customer_name?: string | null
  customer_email?: string | null
  customer_phone?: string | null
  shipping_address?: {
    street?: string | null
    city?: string | null
    postal_code?: string | null
    country?: string | null
  } | null
  items: Array<{
    product_id: string
    name: string
    size: string
    patch?: string | null
    qty: number
    price: number
    photo?: string | null
  }>
  total_amount?: number | null
  telegram_notified?: boolean
  created_at: string
}
