'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'

type AuthUserResult = {
  data: {
    user: User | null
  }
}

export function AuthAccountLink() {
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let unsubscribe: (() => void) | undefined
    const timer = window.setTimeout(() => {
      void import('@/lib/supabase/client').then(({ getSupabaseBrowserClient }) => {
        if (cancelled) return

        const supabase = getSupabaseBrowserClient()

        void supabase.auth.getUser().then(({ data }: AuthUserResult) => {
          if (!cancelled) {
            setUserEmail(data.user?.email ?? null)
          }
        })

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
          setUserEmail(session?.user?.email ?? null)
        })
        unsubscribe = () => subscription.unsubscribe()
      })
    }, 1200)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      unsubscribe?.()
    }
  }, [])

  return (
    <Link
      href="/compte"
      className="hidden rounded-full border border-[var(--black)] px-5 py-2 text-[14px] font-bold text-[var(--black)] transition-all hover:bg-[var(--black)] hover:text-white md:inline-flex"
    >
      {userEmail ? 'Mon Compte' : 'Se Connecter'}
    </Link>
  )
}
