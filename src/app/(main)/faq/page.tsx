const FAQ_ITEMS = [
  {
    q: 'Quels sont les delais de livraison ?',
    a: 'Les commandes sont generalement livrees dans un delai estime de 7 a 12 jours ouvres apres traitement. La livraison est incluse dans le prix affiche.',
  },
  {
    q: 'Quelle taille choisir ?',
    a: 'Les maillots taillent generalement grand. Si vous etes entre deux tailles, choisissez la plus petite. Consultez notre guide des tailles pour plus de details.',
  },
  {
    q: 'Comment fonctionne le systeme de patchs ?',
    a: "Les patchs (LDC, Coupe de France, FA Cup...) sont disponibles selon l'eligibilite du club. Vous pouvez les ajouter lors de l'achat.",
  },
  {
    q: 'Comment fonctionne la remise pack ?',
    a: '2 maillots dans le panier donnent -5 EUR. Dès 3 maillots, le maillot le moins cher par tranche de 3 passe à -50%. La remise pack ne se cumule pas avec les codes promo : le meilleur avantage est appliqué.',
  },
  {
    q: 'Puis-je retourner mon maillot ?',
    a: 'Oui, les retours sont acceptes sous 14 jours suivant la reception, en etat neuf avec les etiquettes, hors articles personnalises sauf defaut produit ou erreur du vendeur.',
  },
  {
    q: 'Comment suivre ma commande ?',
    a: 'Vous recevez un email de confirmation puis un lien de suivi unique. Vous pouvez aussi retrouver vos commandes dans votre compte avec le meme email.',
  },
] as const

export const metadata = { title: 'FAQ' }

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="mb-12 font-bebas text-6xl text-[var(--black)]">QUESTIONS FREQUENTES</h1>
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
