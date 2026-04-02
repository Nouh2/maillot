import { NextRequest, NextResponse } from 'next/server'
import { calculateCartItemUnitPrice, calculateShippingAmount, getProductPricing } from '@/lib/cartPricing'
import { getStripe } from '@/lib/stripe'
import { getSupabaseServiceClient } from '@/lib/supabase/server'
import type { CartItem } from '@/types/cart'

type PersistedOrderItem = {
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
  photo: string | null
  qty: number
}

function normalizeCartItems(items: CartItem[], retroMap: Record<string, boolean>): PersistedOrderItem[] {
  return items.map((item) => {
    if (!(item.product_id in retroMap)) {
      throw new Error(`Produit manquant pour ${item.product_id}`)
    }

    const patches = Array.isArray(item.patches) ? item.patches.filter(Boolean) : []
    const patchNames = Array.isArray(item.patch_names) ? item.patch_names.filter(Boolean) : []
    const flocageName = item.flocage_name?.trim() || null
    const flocageNumber = item.flocage_number?.trim() || null
    const qty = Number.isFinite(item.qty) && item.qty > 0 ? Math.floor(item.qty) : 1
    const basePrice = getProductPricing({ isRetro: retroMap[item.product_id] }).currentPrice
    const price = calculateCartItemUnitPrice({
      basePrice,
      patchCount: patches.length,
      hasFlocage: Boolean(flocageName || flocageNumber),
    })

    return {
      product_id: item.product_id,
      slug: item.slug,
      name: item.name,
      club: item.club,
      size: item.size,
      patches,
      patch_names: patchNames,
      flocage_name: flocageName,
      flocage_number: flocageNumber,
      price,
      photo: item.photo || null,
      qty,
    }
  })
}

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

  const productIds = [...new Set(items.map((item) => item.product_id))]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabaseServiceClient() as any
  const { data: products, error: dbError } = await supabase
    .from('products')
    .select('id, is_retro')
    .in('id', productIds)

  if (dbError || !products) {
    return NextResponse.json({ error: 'Erreur base de donnees' }, { status: 500 })
  }

  const retroMap: Record<string, boolean> = {}
  for (const product of products) {
    retroMap[product.id] = Boolean(product.is_retro)
  }

  const normalizedItems = normalizeCartItems(items, retroMap)
  const itemCount = normalizedItems.reduce((sum, item) => sum + item.qty, 0)
  const shippingAmount = calculateShippingAmount(itemCount)
  const itemsSubtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const orderTotal = itemsSubtotal + shippingAmount
  const stripe = getStripe()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin

  const { data: pendingOrder, error: insertError } = await supabase
    .from('orders')
    .insert({
      status: 'pending',
      items: normalizedItems,
      total_amount: orderTotal,
    })
    .select('id')
    .single()

  if (insertError || !pendingOrder) {
    console.error('Order insert error:', insertError)
    return NextResponse.json({ error: 'Erreur commande' }, { status: 500 })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      allow_promotion_codes: true,
      locale: 'fr',
      client_reference_id: pendingOrder.id,
      line_items: [
        ...normalizedItems.map((item) => ({
          price_data: {
            currency: 'eur',
            product_data: {
              name: [
                item.name,
                `Taille ${item.size}`,
                item.patch_names.length > 0 ? `Patch ${item.patch_names.join(', ')}` : null,
                item.flocage_name || item.flocage_number
                  ? `Flocage ${[item.flocage_name, item.flocage_number].filter(Boolean).join(' #')}`
                  : null,
              ]
                .filter(Boolean)
                .join(' - '),
              images: item.photo ? [item.photo] : [],
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.qty,
        })),
        ...(shippingAmount > 0
          ? [
              {
                price_data: {
                  currency: 'eur',
                  product_data: {
                    name: 'Livraison',
                    description:
                      itemCount >= 3
                        ? 'Offerte des 3 maillots'
                        : itemCount === 2
                          ? 'Tarif 2 maillots'
                          : 'Tarif 1 maillot',
                  },
                  unit_amount: Math.round(shippingAmount * 100),
                },
                quantity: 1,
              },
            ]
          : []),
      ],
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH', 'LU', 'DE', 'ES', 'IT', 'GB', 'NL', 'PT'],
      },
      phone_number_collection: { enabled: true },
      success_url: `${baseUrl}/order-confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/panier`,
      metadata: {
        order_id: pendingOrder.id,
        item_count: String(itemCount),
        shipping_amount: String(shippingAmount),
      },
    })

    const { error: updateError } = await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', pendingOrder.id)

    if (updateError) {
      console.error('Order session update error:', updateError)
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    await supabase.from('orders').delete().eq('id', pendingOrder.id)
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Erreur paiement' }, { status: 500 })
  }
}
