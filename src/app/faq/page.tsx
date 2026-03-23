const FAQ_ITEMS = [
  { q: 'Quels sont les délais de livraison ?', a: "Nous expédions sous 24-48h. Comptez 3-7 jours ouvrés pour la livraison en France, 5-10 jours pour l'Europe." },
  { q: 'Quelle taille choisir ?', a: 'Les maillots taillent généralement grand. Si vous êtes entre deux tailles, choisissez la plus petite. Consultez notre guide des tailles pour plus de détails.' },
  { q: 'Comment fonctionne le système de patchs ?', a: "Les patchs (LDC, Coupe de France, FA Cup...) sont disponibles selon l'éligibilité du club. Vous pouvez les ajouter lors de l'achat." },
  { q: 'Puis-je retourner mon maillot ?', a: 'Oui, les retours sont acceptés sous 14 jours suivant la réception, en état neuf avec les étiquettes.' },
  { q: 'Comment suivre ma commande ?', a: 'Vous recevrez un email avec le numéro de suivi dès l\'expédition de votre commande.' },
]

export const metadata = { title: 'FAQ' }

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-bebas text-6xl text-[var(--black)] mb-12">QUESTIONS FRÉQUENTES</h1>
        <div className="space-y-6">
          {FAQ_ITEMS.map((item) => (
            <div key={item.q} className="border border-[var(--cream-3)] bg-white p-6">
              <h2 className="font-condensed text-base font-semibold tracking-wide text-[var(--black)] mb-3">{item.q}</h2>
              <p className="text-[var(--grey)] text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
