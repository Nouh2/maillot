import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import type { CartItem } from '@/types/cart'

export async function POST(request: NextRequest) {
  const { items }: { items: CartItem[] } = await request.json()

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'Panier vide' }, { status: 400 })
  }

  const stripe = getStripe()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    locale: 'fr',
    line_items: items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${item.name} - Taille ${item.size}${item.patch_name ? ` + Patch ${item.patch_name}` : ''}`,
          images: item.photo ? [item.photo] : [],
          metadata: {
            product_id: item.product_id,
            size: item.size,
            patch: item.patch ?? '',
          },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    })),
    shipping_address_collection: {
      allowed_countries: ['FR', 'BE', 'CH', 'LU', 'DE', 'ES', 'IT', 'GB', 'NL', 'PT'],
    },
    phone_number_collection: { enabled: true },
    success_url: `${baseUrl}/order-confirmed?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/shop`,
    metadata: {
      items: JSON.stringify(items),
    },
  })

  return NextResponse.json({ url: session.url })
}
