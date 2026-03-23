import { getLeagues } from '@/lib/supabase/queries'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { NavbarClient } from './NavbarClient'

export async function Navbar() {
  const [leagues, supabase] = await Promise.all([
    getLeagues(),
    getSupabaseServerClient(),
  ])
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <NavbarClient leagues={leagues} userEmail={user?.email ?? null} />
}
