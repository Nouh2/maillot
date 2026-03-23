import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

// GET /api/orders?email=xxx  ou  /api/orders (utilisateur connecté)
export async function GET(request: NextRequest) {
  const supabaseAuth = await getSupabaseServerClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()

  const emailParam = request.nextUrl.searchParams.get('email')

  // Soit l'utilisateur est connecté, soit il fournit un email
  const email = user?.email ?? emailParam

  if (!email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 })
  }

  // Si l'email fourni en param ne correspond pas à l'utilisateur connecté → refus
  if (!user && emailParam) {
    // Accès public par email uniquement (pour /suivi) — on autorise
  } else if (user && emailParam && emailParam !== user.email) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const supabase = getSupabaseServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('orders')
    .select('id, status, total_amount, created_at, items, shipping_address')
    .eq('customer_email', email)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  return NextResponse.json({ orders: data })
}
