import { NextResponse } from 'next/server'
import { getOrdersForAccount, linkOrdersToUserAccount } from '@/lib/orders'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabaseAuth = await getSupabaseServerClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()

  if (!user?.email) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 })
  }

  await linkOrdersToUserAccount(user.id, user.email)
  const { data, error } = await getOrdersForAccount(user.id, user.email)

  if (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  return NextResponse.json({ orders: data })
}
