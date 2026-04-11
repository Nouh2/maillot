'use client'

import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { ExternalLink, Image as ImageIcon, LoaderCircle, RefreshCcw, Save, Search, Trash2 } from 'lucide-react'
import { ExternalProductImage } from '@/components/ui/ExternalProductImage'
import { normalizeCatalogText } from '@/lib/catalogEntityRegistry'
import type {
  HomepageCurationAssignment,
  HomepageCurationEditorGroup,
  HomepageCurationEditorSection,
  HomepageCurationProductOption,
} from '@/types/homepageCuration'

type OpsHomepageCurationClientProps = {
  initialSections: HomepageCurationEditorSection[]
  productOptions: HomepageCurationProductOption[]
}

function fingerprint(sections: HomepageCurationEditorSection[]): string {
  return JSON.stringify(
    sections.map((section) => ({
      id: section.id,
      groups: section.groups.map((group) => ({
        key: group.key,
        assignments: group.assignments,
      })),
    })),
  )
}

function SectionPill({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-condensed uppercase tracking-[0.16em] ${
        active ? 'bg-[var(--black)] text-white' : 'border border-[var(--cream-3)] text-[var(--black)]'
      }`}
    >
      {label}
    </button>
  )
}

function StatusPill({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-condensed uppercase tracking-[0.16em] ${
        active ? 'bg-[var(--black)] text-white' : 'border border-[var(--cream-3)] text-[var(--grey)]'
      }`}
    >
      {label}
    </span>
  )
}

export function OpsHomepageCurationClient({
  initialSections,
  productOptions,
}: OpsHomepageCurationClientProps) {
  const [savedSections, setSavedSections] = useState(initialSections)
  const [sections, setSections] = useState(initialSections)
  const [activeSectionId, setActiveSectionId] = useState(initialSections[0]?.id ?? 'top_moment')
  const [activeGroupKey, setActiveGroupKey] = useState(initialSections[0]?.groups[0]?.key ?? '')
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0)
  const [search, setSearch] = useState('')
  const [showAllProducts, setShowAllProducts] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const deferredSearch = useDeferredValue(search)
  const initialFingerprint = useMemo(() => fingerprint(savedSections), [savedSections])
  const currentFingerprint = useMemo(() => fingerprint(sections), [sections])
  const isDirty = currentFingerprint !== initialFingerprint
  const productMap = useMemo(() => new Map(productOptions.map((product) => [product.id, product])), [productOptions])

  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeSectionId) ?? sections[0] ?? null,
    [activeSectionId, sections],
  )

  const activeGroup = useMemo(
    () =>
      activeSection?.groups.find((group) => group.key === activeGroupKey) ??
      activeSection?.groups[0] ??
      null,
    [activeGroupKey, activeSection],
  )

  useEffect(() => {
    if (!activeSection) return
    if (activeSection.groups.some((group) => group.key === activeGroupKey)) return
    setActiveGroupKey(activeSection.groups[0]?.key ?? '')
  }, [activeGroupKey, activeSection])

  useEffect(() => {
    if (!activeGroup) return
    if (selectedSlotIndex < activeGroup.assignments.length) return
    setSelectedSlotIndex(0)
  }, [activeGroup, selectedSlotIndex])

  useEffect(() => {
    if (!isDirty) return undefined
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const filteredProducts = useMemo(() => {
    if (!activeGroup) return []

    const relevantProductIds = new Set([
      ...activeGroup.suggested_product_ids,
      ...activeGroup.assignments.filter((assignment): assignment is string => Boolean(assignment)),
    ])
    const normalizedQuery = normalizeCatalogText(deferredSearch)

    return productOptions.filter((product) => {
      if (!showAllProducts && !relevantProductIds.has(product.id)) return false
      if (!normalizedQuery) return true

      const haystack = normalizeCatalogText(
        [product.name, product.club, product.league, product.slug, product.season].join(' '),
      )
      return normalizedQuery.split(' ').every((token) => haystack.includes(token))
    })
  }, [activeGroup, deferredSearch, productOptions, showAllProducts])

  function updateGroupAssignments(updater: (group: HomepageCurationEditorGroup) => HomepageCurationEditorGroup) {
    if (!activeSection || !activeGroup) return

    setSections((current) =>
      current.map((section) =>
        section.id !== activeSection.id
          ? section
          : {
              ...section,
              groups: section.groups.map((group) =>
                group.key === activeGroup.key ? updater(group) : group,
              ),
            },
      ),
    )
    setMessage(null)
    setError(null)
  }

  function assignProductToSelectedSlot(productId: string) {
    if (!activeGroup) return

    updateGroupAssignments((group) => {
      const assignments = [...group.assignments]
      const existingIndex = assignments.findIndex((assignment) => assignment === productId)
      if (existingIndex !== -1) {
        assignments[existingIndex] = null
      }
      assignments[selectedSlotIndex] = productId
      return { ...group, assignments }
    })
  }

  function clearSlot(index: number) {
    updateGroupAssignments((group) => {
      const assignments = [...group.assignments]
      assignments[index] = null
      return { ...group, assignments }
    })
  }

  function resetDraft() {
    setSections(savedSections)
    setMessage(null)
    setError(null)
  }

  function buildAssignmentsPayload(): HomepageCurationAssignment[] {
    return sections.flatMap((section) =>
      section.groups.flatMap((group) =>
        group.assignments.flatMap((productId, slotIndex) =>
          productId
            ? [
                {
                  section: section.id,
                  group_key: group.key,
                  slot_index: slotIndex,
                  product_id: productId,
                },
              ]
            : [],
        ),
      ),
    )
  }

  async function saveDraft() {
    setIsSaving(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch('/api/internal/homepage-curation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments: buildAssignmentsPayload() }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error ?? 'Sauvegarde impossible')

      const nextSections = data.sections as HomepageCurationEditorSection[]
      setSavedSections(nextSections)
      setSections(nextSections)
      setMessage('Landing page sauvegardee et publiee sur le site')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Sauvegarde impossible')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-5">
        <p className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--terra)]">Landing page admin</p>
        <h1 className="mt-2 font-bebas text-4xl text-[var(--black)]">Curation home</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--grey)]">
          Choisis manuellement les maillots affiches dans <span className="font-semibold text-[var(--black)]">Le top du moment</span> et <span className="font-semibold text-[var(--black)]">Les maillots qui partent vite</span>. Tant que tu ne sauvegardes pas, rien ne change sur le site.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <StatusPill active label={`${productOptions.length} produits disponibles`} />
          <StatusPill active={isDirty} label={isDirty ? 'Brouillon en cours' : 'Brouillon a jour'} />
        </div>
        {message ? <p className="mt-4 text-sm text-[var(--terra)]">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </section>

      <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-5">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <SectionPill
              key={section.id}
              active={section.id === activeSection?.id}
              label={section.label}
              onClick={() => {
                setActiveSectionId(section.id)
                setActiveGroupKey(section.groups[0]?.key ?? '')
                setSelectedSlotIndex(0)
                setShowAllProducts(false)
              }}
            />
          ))}
        </div>

        {activeSection ? (
          <>
            <p className="mt-4 text-sm text-[var(--grey)]">{activeSection.description}</p>

            <div className="mt-4 flex gap-3 border-b border-[var(--cream-3)] pb-1" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
              {activeSection.groups.map((group) => (
                <button
                  key={group.key}
                  type="button"
                  onClick={() => {
                    setActiveGroupKey(group.key)
                    setSelectedSlotIndex(0)
                    setShowAllProducts(false)
                  }}
                  className={`-mb-px whitespace-nowrap border-b-2 pb-2 font-condensed text-xs uppercase tracking-[0.16em] ${
                    group.key === activeGroup?.key ? 'border-[var(--black)] text-[var(--black)]' : 'border-transparent text-[var(--grey)]'
                  }`}
                >
                  {group.label}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-5">
          {activeGroup ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 border-b border-[var(--cream-3)] pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--terra)]">Onglet actif</p>
                  <h2 className="mt-2 font-bebas text-4xl text-[var(--black)]">{activeGroup.label}</h2>
                  <p className="mt-2 text-sm text-[var(--grey)]">{activeGroup.description}</p>
                </div>
                <a
                  href={activeGroup.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--cream-3)] px-4 py-2 text-xs font-condensed uppercase tracking-[0.16em] text-[var(--black)]"
                >
                  Voir la page <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {activeGroup.slot_labels.map((label, index) => {
                  const assignedId = activeGroup.assignments[index]
                  const assignedProduct = assignedId ? productMap.get(assignedId) ?? null : null
                  const isActiveSlot = index === selectedSlotIndex

                  return (
                    <div
                      key={`${activeGroup.key}-${label}-${index}`}
                      className={`grid gap-3 rounded-[1.5rem] border p-4 text-left transition-colors ${
                        isActiveSlot ? 'border-[var(--black)] bg-[var(--cream)]' : 'border-[var(--cream-3)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-condensed uppercase tracking-[0.16em] text-[var(--grey)]">{label}</p>
                          <p className="mt-1 text-sm text-[var(--black)]">
                            {assignedProduct ? assignedProduct.name : 'Aucun maillot selectionne'}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-condensed uppercase tracking-[0.16em] text-[var(--black)]">
                          Slot {index + 1}
                        </span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-[92px_minmax(0,1fr)]">
                        <div className="relative h-28 overflow-hidden rounded-[1rem] bg-[var(--cream)]">
                          {assignedProduct?.photos[0] ? (
                            <ExternalProductImage
                              src={assignedProduct.photos[0]}
                              alt={assignedProduct.name}
                              fill
                              unoptimized
                              fallbackMode="proxy"
                              bunnyTransform="thumb"
                              sizes="96px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[var(--grey)]">
                              <ImageIcon className="h-5 w-5" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          {assignedProduct ? (
                            <>
                              <p className="truncate font-condensed text-xs uppercase tracking-[0.08em] text-[var(--black)]">{assignedProduct.club}</p>
                              <p className="mt-1 truncate text-xs text-[var(--grey)]">{assignedProduct.league}</p>
                              <p className="mt-1 truncate text-xs text-[var(--grey)]">Saison {assignedProduct.season}</p>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                <StatusPill active={assignedProduct.is_active} label={assignedProduct.is_active ? 'Actif' : 'Inactif'} />
                                {assignedProduct.is_retro ? <StatusPill active label="Retro" /> : null}
                                {assignedProduct.is_concept ? <StatusPill active label="Concept" /> : null}
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-[var(--grey)]">
                              Clique sur ce slot, puis choisis un produit dans la librairie a droite.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedSlotIndex(index)}
                          className={`rounded-full px-4 py-2 text-xs font-condensed uppercase tracking-[0.16em] ${
                            isActiveSlot ? 'bg-[var(--black)] text-white' : 'border border-[var(--cream-3)] text-[var(--black)]'
                          }`}
                        >
                          {isActiveSlot ? 'Slot cible' : 'Selectionner ce slot'}
                        </button>
                        {assignedProduct ? (
                          <button
                            type="button"
                            onClick={() => clearSlot(index)}
                            className="inline-flex items-center gap-2 rounded-full border border-[var(--cream-3)] px-4 py-2 text-xs font-condensed uppercase tracking-[0.16em] text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            Vider
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[420px] items-center justify-center text-center text-[var(--grey)]">
              Aucun onglet disponible pour cette section.
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--terra)]">Librairie produits</p>
                <p className="mt-1 text-sm text-[var(--grey)]">
                  {activeGroup ? `Selection pour ${activeGroup.label}` : 'Choisis un onglet'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAllProducts((current) => !current)}
                className="rounded-full border border-[var(--cream-3)] px-4 py-2 text-xs font-condensed uppercase tracking-[0.16em] text-[var(--black)]"
              >
                {showAllProducts ? 'Vue ciblee' : 'Tout le catalogue'}
              </button>
            </div>

            <label className="relative mt-4 block">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[var(--grey)]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un maillot"
                className="w-full rounded-2xl border border-[var(--cream-3)] py-3 pr-4 pl-11 text-sm outline-none transition-colors focus:border-[var(--terra)]"
              />
            </label>

            <div className="mt-4 max-h-[70vh] space-y-2 overflow-y-auto pr-1">
              {filteredProducts.map((product) => {
                const isAssignedToCurrentSlot = activeGroup?.assignments[selectedSlotIndex] === product.id
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => assignProductToSelectedSlot(product.id)}
                    className={`flex w-full items-start gap-3 rounded-[1.5rem] border p-3 text-left ${
                      isAssignedToCurrentSlot ? 'border-[var(--black)] bg-[var(--cream)]' : 'border-[var(--cream-3)] bg-white hover:border-[var(--terra)]'
                    }`}
                  >
                    <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[var(--cream)]">
                      {product.photos[0] ? (
                        <ExternalProductImage
                          src={product.photos[0]}
                          alt={product.name}
                          fill
                          unoptimized
                          fallbackMode="proxy"
                          bunnyTransform="thumb"
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[var(--grey)]">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-condensed text-sm font-bold uppercase tracking-[0.06em] text-[var(--black)]">{product.name}</p>
                      <p className="mt-1 truncate text-xs text-[var(--grey)]">{product.club} · {product.season}</p>
                      <p className="mt-1 truncate text-xs text-[var(--grey)]">{product.league}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <StatusPill active={product.is_active} label={product.is_active ? 'Actif' : 'Inactif'} />
                        {product.is_retro ? <StatusPill active label="Retro" /> : null}
                        {product.is_concept ? <StatusPill active label="Concept" /> : null}
                      </div>
                    </div>
                  </button>
                )
              })}

              {filteredProducts.length === 0 ? (
                <div className="rounded-[1.5rem] border border-[var(--cream-3)] bg-[var(--cream)] p-5 text-sm text-[var(--grey)]">
                  Aucun produit ne correspond a cette recherche.
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-4">
            <p className="text-xs font-condensed uppercase tracking-[0.16em] text-[var(--grey)]">Publication</p>
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                disabled={isSaving || !isDirty}
                onClick={() => void saveDraft()}
                className="rounded-full bg-[var(--black)] px-4 py-3 text-xs font-condensed uppercase tracking-[0.16em] text-white disabled:opacity-50"
              >
                <span className="inline-flex items-center gap-2">
                  {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Sauvegarder
                </span>
              </button>
              <button
                type="button"
                disabled={!isDirty || isSaving}
                onClick={resetDraft}
                className="rounded-full border border-[var(--cream-3)] px-4 py-3 text-xs font-condensed uppercase tracking-[0.16em] text-[var(--black)] disabled:opacity-50"
              >
                <span className="inline-flex items-center gap-2">
                  <RefreshCcw className="h-4 w-4" />
                  Annuler le brouillon
                </span>
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
