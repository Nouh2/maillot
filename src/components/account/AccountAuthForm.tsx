'use client'

import { FormEvent, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { LOYALTY_CODE } from '@/lib/siteConfig'
import { trackEvent } from '@/lib/tracking'

export function AccountAuthForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setMessage(null)

    const supabase = getSupabaseBrowserClient()
    const redirectTo = `${window.location.origin}/auth/callback?next=/compte`
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    })

    if (error) {
      setStatus('error')
      setMessage(error.message)
      return
    }

    trackEvent('account_magic_link_requested', { email_domain: email.split('@')[1] ?? null })
    setStatus('sent')
    setMessage('Lien magique envoye. Verifie ta boite mail puis reviens sur ton compte.')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-2 block font-condensed text-xs uppercase tracking-[0.28em] text-[var(--grey)]">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="vous@exemple.com"
          className="w-full rounded-2xl border border-[var(--cream-3)] bg-white px-4 py-3 text-sm text-[var(--black)] outline-none transition-colors focus:border-[var(--terra)]"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex w-full items-center justify-center rounded-full bg-[var(--terra)] px-5 py-3 font-condensed text-sm uppercase tracking-[0.24em] text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'loading' ? 'Envoi...' : 'Recevoir le lien magique'}
      </button>

      <div className="rounded-2xl border border-[var(--terra)]/20 bg-[var(--terra-lt)] px-4 py-3 text-sm text-[var(--black)]">
        <p className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--terra)]">Offre fidelite</p>
        <p className="mt-1">
          Cree ton compte et beneficie de <strong>-10 %</strong> sur ta premiere commande avec le code <strong>{LOYALTY_CODE}</strong>, utilisable une seule fois par email.
        </p>
      </div>

      {message ? <p className={`text-sm ${status === 'error' ? 'text-red-600' : 'text-[var(--grey)]'}`}>{message}</p> : null}
    </form>
  )
}
