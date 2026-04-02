import Link from 'next/link'
import type { ReactNode } from 'react'
import { LEGAL_NAV_ITEMS } from '@/lib/legal'
import { cn } from '@/lib/utils'

interface LegalPageLayoutProps {
  title: string
  intro: string
  currentPath: string
  children: ReactNode
}

interface LegalSectionProps {
  title: string
  children: ReactNode
  className?: string
}

export function LegalPageLayout({ title, intro, currentPath, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="bg-[var(--black-2)]">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 md:py-16">
          <p className="mb-3 font-condensed text-xs uppercase tracking-[0.32em] text-[var(--terra-mid)]">
            Informations legales
          </p>
          <h1 className="font-bebas text-5xl text-white md:text-6xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--grey-lt)] md:text-base">
            {intro}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-10">
        <div className="mb-8 flex flex-wrap gap-2">
          {LEGAL_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-full border px-4 py-2 font-condensed text-xs uppercase tracking-[0.18em] transition-colors',
                item.href === currentPath
                  ? 'border-[var(--black)] bg-[var(--black)] text-white'
                  : 'border-[var(--cream-3)] bg-white text-[var(--grey)] hover:border-[var(--black)] hover:text-[var(--black)]',
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="space-y-6">{children}</div>
      </div>
    </div>
  )
}

export function LegalSection({ title, children, className }: LegalSectionProps) {
  return (
    <section className={cn('border border-[var(--cream-3)] bg-white p-6 md:p-8', className)}>
      <h2 className="mb-4 font-condensed text-lg font-bold uppercase tracking-[0.16em] text-[var(--black)]">
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-[var(--grey)] md:text-[15px]">
        {children}
      </div>
    </section>
  )
}
