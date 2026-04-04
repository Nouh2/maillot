'use client'

import { useState } from 'react'
import { trackEvent } from '@/lib/tracking'

type ContactFormValues = {
  name: string
  email: string
  orderNumber: string
  subject: string
  message: string
}

const INITIAL_VALUES: ContactFormValues = {
  name: '',
  email: '',
  orderNumber: '',
  subject: '',
  message: '',
}

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(INITIAL_VALUES)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setError(data?.error ?? 'Impossible d envoyer votre message pour le moment.')
        return
      }

      trackEvent('contact_form_submitted', {
        has_order_number: Boolean(values.orderNumber.trim()),
      })
      setSuccess('Votre message a bien ete envoye au service client.')
      setValues(INITIAL_VALUES)
    } catch {
      setError('Impossible d envoyer votre message pour le moment.')
    } finally {
      setLoading(false)
    }
  }

  function updateValue<K extends keyof ContactFormValues>(key: K, value: ContactFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-condensed text-xs uppercase tracking-[0.28em] text-[var(--grey)]">Nom</label>
          <input
            type="text"
            value={values.name}
            onChange={(event) => updateValue('name', event.target.value)}
            required
            maxLength={120}
            className="w-full border border-[var(--cream-3)] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)]"
          />
        </div>

        <div>
          <label className="mb-2 block font-condensed text-xs uppercase tracking-[0.28em] text-[var(--grey)]">Email</label>
          <input
            type="email"
            value={values.email}
            onChange={(event) => updateValue('email', event.target.value)}
            required
            maxLength={160}
            placeholder="vous@exemple.com"
            className="w-full border border-[var(--cream-3)] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)]"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div>
          <label className="mb-2 block font-condensed text-xs uppercase tracking-[0.28em] text-[var(--grey)]">Sujet</label>
          <input
            type="text"
            value={values.subject}
            onChange={(event) => updateValue('subject', event.target.value)}
            required
            maxLength={140}
            className="w-full border border-[var(--cream-3)] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)]"
          />
        </div>

        <div>
          <label className="mb-2 block font-condensed text-xs uppercase tracking-[0.28em] text-[var(--grey)]">No commande</label>
          <input
            type="text"
            value={values.orderNumber}
            onChange={(event) => updateValue('orderNumber', event.target.value)}
            maxLength={80}
            placeholder="Optionnel"
            className="w-full border border-[var(--cream-3)] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)]"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block font-condensed text-xs uppercase tracking-[0.28em] text-[var(--grey)]">Message</label>
        <textarea
          value={values.message}
          onChange={(event) => updateValue('message', event.target.value)}
          required
          maxLength={2000}
          rows={7}
          className="w-full resize-y border border-[var(--cream-3)] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)]"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-green-700">{success}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center bg-[var(--terra)] px-6 py-3 font-condensed text-sm uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--black)] disabled:opacity-60"
      >
        {loading ? 'Envoi...' : 'Envoyer'}
      </button>
    </form>
  )
}
