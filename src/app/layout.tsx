import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import { Barlow, Barlow_Condensed, Bebas_Neue } from 'next/font/google'
import './globals.css'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { Ticker } from '@/components/layout/Ticker'
import { Providers } from '@/components/providers/Providers'

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
  themeColor: '#111111',
}

export const metadata: Metadata = {
  title: {
    default: "MAILLOT ADDICT — Maillots de Football Premium",
    template: "%s | MAILLOT ADDICT",
  },
  description: 'Maillots de football premium pour tous les clubs. Livraison estimee de 7 a 12 jours ouvres.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/logohead.jpg',
    apple: '/logohead.jpg',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = (await headers()).get('x-pathname') ?? ''
  const isOpsRoute = pathname.startsWith('/ops')

  return (
    <html
      lang="fr"
      className={`${barlow.variable} ${barlowCondensed.variable} ${bebasNeue.variable}`}
    >
      <body className="antialiased overflow-x-hidden">
        <Providers>
          <div className="flex min-h-screen flex-col overflow-x-hidden">
            {isOpsRoute ? null : <Navbar />}
            {isOpsRoute ? null : <Ticker />}
            {isOpsRoute ? null : <CartDrawer />}
            <main className="flex-1 overflow-x-hidden">{children}</main>
            {isOpsRoute ? null : <Footer />}
          </div>
        </Providers>
      </body>
    </html>
  )
}
