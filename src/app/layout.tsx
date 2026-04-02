import type { Metadata, Viewport } from 'next'
import { Barlow, Barlow_Condensed, Bebas_Neue } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Ticker } from '@/components/layout/Ticker'
import { CartDrawer } from '@/components/cart/CartDrawer'

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
})
const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})
const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: "MAILLOT ADDICT — Maillots de Football Premium",
    template: "%s | MAILLOT ADDICT",
  },
  description: 'Maillots de football premium pour tous les clubs. Livraison rapide en France et en Europe.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="fr"
      className={`${barlow.variable} ${barlowCondensed.variable} ${bebasNeue.variable}`}
    >
      <body className="antialiased overflow-x-hidden">
        <Providers>
          <div className="flex min-h-screen flex-col overflow-x-hidden">
            <Navbar />
            <Ticker />
            <CartDrawer />
            <main className="flex-1 overflow-x-hidden">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
