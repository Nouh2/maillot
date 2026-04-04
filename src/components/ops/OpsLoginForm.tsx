'use client'

import { FormEvent, useState } from 'react'

export function OpsLoginForm({ defaultUsername }: { defaultUsername: string }) {
  const [username, setUsername] = useState(defaultUsername)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/internal/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setError(data?.error ?? 'Connexion impossible')
        return
      }

      window.location.href = '/ops'
    } catch {
      setError('Connexion impossible')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block font-condensed text-xs uppercase tracking-[0.18em] text-[var(--grey)]">Identifiant</label>
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="w-full rounded-2xl border border-[var(--cream-3)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)]"
          autoCapitalize="off"
          autoCorrect="off"
          required
        />
      </div>

      <div>
        <label className="mb-2 block font-condensed text-xs uppercase tracking-[0.18em] text-[var(--grey)]">Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-[var(--cream-3)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)]"
          required
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-full bg-[var(--black)] px-5 py-3 font-condensed text-sm uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--terra)] disabled:opacity-60"
      >
        {loading ? 'Connexion...' : 'Ouvrir la webapp'}
      </button>
    </form>
  )
}
