import { NextRequest, NextResponse } from 'next/server'
import { calculateCartItemUnitPrice, calculateCartPricing, getProductPricing, FREE_SHIPPING_THRESHOLD } from '@/lib/cartPricing'
import { normalizeAttributionPayload, syncLeadToBrevo, type AttributionPayload } from '@/lib/marketing'
import { deriveSourceChannel, generateOrderNumber, generatePublicTrackingToken } from '@/lib/orders'
import { getStripe } from '@/lib/stripe'
import { toCatalogProduct } from '@/lib/catalogProducts'
import { getSupabaseServiceClient } from '@/lib/supabase/server'
import type { CartItem } from '@/types/cart'
import type { Product } from '@/types/product'

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

function normalizeCartItems(items: CartItem[], productMap: Record<string, Product>): PersistedOrderItem[] {
  return items.map((item) => {
    const product = productMap[item.product_id]

    if (!product) {
      throw new Error(`Produit manquant pour ${item.product_id}`)
    }

    const patches = Array.isArray(item.patches) ? item.patches.filter(Boolean) : []
    const patchNames = Array.isArray(item.patch_names) ? item.patch_names.filter(Boolean) : []
    const flocageName = item.flocage_name?.trim() || null
    const flocageNumber = item.flocage_number?.trim() || null
    const qty = Number.isFinite(item.qty) && item.qty > 0 ? Math.floor(item.qty) : 1
    const basePrice = getProductPricing({
      isRetro: product.is_retro,
      isConcept: product.is_concept,
      productKind: product.product_kind,
      jerseyVersion: product.jersey_version,
    }).currentPrice
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
  let email = ''
  let marketingOptIn = false
  let attribution: AttributionPayload = {}

  try {
    const body = await request.json()
    items = body.items
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    marketingOptIn = body.marketingOptIn === true
    attribution = normalizeAttributionPayload(body.attribution)
  } catch {
    return NextResponse.json({ error: 'Body invalide' }, { status: 400 })
  }

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'Panier vide' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  }

  const productIds = [...new Set(items.map((item) => item.product_id))]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabaseServiceClient() as any
  const { data: products, error: dbError } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds)

  if (dbError || !products) {
    return NextResponse.json({ error: 'Erreur base de donnees' }, { status: 500 })
  }

  const productMap: Record<string, Product> = {}
  for (const product of products) {
    const normalizedProduct = toCatalogProduct(product as Product & { manual_override?: unknown })
    productMap[normalizedProduct.id] = normalizedProduct
  }

  const normalizedItems = normalizeCartItems(items, productMap)
  const pricing = calculateCartPricing(normalizedItems)
  const itemCount = pricing.itemCount
  const shippingAmount = pricing.shipping
  const orderTotal = pricing.total
  const stripe = getStripe()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin
  const orderNumber = generateOrderNumber()
  const publicTrackingToken = generatePublicTrackingToken()
  const sourceChannel = deriveSourceChannel({
    utmSource: attribution.utm_source ?? null,
    sourceChannel: attribution.source_channel ?? null,
  })
  const now = new Date().toISOString()

  const { data: pendingOrder, error: insertError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      public_tracking_token: publicTrackingToken,
      status: 'pending',
      customer_email: email,
      items: normalizedItems,
      total_amount: orderTotal,
      marketing_opt_in: marketingOptIn,
      utm_source: attribution.utm_source ?? null,
      utm_medium: attribution.utm_medium ?? null,
      utm_campaign: attribution.utm_campaign ?? null,
      utm_content: attribution.utm_content ?? null,
      source_channel: sourceChannel,
    })
    .select('id, order_number, public_tracking_token')
    .single()

  if (insertError || !pendingOrder) {
    console.error('Order insert error:', insertError)
    return NextResponse.json({ error: 'Erreur commande' }, { status: 500 })
  }

  try {
    await supabase
      .from('checkout_leads')
      .upsert({
        email,
        marketing_opt_in: marketingOptIn,
        source_channel: sourceChannel,
        utm_source: attribution.utm_source ?? null,
        utm_medium: attribution.utm_medium ?? null,
        utm_campaign: attribution.utm_campaign ?? null,
        utm_content: attribution.utm_content ?? null,
        cart_snapshot: normalizedItems,
        updated_at: now,
        last_checkout_started_at: now,
      }, { onConflict: 'email' })

    if (marketingOptIn) {
      await syncLeadToBrevo({ email, marketingOptIn })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      allow_promotion_codes: true,
      locale: 'fr',
      client_reference_id: pendingOrder.id,
      customer_email: email,
      line_items: [
        ...pricing.discountedUnitGroups.map((group) => {
          const item = normalizedItems[group.sourceIndex]

          return {
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
              unit_amount: Math.round(group.unitAmount * 100),
            },
            quantity: group.quantity,
          }
        }),
        ...(shippingAmount > 0
          ? [
              {
                price_data: {
                  currency: 'eur',
                  product_data: {
                    name: 'Livraison',
                    description: `Offerte des ${FREE_SHIPPING_THRESHOLD} EUR d achats`,
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
        order_number: pendingOrder.order_number,
        public_tracking_token: pendingOrder.public_tracking_token,
        item_count: String(itemCount),
        shipping_amount: String(shippingAmount),
        marketing_opt_in: marketingOptIn ? 'true' : 'false',
        source_channel: sourceChannel,
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
