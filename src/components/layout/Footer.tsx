import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[var(--black-2)] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <p className="font-bebas text-3xl tracking-widest mb-4">MAILLOT ADDICT</p>
          <p className="text-[var(--grey-lt)] text-sm leading-relaxed">
            Maillots de football premium pour tous les clubs et toutes les ligues.
          </p>
        </div>
        <div>
          <h3 className="font-condensed text-xs tracking-[3px] uppercase text-[var(--grey-lt)] mb-4">Boutique</h3>
          <ul className="space-y-2">
            {[['Tous les maillots', '/shop'], ['Maillots concept', '/concept'], ['Ligue 1', '/ligue/ligue-1'], ['Premier League', '/ligue/premier-league'], ['La Liga', '/ligue/la-liga']].map(([label, href]) => (
              <li key={href}><Link href={href} className="text-sm text-[var(--grey-lt)] hover:text-white transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-condensed text-xs tracking-[3px] uppercase text-[var(--grey-lt)] mb-4">Aide</h3>
          <ul className="space-y-2">
            {[['FAQ', '/faq'], ['Suivi de commande', '/suivi'], ['Nous contacter', '/contact']].map(([label, href]) => (
              <li key={href}><Link href={href} className="text-sm text-[var(--grey-lt)] hover:text-white transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-condensed text-xs tracking-[3px] uppercase text-[var(--grey-lt)] mb-4">Légal</h3>
          <ul className="space-y-2">
            {[['CGV', '/legal/cgv'], ['Mentions légales', '/legal/mentions-legales'], ['Confidentialité', '/legal/confidentialite'], ['Livraison', '/legal/livraison']].map(([label, href]) => (
              <li key={href}><Link href={href} className="text-sm text-[var(--grey-lt)] hover:text-white transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="text-xs text-[var(--grey-lt)]">© {new Date().getFullYear()} MAILLOT ADDICT — Tous droits réservés</p>
        <div className="flex items-center gap-3">
          {['Visa', 'Mastercard', 'CB', 'PayPal'].map((p) => (
            <span key={p} className="text-xs font-condensed tracking-wider text-[var(--grey-lt)] border border-white/20 px-2 py-0.5">{p}</span>
          ))}
        </div>
      </div>
    </footer>
  )
}
