'use client'

import { usePathname } from 'next/navigation'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { Ticker } from '@/components/layout/Ticker'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isOps = pathname.startsWith('/ops')

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      {!isOps && <Navbar />}
      {!isOps && <Ticker />}
      {!isOps && <CartDrawer />}
      <main className="flex-1 overflow-x-hidden">{children}</main>
      {!isOps && <Footer />}
    </div>
  )
}
