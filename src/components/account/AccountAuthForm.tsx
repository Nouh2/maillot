'use client'

import { FormEvent, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

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

    setStatus('sent')
    setMessage('Lien magique envoye. Verifie ta boite mail puis reviens sur ton compte.')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-2 block font-condensed text-xs tracking-[0.28em] uppercase text-[var(--grey)]">
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
        className="inline-flex w-full items-center justify-center rounded-full bg-[var(--terra)] px-5 py-3 font-condensed text-sm tracking-[0.24em] uppercase text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'loading' ? 'Envoi...' : 'Recevoir le lien magique'}
      </button>

      {message && (
        <p className={`text-sm ${status === 'error' ? 'text-red-600' : 'text-[var(--grey)]'}`}>
          {message}
        </p>
      )}
    </form>
  )
}
