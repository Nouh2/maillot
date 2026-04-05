import { CartDrawer } from '@/components/cart/CartDrawer'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { Ticker } from '@/components/layout/Ticker'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Navbar />
      <Ticker />
      <CartDrawer />
      <main className="flex-1 overflow-x-hidden">{children}</main>
      <Footer />
    </div>
  )
}
