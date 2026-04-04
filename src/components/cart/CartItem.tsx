'use client'

import { ExternalProductImage } from '@/components/ui/ExternalProductImage'
import { useCartStore } from '@/store/cart'
import { formatEuro } from '@/lib/cartPricing'
import { normalizeProductTextSeasons } from '@/lib/season'
import type { CartItem as CartItemType } from '@/types/cart'

export function CartItem({ item }: { item: CartItemType }) {
  const { removeItem, updateQty } = useCartStore()
  const displayName = normalizeProductTextSeasons(item.name)

  return (
    <div className="flex gap-4 border-b border-[var(--cream-3)] py-4">
      <div className="relative h-24 w-20 flex-shrink-0 bg-[var(--cream)]">
        <ExternalProductImage src={item.photo} alt={displayName} fill unoptimized fallbackMode="proxy" bunnyTransform="cart" sizes="80px" className="object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-condensed text-sm uppercase tracking-wide text-[var(--black)]">{displayName}</p>
        <p className="mt-0.5 text-xs text-[var(--grey)]">
          Taille: {item.size}
          {item.patch_names?.length > 0 ? ` | Patch: ${item.patch_names.join(', ')}` : ''}
        </p>

        {item.flocage_name || item.flocage_number ? (
          <p className="mt-0.5 text-xs font-medium text-[var(--terra)]">
            Flocage: {item.flocage_name} {item.flocage_number ? `#${item.flocage_number}` : ''}
          </p>
        ) : null}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center border border-[var(--cream-3)]">
            <button
              aria-label="Diminuer la quantite"
              onClick={() => updateQty(item, item.qty - 1)}
              className="px-2 py-1 hover:bg-[var(--cream)]"
            >
              -
            </button>
            <span className="px-3 py-1 text-sm">{item.qty}</span>
            <button
              aria-label="Augmenter la quantite"
              onClick={() => updateQty(item, item.qty + 1)}
              className="px-2 py-1 hover:bg-[var(--cream)]"
            >
              +
            </button>
          </div>

          <p className="font-condensed font-semibold">{formatEuro(item.price * item.qty)}</p>
        </div>
      </div>

      <button
        aria-label={`Supprimer ${displayName} du panier`}
        onClick={() => removeItem(item)}
        className="flex-shrink-0 text-[var(--grey)] transition-colors hover:text-[var(--terra)]"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
