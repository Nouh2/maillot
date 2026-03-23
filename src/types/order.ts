export interface OrderItem {
  product_id: string
  name: string
  size: string
  patch: string | null
  qty: number
  price: number
  photo: string
}

export interface ShippingAddress {
  street: string
  city: string
  postal_code: string
  country: string
}

export interface Order {
  id: string
  stripe_session_id: string | null
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  shipping_address: ShippingAddress | null
  items: OrderItem[]
  total_amount: number | null
  telegram_notified: boolean
  created_at: string
}
