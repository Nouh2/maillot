import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getSupabaseServiceClient } from '@/lib/supabase/server'
import type { CartItem } from '@/types/cart'

export async function POST(request: NextRequest) {
  let items: CartItem[]
  try {
    const body = await request.json()
    items = body.items
  } catch {
    return NextResponse.json({ error: 'Body invalide' }, { status: 400 })
  }

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'Panier vide' }, { status: 400 })
  }

  // Récupérer les vrais prix depuis Supabase
  const productIds = [...new Set(items.map((i) => i.product_id))]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabaseServiceClient() as any
  const { data: products, error: dbError } = await supabase
    .from('products')
    .select('id, price')
    .in('id', productIds)

  if (dbError || !products) {
    return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
  }

  const priceMap: Record<string, number> = {}
  for (const p of products) {
    priceMap[p.id] = p.price
  }

  try {
    const stripe = getStripe()
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL

    // Sérialiser uniquement les données minimales pour les métadonnées Stripe (limite 500 chars/clé)
    const itemsMeta = items.map((i) => ({
      product_id: i.product_id,
      name: i.name,
      size: i.size,
      patch: i.patch ?? null,
      patch_name: i.patch_name ?? null,
      qty: i.qty,
      photo: i.photo ?? null,
    }))

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      locale: 'fr',
      line_items: items.map((item) => {
        const serverPrice = priceMap[item.product_id]
        if (serverPrice === undefined) throw new Error(`Prix manquant pour ${item.product_id}`)
        return {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${item.name} - Taille ${item.size}${item.patch_name ? ` + Patch ${item.patch_name}` : ''}`,
              images: item.photo ? [item.photo] : [],
            },
            unit_amount: Math.round(serverPrice * 100),
          },
          quantity: item.qty,
        }
      }),
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH', 'LU', 'DE', 'ES', 'IT', 'GB', 'NL', 'PT'],
      },
      phone_number_collection: { enabled: true },
      success_url: `${baseUrl}/order-confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/shop`,
      metadata: {
        items: JSON.stringify(itemsMeta),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Erreur paiement' }, { status: 500 })
  }
}
