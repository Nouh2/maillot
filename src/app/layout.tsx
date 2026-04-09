import type { Metadata, Viewport } from 'next'
import { Barlow, Barlow_Condensed, Bebas_Neue } from 'next/font/google'
import './globals.css'
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://www.maillotaddict.fr'),
  title: {
    default: 'MAILLOT ADDICT - Maillots de Football Premium',
    template: '%s | MAILLOT ADDICT',
  },
  description: 'Maillots de football premium pour tous les clubs. Livraison estimee de 7 a 12 jours ouvres.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
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
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
