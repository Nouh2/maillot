const FAQ_ITEMS = [
  {
    q: 'Quels sont les délais de livraison ?',
    a: 'Les commandes sont généralement livrées dans un délai estimé de 7 à 12 jours ouvrés après traitement.',
  },
  {
    q: 'Quelle taille choisir ?',
    a: 'Les maillots taillent généralement grand. Si vous êtes entre deux tailles, choisissez la plus petite. Consultez notre guide des tailles pour plus de détails.',
  },
  {
    q: 'Comment fonctionne le système de patchs ?',
    a: 'Les patchs (LDC, Coupe de France, FA Cup...) sont disponibles selon l’éligibilité du club. Vous pouvez les ajouter lors de l’achat.',
  },
  {
    q: 'Puis-je retourner mon maillot ?',
    a: 'Oui, les retours sont acceptés sous 14 jours suivant la réception, en état neuf avec les étiquettes, hors articles personnalisés sauf défaut produit ou erreur du vendeur.',
  },
  {
    q: 'Comment suivre ma commande ?',
    a: 'Vous recevez un email de confirmation puis un lien de suivi unique. Vous pouvez aussi retrouver vos commandes dans votre compte avec le même email.',
  },
] as const

export const metadata = { title: 'FAQ' }

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="mb-12 font-bebas text-6xl text-[var(--black)]">QUESTIONS FRÉQUENTES</h1>
        <div className="space-y-6">
          {FAQ_ITEMS.map((item) => (
            <div key={item.q} className="border border-[var(--cream-3)] bg-white p-6">
              <h2 className="mb-3 font-condensed text-base font-semibold tracking-wide text-[var(--black)]">{item.q}</h2>
              <p className="text-sm leading-relaxed text-[var(--grey)]">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
