import { LazyCartDrawer } from '@/components/cart/LazyCartDrawer'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { Ticker } from '@/components/layout/Ticker'
import { getPackSuggestionProducts } from '@/lib/supabase/queries'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const packSuggestions = await getPackSuggestionProducts(null, 6)

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Navbar />
      <Ticker />
      <LazyCartDrawer packSuggestions={packSuggestions} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
      <Footer />
    </div>
  )
}
