import Link from 'next/link'
import { LEGAL_NAV_ITEMS } from '@/lib/legal'

export function Footer() {
  return (
    <footer className="mt-auto bg-[var(--black-2)] text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <p className="mb-4 font-bebas text-3xl tracking-widest">MAILLOT ADDICT</p>
          <p className="text-sm leading-relaxed text-[var(--grey-lt)]">
            Maillots de football premium pour tous les clubs et toutes les ligues.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-condensed text-xs uppercase tracking-[3px] text-[var(--grey-lt)]">Boutique</h3>
          <ul className="space-y-2">
            {[
              ['Tous les maillots', '/shop'],
              ['Maillots concept', '/concept'],
              ['Ligue 1', '/ligue/ligue-1'],
              ['Premier League', '/ligue/premier-league'],
              ['La Liga', '/ligue/la-liga'],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="text-sm text-[var(--grey-lt)] transition-colors hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-condensed text-xs uppercase tracking-[3px] text-[var(--grey-lt)]">Aide</h3>
          <ul className="space-y-2">
            {[
              ['FAQ', '/faq'],
              ['Suivi de commande', '/suivi'],
              ['Nous contacter', '/contact'],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="text-sm text-[var(--grey-lt)] transition-colors hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-condensed text-xs uppercase tracking-[3px] text-[var(--grey-lt)]">Legal</h3>
          <ul className="space-y-2">
            {LEGAL_NAV_ITEMS.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} className="text-sm text-[var(--grey-lt)] transition-colors hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 border-t border-white/10 px-4 py-4 sm:flex-row sm:px-6">
        <p className="text-xs text-[var(--grey-lt)]">© {new Date().getFullYear()} MAILLOT ADDICT - Tous droits reserves</p>
        <div className="flex items-center gap-3">
          {['Visa', 'Mastercard', 'CB'].map((provider) => (
            <span
              key={provider}
              className="border border-white/20 px-2 py-0.5 text-xs font-condensed tracking-wider text-[var(--grey-lt)]"
            >
              {provider}
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}
