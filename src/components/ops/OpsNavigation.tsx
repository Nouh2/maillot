'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const OPS_LINKS = [
  { href: '/ops', label: 'Commandes' },
  { href: '/ops/catalogue', label: 'Catalogue' },
  { href: '/ops/emails', label: 'Emails' },
]

export function OpsNavigation() {
  const pathname = usePathname()

  return (
    <nav className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-3">
      <div className="flex flex-wrap gap-2">
        {OPS_LINKS.map((link) => {
          const isActive = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-xs font-condensed uppercase tracking-[0.16em] transition-colors ${
                isActive
                  ? 'bg-[var(--black)] text-white'
                  : 'border border-[var(--cream-3)] text-[var(--black)]'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
