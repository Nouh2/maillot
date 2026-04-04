import Link from 'next/link'
import { LegalPageLayout, LegalSection } from '@/components/legal/LegalPageLayout'
import { CONTACT_PAGE_PATH, LEGAL_INFRASTRUCTURE_ITEMS } from '@/lib/legal'

export const metadata = { title: 'Politique de confidentialite' }

export default function ConfidentialitePage() {
  return (
    <LegalPageLayout
      currentPath="/legal/confidentialite"
      title="Politique de confidentialite"
      intro="Cette page decrit les principales donnees traitees dans le cadre de l utilisation du site Maillot Addict et des commandes passees sur la boutique."
    >
      <LegalSection title="1. Donnees collectees">
        <p>
          Maillot Addict peut collecter les informations necessaires a la creation de compte, au traitement des commandes, a la livraison, au suivi des demandes client et au bon fonctionnement du site.
        </p>
        <p>
          Cela inclut notamment les informations d identite et de contact, l adresse de livraison, le contenu de la commande, ainsi que des donnees techniques liees a la navigation et au panier.
        </p>
      </LegalSection>

      <LegalSection title="2. Utilisation des donnees">
        <p>Les donnees collectees sont utilisees pour :</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>traiter, confirmer et suivre les commandes,</li>
          <li>gerer les demandes du service client,</li>
          <li>permettre l acces au compte client,</li>
          <li>securiser le site et prevenir les usages frauduleux.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Paiement">
        <p>
          Les paiements sont traites par un prestataire securise. Les donnees bancaires du client ne sont pas stockees directement par Maillot Addict.
        </p>
      </LegalSection>

      <LegalSection title="4. Destinataires des donnees">
        <p>
          Les donnees peuvent etre transmises, dans la stricte limite du necessaire, aux prestataires techniques impliques dans le fonctionnement du site, au prestataire de paiement et aux partenaires charges de la livraison et du suivi des commandes.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          {LEGAL_INFRASTRUCTURE_ITEMS.map(([label, value]) => (
            <li key={label}>
              {label}: {value}
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="5. Conservation">
        <p>
          Les donnees sont conservees pendant la duree necessaire au traitement de la commande, a la relation client et au respect des obligations legales et comptables applicables.
        </p>
      </LegalSection>

      <LegalSection title="6. Droits des utilisateurs">
        <p>
          Le client peut demander l acces, la rectification ou la suppression de ses donnees en contactant Maillot Addict via la{' '}
          <Link href={CONTACT_PAGE_PATH} className="font-semibold text-[var(--terra)] underline underline-offset-4">
            page contact
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="7. Cookies">
        <p>
          Le site utilise les cookies strictement necessaires au fonctionnement de la navigation, du panier et de l espace client.
        </p>
        <p>
          Les cookies de mesure d audience et d attribution marketing ne sont actives qu apres acceptation via la bannière de consentement.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
