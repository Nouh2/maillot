'use client'
import Image from 'next/image'
import { useCartStore } from '@/store/cart'
import { proxyImage } from '@/lib/images'
import type { CartItem as CartItemType } from '@/types/cart'

export function CartItem({ item }: { item: CartItemType }) {
  const { removeItem, updateQty } = useCartStore()

  return (
    <div className="flex gap-4 py-4 border-b border-[var(--cream-3)]">
      <div className="relative w-20 h-24 bg-[var(--cream)] flex-shrink-0">
        <Image src={proxyImage(item.photo)} alt={item.name} fill unoptimized sizes="80px" className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-condensed text-sm tracking-wide uppercase text-[var(--black)] truncate">{item.name}</p>
        <p className="text-xs text-[var(--grey)] mt-0.5">
          Taille: {item.size}
          {item.patch_names?.length > 0 && ` · Patch: ${item.patch_names.join(', ')}`}
        </p>
        {(item.flocage_name || item.flocage_number) && (
          <p className="text-xs text-[var(--terra)] mt-0.5 font-medium">
            Flocage: {item.flocage_name} {item.flocage_number && `#${item.flocage_number}`}
          </p>
        )}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-[var(--cream-3)]">
            <button aria-label="Diminuer la quantité" onClick={() => updateQty(item, item.qty - 1)} className="px-2 py-1 hover:bg-[var(--cream)]">-</button>
            <span className="px-3 py-1 text-sm">{item.qty}</span>
            <button aria-label="Augmenter la quantité" onClick={() => updateQty(item, item.qty + 1)} className="px-2 py-1 hover:bg-[var(--cream)]">+</button>
          </div>
          <p className="font-condensed font-semibold">{(item.price * item.qty).toFixed(2)} €</p>
        </div>
      </div>
      <button aria-label={`Supprimer ${item.name} du panier`} onClick={() => removeItem(item)} className="text-[var(--grey)] hover:text-[var(--terra)] transition-colors flex-shrink-0">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
