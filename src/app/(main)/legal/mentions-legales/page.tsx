import Link from 'next/link'
import { LegalPageLayout, LegalSection } from '@/components/legal/LegalPageLayout'
import {
  CONTACT_PAGE_PATH,
  LEGAL_BRAND_NAME,
  LEGAL_COMPANY_ADDRESS,
  LEGAL_COMPANY_CAPITAL,
  LEGAL_COMPANY_FORM,
  LEGAL_COMPANY_NAME,
  LEGAL_COMPANY_SIREN,
  LEGAL_COMPANY_VAT,
  LEGAL_CONTACT_EMAIL,
  LEGAL_CONTACT_PHONE,
  LEGAL_HOST_ADDRESS,
  LEGAL_HOST_NAME,
  LEGAL_INFRASTRUCTURE_ITEMS,
  LEGAL_PUBLICATION_DIRECTOR,
  isLegalPlaceholder,
} from '@/lib/legal'

const LEGAL_ROWS = [
  ['Nom commercial', LEGAL_BRAND_NAME],
  ['Exploitant du site', LEGAL_COMPANY_NAME],
  ['Forme juridique', LEGAL_COMPANY_FORM],
  ['Capital social', LEGAL_COMPANY_CAPITAL],
  ['Siège social', LEGAL_COMPANY_ADDRESS],
  ['SIREN / SIRET', LEGAL_COMPANY_SIREN],
  ['TVA intracommunautaire', LEGAL_COMPANY_VAT],
  ['Responsable de la publication', LEGAL_PUBLICATION_DIRECTOR],
] as const

const HOST_ROWS = [
  ['Nom de l’hébergeur', LEGAL_HOST_NAME],
  ['Adresse de l’hébergeur', LEGAL_HOST_ADDRESS],
] as const

const visibleLegalRows = LEGAL_ROWS.filter(([, value]) => !isLegalPlaceholder(value))
const visibleHostRows = HOST_ROWS.filter(([, value]) => !isLegalPlaceholder(value))

export const metadata = { title: 'Mentions légales' }

export default function MentionsLegalesPage() {
  return (
    <LegalPageLayout
      currentPath="/legal/mentions-legales"
      title="Mentions légales"
      intro="Cette page regroupe les informations d’identification de l’éditeur du site, les éléments d’hébergement ainsi que les règles d’usage applicables à Maillot Addict."
    >
      <LegalSection title="Éditeur du site">
        <dl className="grid gap-3">
          {visibleLegalRows.map(([label, value]) => (
            <div key={label} className="grid gap-1 md:grid-cols-[220px_1fr] md:gap-4">
              <dt className="font-condensed uppercase tracking-[0.12em] text-[var(--black)]">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Le service client est joignable via la{' '}
          <Link href={CONTACT_PAGE_PATH} className="font-semibold text-[var(--terra)] underline underline-offset-4">
            page contact
          </Link>
          .
        </p>
        {LEGAL_CONTACT_EMAIL ? <p>Email: {LEGAL_CONTACT_EMAIL}</p> : null}
        {LEGAL_CONTACT_PHONE ? <p>Téléphone: {LEGAL_CONTACT_PHONE}</p> : null}
      </LegalSection>

      <LegalSection title="Hébergement">
        <dl className="grid gap-3">
          {visibleHostRows.map(([label, value]) => (
            <div key={label} className="grid gap-1 md:grid-cols-[220px_1fr] md:gap-4">
              <dt className="font-condensed uppercase tracking-[0.12em] text-[var(--black)]">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </LegalSection>

      <LegalSection title="Infrastructure technique">
        <dl className="grid gap-3">
          {LEGAL_INFRASTRUCTURE_ITEMS.map(([label, value]) => (
            <div key={label} className="grid gap-1 md:grid-cols-[220px_1fr] md:gap-4">
              <dt className="font-condensed uppercase tracking-[0.12em] text-[var(--black)]">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L’ensemble des éléments présents sur le site Maillot Addict, notamment les textes, visuels, photographies,
          éléments graphiques, logos et contenus éditoriaux, est protégé par les règles applicables en matière de
          propriété intellectuelle.
        </p>
        <p>
          Toute reproduction, représentation, adaptation ou exploitation, totale ou partielle, sans autorisation
          préalable, est interdite.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
