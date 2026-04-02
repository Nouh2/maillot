import { getLeagues } from '@/lib/supabase/queries'
import { NavbarClient } from './NavbarClient'

export async function Navbar() {
  const leagues = await getLeagues()
  return <NavbarClient leagues={leagues} />
}
