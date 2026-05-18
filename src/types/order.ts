export interface Order {
  id: string
  order_number: string
  stripe_session_id: string | null
  public_tracking_token: string
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  customer_name?: string | null
  customer_email?: string | null
  customer_phone?: string | null
  customer_user_id?: string | null
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
  supplier_reference?: string | null
  supplier_status?: string | null
  tracking_number?: string | null
  tracking_url?: string | null
  paid_at?: string | null
  sent_to_supplier_at?: string | null
  shipped_at?: string | null
  delivered_at?: string | null
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_content?: string | null
  utm_term?: string | null
  gclid?: string | null
  fbclid?: string | null
  ttclid?: string | null
  source_channel?: string | null
  marketing_opt_in?: boolean
  payment_confirmation_sent_at?: string | null
  tracking_email_sent_at?: string | null
  created_at: string
}
