import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { SHIPPING_DELAY_LABEL } from '@/lib/siteConfig'

export const metadata = { title: 'Commande confirmee' }

export default function OrderConfirmedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--cream)]">
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <div className="mb-6 text-7xl">✓</div>
        <h1 className="mb-4 font-bebas text-5xl text-[var(--black)] md:text-6xl">COMMANDE CONFIRMEE</h1>
        <p className="mb-2 leading-relaxed text-[var(--grey)]">
          Merci pour votre commande ! Vous allez recevoir un email de confirmation.
        </p>
        <p className="mb-8 text-sm text-[var(--grey)]">
          {SHIPPING_DELAY_LABEL} · Suivi par email
        </p>
        <Link href="/shop">
          <Button size="lg">Continuer mes achats</Button>
        </Link>
      </div>
    </div>
  )
}
