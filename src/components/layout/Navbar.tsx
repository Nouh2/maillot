import { getLeagues, getSearchSuggestions } from '@/lib/supabase/queries'
import { NavbarClient } from './NavbarClient'

export async function Navbar() {
  const [leagues, searchSuggestions] = await Promise.all([getLeagues(), getSearchSuggestions()])

  return <NavbarClient leagues={leagues} searchSuggestions={searchSuggestions} />
}
