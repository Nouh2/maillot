import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export const metadata = { title: 'Commande confirmée' }

export default function OrderConfirmedPage() {
  return (
    <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
      <div className="max-w-lg mx-auto px-6 text-center py-20">
        <div className="text-7xl mb-6">✅</div>
        <h1 className="font-bebas text-5xl md:text-6xl text-[var(--black)] mb-4">
          COMMANDE CONFIRMÉE
        </h1>
        <p className="text-[var(--grey)] leading-relaxed mb-2">
          Merci pour votre commande ! Vous allez recevoir un email de confirmation.
        </p>
        <p className="text-[var(--grey)] text-sm mb-8">
          Expédition sous 24-48h · Suivi par email
        </p>
        <Link href="/shop">
          <Button size="lg">Continuer mes achats</Button>
        </Link>
      </div>
    </div>
  )
}
