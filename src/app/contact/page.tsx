import Link from 'next/link'
import { Mail, PackageSearch, ShieldCheck } from 'lucide-react'
import { ContactForm } from '@/components/contact/ContactForm'
import { LegalSection } from '@/components/legal/LegalPageLayout'
import { LEGAL_CONTACT_EMAIL, LEGAL_CONTACT_PHONE } from '@/lib/legal'

const HELP_ITEMS = [
  {
    title: 'FAQ',
    description: 'Consultez les réponses aux questions les plus fréquentes avant de contacter le support.',
    href: '/faq',
  },
  {
    title: 'Suivi de commande',
    description: 'Retrouvez vos commandes et leur statut en quelques secondes avec votre email.',
    href: '/suivi',
  },
  {
    title: 'CGV',
    description: 'Consultez les conditions de vente, la livraison et les règles de personnalisation.',
    href: '/legal/cgv',
  },
] as const

export const metadata = { title: 'Contact' }

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="bg-[var(--black-2)]">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 md:py-16">
          <p className="mb-3 font-condensed text-xs uppercase tracking-[0.32em] text-[var(--terra-mid)]">Service client</p>
          <h1 className="font-bebas text-5xl text-white md:text-6xl">Contact</h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--grey-lt)] md:text-base">
            Une question sur une commande, un délai, un flocage ou un produit ? Utilisez le formulaire ci-dessous pour joindre le
            service client.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-10">
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {HELP_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border border-[var(--cream-3)] bg-white p-5 transition-colors hover:border-[var(--black)]"
            >
              <p className="font-condensed text-xs uppercase tracking-[0.2em] text-[var(--terra)]">{item.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--grey)]">{item.description}</p>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <LegalSection title="Envoyer un message">
            <p>Pour accélérer le traitement, indiquez votre numéro de commande si votre demande concerne une commande déjà passée.</p>
            <ContactForm />
          </LegalSection>

          <div className="space-y-6">
            <LegalSection title="Avant de nous écrire">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <PackageSearch className="mt-0.5 h-5 w-5 text-[var(--terra)]" />
                  <p>Pour une commande en cours, préparez votre email de commande et votre référence.</p>
                </div>
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-[var(--terra)]" />
                  <p>Les articles personnalisés ne peuvent pas être retournés sauf défaut produit ou erreur du vendeur.</p>
                </div>
                <div className="flex gap-3">
                  <Mail className="mt-0.5 h-5 w-5 text-[var(--terra)]" />
                  <p>Décrivez précisément votre demande pour obtenir une réponse plus rapide.</p>
                </div>
              </div>
            </LegalSection>

            {LEGAL_CONTACT_EMAIL || LEGAL_CONTACT_PHONE ? (
              <LegalSection title="Coordonnées directes">
                {LEGAL_CONTACT_EMAIL ? (
                  <p>
                    Email:{' '}
                    <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="font-semibold text-[var(--terra)] underline underline-offset-4">
                      {LEGAL_CONTACT_EMAIL}
                    </a>
                  </p>
                ) : null}
                {LEGAL_CONTACT_PHONE ? <p>Téléphone: {LEGAL_CONTACT_PHONE}</p> : null}
              </LegalSection>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
