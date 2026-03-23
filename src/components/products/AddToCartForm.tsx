'use client'
import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { SizeSelector } from './SizeSelector'
import { PatchSelector } from './PatchSelector'
import { Button } from '@/components/ui/Button'
import type { Product, Patch } from '@/types/product'

export function AddToCartForm({ product, patches }: { product: Product; patches: Patch[] }) {
  const [size, setSize] = useState<string | null>(null)
  const [patch, setPatch] = useState<string | null>(null)
  const [error, setError] = useState('')
  const addItem = useCartStore((s) => s.addItem)

  const availablePatches = patches.filter((p) => product.available_patches.includes(p.code))

  const handleAdd = () => {
    if (!size) {
      setError('Veuillez sélectionner une taille')
      return
    }
    setError('')
    const selectedPatch = patches.find((p) => p.code === patch)
    addItem({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      club: product.club,
      size,
      patch,
      patch_name: selectedPatch?.name ?? null,
      price: product.price,
      photo: product.photos[0] ?? '',
      qty: 1,
    })
  }

  return (
    <div className="space-y-6">
      <SizeSelector available={product.sizes} selected={size} onSelect={setSize} />
      <PatchSelector patches={availablePatches} selected={patch} onSelect={setPatch} />
      {error && <p className="text-[var(--terra)] text-sm font-condensed">{error}</p>}
      <Button onClick={handleAdd} size="lg" className="w-full">
        Ajouter au panier — {product.price.toFixed(2)} €
      </Button>
    </div>
  )
}
