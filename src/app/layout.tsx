import type { Metadata } from 'next'
import { Barlow, Barlow_Condensed, Bebas_Neue } from 'next/font/google'
import './globals.css'

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
})
const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})
const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'KITLAB — Maillots de Football Premium',
    template: '%s | KITLAB',
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
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
