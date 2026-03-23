'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export default function SuiviPage() {
  const [email, setEmail] = useState('')
  const [orderId, setOrderId] = useState('')

  return (
    <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-6 py-16">
        <h1 className="font-bebas text-5xl text-[var(--black)] mb-2">SUIVI DE COMMANDE</h1>
        <p className="text-[var(--grey)] text-sm mb-8">Entrez votre email et numéro de commande</p>
        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre email"
            className="w-full border border-[var(--cream-3)] px-4 py-3 bg-white font-condensed text-sm focus:border-[var(--terra)] outline-none"
          />
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Numéro de commande"
            className="w-full border border-[var(--cream-3)] px-4 py-3 bg-white font-condensed text-sm focus:border-[var(--terra)] outline-none"
          />
          <Button size="lg" className="w-full">Suivre ma commande</Button>
        </div>
      </div>
    </div>
  )
}
