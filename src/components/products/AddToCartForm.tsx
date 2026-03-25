'use client'
import { useState } from 'react'
import { Plus, Minus, Check } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { FLOCAGE_PRICE, calculateCartItemUnitPrice } from '@/lib/cartPricing'
import { SizeSelector } from './SizeSelector'
import { PatchSelector } from './PatchSelector'
import type { Product, Patch } from '@/types/product'

export function AddToCartForm({ product, patches }: { product: Product; patches: Patch[] }) {
  const [size, setSize] = useState<string | null>(null)
  const [selectedPatches, setSelectedPatches] = useState<string[]>([])
  const [qty, setQty] = useState(1)

  const [hasFlocage, setHasFlocage] = useState(false)
  const [flocageName, setFlocageName] = useState('')
  const [flocageNumber, setFlocageNumber] = useState('')

  const [error, setError] = useState('')
  const addItem = useCartStore((s) => s.addItem)

  // Si aucun patch spécifique défini sur le produit, on affiche tous les patchs
  const availablePatches = product.available_patches.length > 0
    ? patches.filter((p) => product.available_patches.includes(p.code))
    : patches

  const handleAdd = () => {
    if (!size) {
      setError('VEUILLEZ SÉLECTIONNER UNE TAILLE')
      return
    }
    setError('')
    const selectedPatchObjects = patches.filter((p) => selectedPatches.includes(p.code))

    const effectivePrice = calculateCartItemUnitPrice({
      basePrice: product.price,
      patchCount: selectedPatches.length,
      hasFlocage,
    })

    addItem({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      club: product.club,
      size,
      patches: selectedPatches,
      patch_names: selectedPatchObjects.map((p) => p.name),
      flocage_name: hasFlocage ? flocageName.toUpperCase() : null,
      flocage_number: hasFlocage ? flocageNumber : null,
      price: effectivePrice,
      photo: product.photos[0] ?? '',
      qty,
    })
  }

  const totalPrice = calculateCartItemUnitPrice({
    basePrice: product.price,
    patchCount: selectedPatches.length,
    hasFlocage,
  }) * qty

  return (
    <div className="space-y-8">
      <div className="space-y-10">
        <SizeSelector available={product.sizes} selected={size} onSelect={setSize} />
        <PatchSelector
          patches={availablePatches}
          selected={selectedPatches}
          onSelect={setSelectedPatches}
        />
      </div>

      {/* Flocage Section */}
      <div className="space-y-6 pt-2">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center w-6 h-6 rounded-sm border-2 border-[var(--black)] bg-white transition-colors">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={hasFlocage}
              onChange={(e) => setHasFlocage(e.target.checked)}
            />
            <div className="absolute inset-0 bg-[var(--black)] scale-0 peer-checked:scale-100 transition-transform flex items-center justify-center">
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
          </div>
          <div>
            <span className="text-[17px] font-bold text-[var(--black)]">
              Personnaliser ce maillot
            </span>
            <span className="ml-2 text-[15px] text-[var(--grey)]">
              (+{FLOCAGE_PRICE}€)
            </span>
          </div>
        </label>

        {hasFlocage && (
          <div className="grid grid-cols-4 gap-4 animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="col-span-3 space-y-2">
              <label className="text-[13px] font-bold text-[var(--black)] uppercase tracking-wide">Nom personnalisé</label>
              <input
                type="text"
                value={flocageName}
                onChange={(e) => setFlocageName(e.target.value)}
                maxLength={12}
                className="w-full bg-white border border-[#E5E5E5] px-4 py-3 text-[16px] font-bold uppercase focus:border-[var(--black)] focus:outline-none rounded-none transition-colors"
                placeholder="EX: MBAPPÉ"
              />
            </div>
            <div className="col-span-1 space-y-2">
              <label className="text-[13px] font-bold text-[var(--black)] uppercase tracking-wide text-center block">N°</label>
              <input
                type="text"
                value={flocageNumber}
                onChange={(e) => setFlocageNumber(e.target.value.replace(/\D/g, '').slice(0, 2))}
                className="w-full bg-white border border-[#E5E5E5] px-4 py-3 text-[16px] font-bold text-center focus:border-[var(--black)] focus:outline-none rounded-none transition-colors"
                placeholder="10"
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6 pt-4">
        {error && (
          <div className="flex items-center gap-3 p-4 bg-[#FFDADA] border-l-4 border-[#FF0000] text-[#CC0000] text-[15px] font-bold">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-y border-[#E5E5E5] py-4">
            <span className="text-[16px] font-bold text-[var(--black)] uppercase">Quantité</span>
            <div className="flex items-center border border-[#E5E5E5] rounded-full overflow-hidden">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="p-3 hover:bg-gray-50 transition-colors disabled:opacity-30"
                disabled={qty <= 1}
              >
                <Minus className="w-5 h-5 text-[var(--black)]" />
              </button>
              <span className="font-bold text-[18px] min-w-[50px] text-center">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="p-3 hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-5 h-5 text-[var(--black)]" />
              </button>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="w-full py-5 bg-[var(--black)] text-white text-[18px] font-bold rounded-full hover:opacity-80 transition-all flex items-center justify-center gap-2"
          >
            Ajouter au panier — {totalPrice.toFixed(2)} €
          </button>
        </div>
      </div>
    </div>
  )
}
