'use client'
import { useState } from 'react'
import { Plus, Minus, Check, ShieldCheck } from 'lucide-react'
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
          <div className="grid grid-cols-6 gap-3 animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="col-span-4 space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--grey)]">Nom</label>
              <input
                type="text"
                maxLength={15}
                value={flocageName}
                onChange={(e) => setFlocageName(e.target.value)}
                placeholder="Ex: ZIDANE"
                className="w-full bg-white border-2 border-[var(--cream-3)] rounded-xl px-4 py-3 font-condensed text-lg focus:border-[var(--black)] outline-none transition-colors uppercase"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--grey)]">Numéro</label>
              <input
                type="text"
                maxLength={2}
                value={flocageNumber}
                onChange={(e) => setFlocageNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="10"
                className="w-full bg-white border-2 border-[var(--cream-3)] rounded-xl px-4 py-3 font-condensed text-lg text-center focus:border-[var(--black)] outline-none transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-[var(--cream-3)]">
        {error && (
          <p className="mb-4 text-xs font-bold text-red-500 tracking-widest text-center animate-pulse">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-6">
          <div className="flex items-center">
            {/* Modern Quantity Selector */}
            <div className="flex items-center bg-white border-2 border-[var(--cream-3)] rounded-xl h-[56px] px-2 shadow-sm">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-10 h-10 flex items-center justify-center text-[var(--grey)] hover:text-[var(--black)] transition-colors"
              >
                <Minus size={18} />
              </button>
              <span className="w-8 text-center font-bebas text-xl text-[var(--black)]">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-10 h-10 flex items-center justify-center text-[var(--grey)] hover:text-[var(--black)] transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>

            <button
              onClick={handleAdd}
              className="flex-1 ml-4 h-[56px] bg-[var(--black)] text-white text-[16px] font-bold uppercase tracking-wider rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              Ajouter au panier — {totalPrice.toFixed(2)} €
            </button>
          </div>

          {/* New Payment Section */}
          <div className="space-y-4">
            <div className="w-full py-3.5 bg-[#4ADE80] text-white text-center font-bebas text-2xl tracking-wide rounded-xl flex items-center justify-center gap-2 shadow-sm">
              <ShieldCheck className="w-6 h-6 text-white" />
              Paiement 100 % Sécurisé
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3 py-2 opacity-80 transition-opacity hover:opacity-100">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6 object-contain" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 object-contain" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 object-contain" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" alt="Apple Pay" className="h-5 object-contain" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg" alt="Amex" className="h-5 object-contain" />
            </div>

            <div className="bg-[#F0F4FF] p-6 rounded-2xl border border-blue-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700"></div>
              
              <h3 className="relative font-bold text-[18px] text-[var(--black)] italic mb-4 inline-block">
                Paiement & Sécurité
                <div className="absolute -bottom-1 left-0 w-full h-2 bg-[#4BFF00] -z-10 opacity-60 rounded-full"></div>
              </h3>

              <div className="flex flex-wrap gap-2 mb-4">
                <div className="px-2 py-1 bg-white rounded border border-blue-100 shadow-xs flex items-center justify-center">
                  <ShieldCheck className="w-3 h-3 text-blue-500 mr-1" />
                  <span className="text-[10px] font-bold text-blue-900 uppercase tracking-tighter">SSL Securing</span>
                </div>
              </div>

              <p className="text-[14px] leading-relaxed text-[#555555] relative z-10">
                Vos informations de paiement sont traitées de manière sécurisée. Nous ne stockons pas les informations de carte bancaire et n&apos;y avons pas accès.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
