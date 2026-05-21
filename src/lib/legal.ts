export const LEGAL_PLACEHOLDER = 'À compléter avant mise en ligne'

export const LEGAL_NAV_ITEMS = [
  { label: 'CGV', href: '/legal/cgv' },
  { label: 'Livraison', href: '/legal/livraison' },
  { label: 'Confidentialité', href: '/legal/confidentialite' },
  { label: 'Mentions légales', href: '/legal/mentions-legales' },
] as const

export const CONTACT_PAGE_PATH = '/contact'
export const LEGAL_BRAND_NAME = 'Maillot Addict'

export const LEGAL_COMPANY_NAME = process.env.NEXT_PUBLIC_LEGAL_COMPANY_NAME?.trim() || LEGAL_BRAND_NAME
export const LEGAL_COMPANY_FORM = process.env.NEXT_PUBLIC_LEGAL_COMPANY_FORM?.trim() || LEGAL_PLACEHOLDER
export const LEGAL_COMPANY_CAPITAL = process.env.NEXT_PUBLIC_LEGAL_COMPANY_CAPITAL?.trim() || LEGAL_PLACEHOLDER
export const LEGAL_COMPANY_ADDRESS = process.env.NEXT_PUBLIC_LEGAL_COMPANY_ADDRESS?.trim() || LEGAL_PLACEHOLDER
export const LEGAL_COMPANY_SIREN = process.env.NEXT_PUBLIC_LEGAL_COMPANY_SIREN?.trim() || LEGAL_PLACEHOLDER
export const LEGAL_COMPANY_VAT = process.env.NEXT_PUBLIC_LEGAL_COMPANY_VAT?.trim() || LEGAL_PLACEHOLDER
export const LEGAL_PUBLICATION_DIRECTOR = process.env.NEXT_PUBLIC_LEGAL_PUBLICATION_DIRECTOR?.trim() || LEGAL_PLACEHOLDER
export const LEGAL_HOST_NAME = 'Vercel'
export const LEGAL_HOST_ADDRESS = process.env.NEXT_PUBLIC_LEGAL_HOST_ADDRESS?.trim() || LEGAL_PLACEHOLDER
export const LEGAL_CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || ''
export const LEGAL_CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || ''

export const LEGAL_INFRASTRUCTURE_ITEMS = [
  ['Hebergement du front', 'Vercel'],
  ['Base de données', 'Supabase - infrastructure en Suisse'],
  ['Paiement', 'Stripe'],
  ['Nom de domaine', 'LWS'],
] as const

export function isLegalPlaceholder(value: string): boolean {
  return value === LEGAL_PLACEHOLDER
}
