import { Badge } from '@/components/ui/Badge'
import { getProductFamily, getProductFamilyLabel } from '@/lib/productLabels'
import type { Product } from '@/types/product'

type ProductFamilyBadgeProps = {
  product: Pick<Product, 'product_kind' | 'jersey_version' | 'is_retro' | 'is_concept'>
  className?: string
}

const FAMILY_BADGE_CLASSES: Record<ReturnType<typeof getProductFamily>, string> = {
  fan: 'bg-[#eef8ee] text-[#24723b] border-[#b9dfc2]',
  player: 'bg-[var(--black)] text-white border-[var(--black)]',
  concept: 'bg-[#eef2ff] text-[#3f51b5] border-[#c7d2fe]',
  retro: 'bg-[var(--terra-lt)] text-[var(--terra)] border-[var(--terra-mid)]',
  other: 'bg-white text-[var(--grey)] border-[var(--cream-3)]',
}

export function ProductFamilyBadge({ product, className }: ProductFamilyBadgeProps) {
  const family = getProductFamily(product)
  if (family === 'other') return null

  return (
    <Badge className={`${FAMILY_BADGE_CLASSES[family]} ${className ?? ''}`}>
      {getProductFamilyLabel(product)}
    </Badge>
  )
}
