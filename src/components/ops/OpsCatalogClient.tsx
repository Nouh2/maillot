'use client'

import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Image as ImageIcon, LoaderCircle, Plus, RefreshCcw, Save, Search, Trash2 } from 'lucide-react'
import { ExternalProductImage } from '@/components/ui/ExternalProductImage'
import { normalizeCatalogText } from '@/lib/catalogEntityRegistry'
import type { League } from '@/types/product'
import type { OpsProductDetail, OpsProductDraft, OpsProductSummary } from '@/types/productAdmin'

type OpsCatalogClientProps = {
  initialProducts: OpsProductSummary[]
  initialProduct: OpsProductDetail | null
  leagues: League[]
}

type CatalogFilterState = {
  status: 'all' | 'active' | 'inactive'
  league: string
  retro: 'all' | 'true' | 'false'
  concept: 'all' | 'true' | 'false'
}

const PRODUCT_KIND_OPTIONS: Array<{ value: OpsProductDraft['product_kind']; label: string }> = [
  { value: 'jersey', label: 'Maillot' },
  { value: 'goalkeeper', label: 'Gardien' },
  { value: 'training', label: 'Training' },
  { value: 'pre_match', label: 'Avant-match' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'jacket', label: 'Veste' },
  { value: 'pants', label: 'Pantalon' },
  { value: 'shorts', label: 'Short' },
  { value: 'set', label: 'Ensemble' },
  { value: 'vest', label: 'Debardeur' },
]

const PRODUCT_TYPE_OPTIONS: Array<{ value: OpsProductDraft['type']; label: string }> = [
  { value: 'domicile', label: 'Domicile' },
  { value: 'exterieur', label: 'Exterieur' },
  { value: 'third', label: 'Third' },
]

const JERSEY_VERSION_OPTIONS: Array<{ value: OpsProductDraft['jersey_version']; label: string }> = [
  { value: 'fan', label: 'Fan' },
  { value: 'player', label: 'Player' },
]

function toDraft(product: OpsProductDetail): OpsProductDraft {
  return {
    name: product.name,
    club: product.club,
    league: product.league,
    country: product.country,
    season: product.season,
    product_kind: product.product_kind,
    jersey_version: product.jersey_version,
    type: product.type,
    is_retro: product.is_retro,
    is_concept: Boolean(product.is_concept),
    is_active: product.is_active,
    photos: [...product.photos],
  }
}

function fingerprint(draft: OpsProductDraft | null): string {
  if (!draft) return ''
  return JSON.stringify({ ...draft, photos: draft.photos.map((photo) => photo.trim()) })
}

function toSummary(product: OpsProductDetail): OpsProductSummary {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    club: product.club,
    league: product.league,
    season: product.season,
    product_kind: product.product_kind,
    jersey_version: product.jersey_version,
    photos: product.photos.slice(0, 2),
    is_active: product.is_active,
    is_retro: product.is_retro,
    is_concept: Boolean(product.is_concept),
    created_at: product.created_at,
    has_manual_override: product.has_manual_override,
    manual_override_updated_at: product.manual_override_updated_at,
    source_provider: product.source_provider,
    source_title: product.source_title,
    last_synced_at: product.last_synced_at,
  }
}

function formatTimestamp(value: string | null | undefined): string {
  if (!value) return 'Jamais'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Inconnue' : date.toLocaleString('fr-FR')
}

function StatPill({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-condensed uppercase tracking-[0.16em] ${active ? 'bg-[var(--black)] text-white' : 'border border-[var(--cream-3)] text-[var(--grey)]'}`}>
      {label}
    </span>
  )
}

function ToggleButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-condensed uppercase tracking-[0.16em] ${active ? 'bg-[var(--black)] text-white' : 'border border-[var(--cream-3)] text-[var(--black)]'}`}
    >
      {label}
    </button>
  )
}

export function OpsCatalogClient({ initialProducts, initialProduct, leagues }: OpsCatalogClientProps) {
  const [products, setProducts] = useState(initialProducts)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(initialProduct?.id ?? initialProducts[0]?.id ?? null)
  const [loadedProduct, setLoadedProduct] = useState<OpsProductDetail | null>(initialProduct)
  const [draft, setDraft] = useState<OpsProductDraft | null>(() => (initialProduct ? toDraft(initialProduct) : null))
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<CatalogFilterState>({ status: 'all', league: 'all', retro: 'all', concept: 'all' })
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingProduct, setIsLoadingProduct] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const deferredSearch = useDeferredValue(search)
  const leagueMap = useMemo(() => new Map(leagues.map((league) => [league.name, league])), [leagues])
  const draftIsDirty = fingerprint(draft) !== fingerprint(loadedProduct ? toDraft(loadedProduct) : null)

  useEffect(() => {
    if (!draftIsDirty) return undefined
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [draftIsDirty])

  useEffect(() => {
    if (!selectedProductId || (loadedProduct && loadedProduct.id === selectedProductId)) return

    let cancelled = false

    async function loadProduct() {
      setIsLoadingProduct(true)
      setError(null)
      setMessage(null)
      try {
        const response = await fetch(`/api/internal/products/${selectedProductId}`, { cache: 'no-store' })
        const data = await response.json().catch(() => null)
        if (!response.ok) throw new Error(data?.error ?? 'Chargement impossible')
        if (cancelled) return
        setLoadedProduct(data.product as OpsProductDetail)
        setDraft(toDraft(data.product as OpsProductDetail))
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Chargement impossible')
      } finally {
        if (!cancelled) setIsLoadingProduct(false)
      }
    }

    void loadProduct()
    return () => {
      cancelled = true
    }
  }, [loadedProduct, selectedProductId])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (filters.status === 'active' && !product.is_active) return false
      if (filters.status === 'inactive' && product.is_active) return false
      if (filters.league !== 'all' && product.league !== filters.league) return false
      if (filters.retro === 'true' && !product.is_retro) return false
      if (filters.retro === 'false' && product.is_retro) return false
      if (filters.concept === 'true' && !product.is_concept) return false
      if (filters.concept === 'false' && product.is_concept) return false
      if (!deferredSearch.trim()) return true
      const haystack = normalizeCatalogText([product.name, product.club, product.league, product.slug, product.season].join(' '))
      return normalizeCatalogText(deferredSearch).split(' ').every((token) => haystack.includes(token))
    })
  }, [deferredSearch, filters, products])

  function updateDraft(patch: Partial<OpsProductDraft>) {
    setDraft((current) => (current ? { ...current, ...patch } : current))
  }

  function selectProduct(productId: string) {
    if (productId === selectedProductId) return
    if (draftIsDirty && !window.confirm('Tu as des changements non sauvegardes. Les perdre ?')) return
    setSelectedProductId(productId)
    setLoadedProduct((current) => (current?.id === productId ? current : null))
    setDraft(null)
    setMessage(null)
    setError(null)
  }

  function resetDraft() {
    if (!loadedProduct) return
    setDraft(toDraft(loadedProduct))
    setMessage(null)
    setError(null)
  }

  function updatePhoto(index: number, value: string) {
    if (!draft) return
    const photos = [...draft.photos]
    photos[index] = value
    updateDraft({ photos })
  }

  function removePhoto(index: number) {
    if (!draft) return
    updateDraft({ photos: draft.photos.filter((_, photoIndex) => photoIndex !== index) })
  }

  function movePhoto(index: number, direction: -1 | 1) {
    if (!draft) return
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= draft.photos.length) return
    const photos = [...draft.photos]
    const [moved] = photos.splice(index, 1)
    photos.splice(nextIndex, 0, moved)
    updateDraft({ photos })
  }

  function addPhoto() {
    if (!draft) return
    updateDraft({ photos: [...draft.photos, ''] })
  }

  async function saveProduct() {
    if (!selectedProductId || !draft) return
    setIsSaving(true)
    setMessage(null)
    setError(null)
    try {
      const response = await fetch(`/api/internal/products/${selectedProductId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error ?? 'Sauvegarde impossible')
      const nextProduct = data.product as OpsProductDetail
      setLoadedProduct(nextProduct)
      setDraft(toDraft(nextProduct))
      setProducts((current) => current.map((product) => (product.id === nextProduct.id ? toSummary(nextProduct) : product)))
      setMessage('Produit sauvegarde et publie sur le site')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Sauvegarde impossible')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-5">
        <p className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--terra)]">Catalogue admin</p>
        <h1 className="mt-2 font-bebas text-4xl text-[var(--black)]">Produits</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--grey)]">
          Modifie les titres, la saison, la ligue, les tags retro ou concept, l activation et l ordre des images.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <StatPill active label={`${products.length} produits`} />
          <StatPill active={products.some((product) => product.has_manual_override)} label="Overrides actifs" />
          <StatPill active={draftIsDirty} label={draftIsDirty ? 'Brouillon en cours' : 'Brouillon a jour'} />
        </div>
        {message ? <p className="mt-4 text-sm text-[var(--terra)]">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </section>

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-4">
            <label className="relative block">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[var(--grey)]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un produit"
                className="w-full rounded-2xl border border-[var(--cream-3)] py-3 pr-4 pl-11 text-sm outline-none transition-colors focus:border-[var(--terra)]"
              />
            </label>

            <div className="mt-4 grid gap-3">
              <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as CatalogFilterState['status'] }))} className="rounded-2xl border border-[var(--cream-3)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)]">
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>

              <select value={filters.league} onChange={(event) => setFilters((current) => ({ ...current, league: event.target.value }))} className="rounded-2xl border border-[var(--cream-3)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)]">
                <option value="all">Toutes les ligues</option>
                {leagues.map((league) => (
                  <option key={league.slug} value={league.name}>{league.name}</option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <select value={filters.retro} onChange={(event) => setFilters((current) => ({ ...current, retro: event.target.value as CatalogFilterState['retro'] }))} className="rounded-2xl border border-[var(--cream-3)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)]">
                  <option value="all">Retro: tous</option>
                  <option value="true">Retro: oui</option>
                  <option value="false">Retro: non</option>
                </select>

                <select value={filters.concept} onChange={(event) => setFilters((current) => ({ ...current, concept: event.target.value as CatalogFilterState['concept'] }))} className="rounded-2xl border border-[var(--cream-3)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)]">
                  <option value="all">Concept: tous</option>
                  <option value="true">Concept: oui</option>
                  <option value="false">Concept: non</option>
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-3">
            <div className="mb-3 flex items-center justify-between px-2">
              <p className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--terra)]">Liste</p>
              <span className="text-xs text-[var(--grey)]">{filteredProducts.length} visibles</span>
            </div>
            <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
              {filteredProducts.map((product) => {
                const active = product.id === selectedProductId
                const cover = product.photos[0]
                return (
                  <button key={product.id} type="button" onClick={() => selectProduct(product.id)} className={`flex w-full items-start gap-3 rounded-[1.5rem] border p-3 text-left ${active ? 'border-[var(--black)] bg-[var(--cream)]' : 'border-[var(--cream-3)] bg-white hover:border-[var(--terra)]'}`}>
                    <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[var(--cream)]">
                      {cover ? (
                        <ExternalProductImage src={cover} alt={product.name} fill unoptimized fallbackMode="proxy" bunnyTransform="thumb" sizes="64px" className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[var(--grey)]"><ImageIcon className="h-5 w-5" /></div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-condensed text-sm font-bold uppercase tracking-[0.06em] text-[var(--black)]">{product.name}</p>
                      <p className="mt-1 truncate text-xs text-[var(--grey)]">{product.club} · {product.season}</p>
                      <p className="mt-1 truncate text-xs text-[var(--grey)]">{product.league}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${product.is_active ? 'bg-[#e8f4eb] text-[#1c6b3e]' : 'bg-[#f6e8e8] text-[#9d2f2f]'}`}>{product.is_active ? 'Actif' : 'Inactif'}</span>
                        {product.is_retro ? <span className="rounded-full bg-[var(--terra-lt)] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--terra)]">Retro</span> : null}
                        {product.is_concept ? <span className="rounded-full bg-[#eef2ff] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[#3f51b5]">Concept</span> : null}
                        {!product.is_retro && !product.is_concept && product.product_kind === 'jersey' ? (
                          <span className="rounded-full bg-white px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--black)] ring-1 ring-[var(--cream-3)]">
                            {product.jersey_version === 'player' ? 'Player' : 'Fan'}
                          </span>
                        ) : null}
                        {product.has_manual_override ? <span className="rounded-full bg-[var(--black)] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-white">Modifie</span> : null}
                      </div>
                    </div>
                  </button>
                )
              })}
              {filteredProducts.length === 0 ? (
                <div className="rounded-[1.5rem] border border-[var(--cream-3)] bg-[var(--cream)] p-5 text-sm text-[var(--grey)]">
                  Aucun produit ne correspond aux filtres.
                </div>
              ) : null}
            </div>
          </section>
        </aside>

        <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-5">
          {isLoadingProduct ? (
            <div className="flex min-h-[420px] items-center justify-center gap-3 text-[var(--grey)]">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Chargement du produit
            </div>
          ) : loadedProduct && draft ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 border-b border-[var(--cream-3)] pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--terra)]">Editeur produit</p>
                  <h2 className="mt-2 font-bebas text-4xl text-[var(--black)]">{loadedProduct.name}</h2>
                  <p className="mt-2 text-sm text-[var(--grey)]">
                    Slug: <span className="font-mono text-xs">{loadedProduct.slug}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatPill active={draft.is_active} label={draft.is_active ? 'Actif' : 'Inactif'} />
                  <StatPill active={draft.is_retro} label="Retro" />
                  <StatPill active={draft.is_concept} label="Concept" />
                  <StatPill active={draft.product_kind === 'jersey'} label={draft.jersey_version === 'player' ? 'Player' : 'Fan'} />
                  <StatPill active={loadedProduct.has_manual_override} label="Override manuel" />
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="space-y-6">
                  <section className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-xs font-condensed uppercase tracking-[0.16em] text-[var(--grey)]">Titre</span>
                      <input value={draft.name} onChange={(event) => updateDraft({ name: event.target.value })} className="w-full rounded-2xl border border-[var(--cream-3)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)]" />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-condensed uppercase tracking-[0.16em] text-[var(--grey)]">Equipe</span>
                      <input value={draft.club} onChange={(event) => updateDraft({ club: event.target.value })} className="w-full rounded-2xl border border-[var(--cream-3)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)]" />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-condensed uppercase tracking-[0.16em] text-[var(--grey)]">Saison</span>
                      <input value={draft.season} onChange={(event) => updateDraft({ season: event.target.value })} className="w-full rounded-2xl border border-[var(--cream-3)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)]" />
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-condensed uppercase tracking-[0.16em] text-[var(--grey)]">Ligue</span>
                      <select
                        value={draft.league}
                        onChange={(event) => {
                          const league = leagueMap.get(event.target.value)
                          updateDraft({ league: event.target.value, country: league?.country ?? draft.country })
                        }}
                        className="w-full rounded-2xl border border-[var(--cream-3)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)]"
                      >
                        {leagues.map((league) => (
                          <option key={league.slug} value={league.name}>{league.name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-condensed uppercase tracking-[0.16em] text-[var(--grey)]">Nature produit</span>
                      <select value={draft.product_kind} onChange={(event) => updateDraft({ product_kind: event.target.value as OpsProductDraft['product_kind'] })} className="w-full rounded-2xl border border-[var(--cream-3)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)]">
                        {PRODUCT_KIND_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-condensed uppercase tracking-[0.16em] text-[var(--grey)]">Variation</span>
                      <select value={draft.type} onChange={(event) => updateDraft({ type: event.target.value as OpsProductDraft['type'] })} className="w-full rounded-2xl border border-[var(--cream-3)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)]">
                        {PRODUCT_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-xs font-condensed uppercase tracking-[0.16em] text-[var(--grey)]">Version maillot</span>
                      <select
                        value={draft.jersey_version}
                        onChange={(event) => updateDraft({ jersey_version: event.target.value as OpsProductDraft['jersey_version'] })}
                        disabled={draft.product_kind !== 'jersey'}
                        className="w-full rounded-2xl border border-[var(--cream-3)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)] disabled:bg-[var(--cream)] disabled:text-[var(--grey)]"
                      >
                        {JERSEY_VERSION_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </label>
                  </section>

                  <section className="rounded-[1.5rem] border border-[var(--cream-3)] bg-[var(--cream)] p-4">
                    <p className="text-xs font-condensed uppercase tracking-[0.16em] text-[var(--grey)]">Etat du produit</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <ToggleButton active={draft.is_active} label={draft.is_active ? 'Visible sur le site' : 'Masque du site'} onClick={() => updateDraft({ is_active: !draft.is_active })} />
                      <ToggleButton active={draft.is_retro} label="Tag retro" onClick={() => updateDraft({ is_retro: !draft.is_retro })} />
                      <ToggleButton active={draft.is_concept} label="Tag concept" onClick={() => updateDraft({ is_concept: !draft.is_concept })} />
                    </div>
                  </section>

                  <section className="rounded-[1.5rem] border border-[var(--cream-3)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-condensed uppercase tracking-[0.16em] text-[var(--grey)]">Images</p>
                        <p className="mt-1 text-sm text-[var(--grey)]">Reordonne les URLs existantes ou remplace-les manuellement.</p>
                      </div>
                      <button type="button" onClick={addPhoto} className="rounded-full border border-[var(--cream-3)] px-4 py-2 text-xs font-condensed uppercase tracking-[0.16em] text-[var(--black)]">
                        <span className="inline-flex items-center gap-2"><Plus className="h-4 w-4" />Ajouter une URL</span>
                      </button>
                    </div>

                    <div className="mt-4 space-y-3">
                      {draft.photos.map((photo, index) => (
                        <div key={`${index}-${photo}`} className="grid gap-3 rounded-[1.25rem] border border-[var(--cream-3)] p-3 md:grid-cols-[80px_minmax(0,1fr)_auto]">
                          <div className="relative h-24 overflow-hidden rounded-xl bg-[var(--cream)]">
                            {photo.trim() ? (
                              <ExternalProductImage src={photo} alt={`Image ${index + 1}`} fill unoptimized fallbackMode="proxy" bunnyTransform="thumb" sizes="80px" className="object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-[var(--grey)]"><ImageIcon className="h-5 w-5" /></div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs font-condensed uppercase tracking-[0.16em] text-[var(--grey)]">Image {index + 1}</p>
                            <input value={photo} onChange={(event) => updatePhoto(index, event.target.value)} placeholder="https://..." className="w-full rounded-2xl border border-[var(--cream-3)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)]" />
                          </div>
                          <div className="flex items-center gap-2 md:flex-col">
                            <button type="button" onClick={() => movePhoto(index, -1)} disabled={index === 0} className="rounded-full border border-[var(--cream-3)] p-2 text-[var(--black)] disabled:opacity-40"><ArrowUp className="h-4 w-4" /></button>
                            <button type="button" onClick={() => movePhoto(index, 1)} disabled={index === draft.photos.length - 1} className="rounded-full border border-[var(--cream-3)] p-2 text-[var(--black)] disabled:opacity-40"><ArrowDown className="h-4 w-4" /></button>
                            <button type="button" onClick={() => removePhoto(index)} className="rounded-full border border-[var(--cream-3)] p-2 text-red-600"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                      ))}
                      {draft.photos.length === 0 ? <div className="rounded-[1.25rem] border border-dashed border-[var(--cream-3)] p-5 text-sm text-[var(--grey)]">Aucune image pour ce produit.</div> : null}
                    </div>
                  </section>
                </div>

                <aside className="space-y-4">
                  <section className="rounded-[1.5rem] border border-[var(--cream-3)] bg-[var(--cream)] p-4">
                    <p className="text-xs font-condensed uppercase tracking-[0.16em] text-[var(--grey)]">Meta</p>
                    <div className="mt-3 space-y-2 text-sm text-[var(--black)]">
                      <p><span className="text-[var(--grey)]">Pays:</span> {draft.country}</p>
                      <p><span className="text-[var(--grey)]">Source:</span> {loadedProduct.source_provider ?? 'Manuelle'}</p>
                      <p><span className="text-[var(--grey)]">Titre source:</span> {loadedProduct.source_title ?? 'Absent'}</p>
                      <p><span className="text-[var(--grey)]">Derniere synchro:</span> {formatTimestamp(loadedProduct.last_synced_at)}</p>
                      <p><span className="text-[var(--grey)]">Override manuel:</span> {formatTimestamp(loadedProduct.manual_override_updated_at)}</p>
                    </div>
                  </section>

                  <section className="rounded-[1.5rem] border border-[var(--cream-3)] p-4">
                    <p className="text-xs font-condensed uppercase tracking-[0.16em] text-[var(--grey)]">Publication</p>
                    <div className="mt-3 grid gap-2">
                      <button type="button" disabled={isSaving || !draftIsDirty} onClick={() => void saveProduct()} className="rounded-full bg-[var(--black)] px-4 py-3 text-xs font-condensed uppercase tracking-[0.16em] text-white disabled:opacity-50">
                        <span className="inline-flex items-center gap-2">{isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Sauvegarder</span>
                      </button>
                      <button type="button" disabled={!draftIsDirty || isSaving} onClick={resetDraft} className="rounded-full border border-[var(--cream-3)] px-4 py-3 text-xs font-condensed uppercase tracking-[0.16em] text-[var(--black)] disabled:opacity-50">
                        <span className="inline-flex items-center gap-2"><RefreshCcw className="h-4 w-4" />Annuler le brouillon</span>
                      </button>
                    </div>
                  </section>
                </aside>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[420px] items-center justify-center text-center text-[var(--grey)]">
              Choisis un produit dans la liste pour commencer.
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
