'use client'
import { useDeferredValue, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthAccountLink } from '@/components/layout/AuthAccountLink'
import { CartButton } from '@/components/cart/CartButton'
import { CONCEPT_HREF, getLeagueNavigationOptions, NATIONAL_TEAMS_HREF, REST_OF_WORLD_HREF } from '@/lib/catalog'
import { normalizeCatalogText } from '@/lib/catalogEntityRegistry'
import type { League } from '@/types/product'
import {
  ArrowRight,
  ChevronRight,
  HelpCircle,
  Menu,
  MessageCircle,
  Package,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react'

interface NavbarClientProps {
  leagues: League[]
  searchSuggestions: string[]
}

const DEFAULT_SEARCH_TAGS = ['Real Madrid', 'France', 'Paris Saint-Germain', 'Barcelone', 'Maroc']

function matchesSuggestionPrefix(suggestion: string, query: string): boolean {
  const normalizedSuggestion = normalizeCatalogText(suggestion)
  const normalizedQuery = normalizeCatalogText(query)

  if (!normalizedQuery) return true

  return normalizedSuggestion.startsWith(normalizedQuery)
}

export function NavbarClient({ leagues, searchSuggestions }: NavbarClientProps) {
  const router = useRouter()
  const leagueNavigation = getLeagueNavigationOptions(leagues)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showLeagues, setShowLeagues] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const normalizedSearchQuery = normalizeCatalogText(deferredSearchQuery)
  const liveSuggestions = normalizedSearchQuery
    ? searchSuggestions.filter((suggestion) => matchesSuggestionPrefix(suggestion, normalizedSearchQuery)).slice(0, 8)
    : []

  const closeMobileMenu = () => {
    setMobileOpen(false)
    setShowLeagues(false)
  }

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleSuggestionSelect = (suggestion: string) => {
    setSearchQuery(suggestion)
    router.push(`/shop?q=${encodeURIComponent(suggestion)}`)
    setSearchOpen(false)
    setSearchQuery('')
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) closeMobileMenu()
    }
    window.addEventListener('resize', handleResize)

    if (mobileOpen || searchOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      document.body.style.overflow = ''
    }
  }, [mobileOpen, searchOpen])

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--cream-3)] bg-white/95 backdrop-blur-sm">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="transition-transform hover:scale-[1.02]">
            <svg height="26" viewBox="0 0 160 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[26px] w-auto sm:h-[30px]">
              <text x="0" y="22"
                fontFamily="'Barlow Condensed', sans-serif"
                fontWeight="900" fontSize="24"
                fill="#1C1712" letterSpacing="1">
                MAILLOT
              </text>
              <text x="89" y="22"
                fontFamily="'Barlow Condensed', sans-serif"
                fontWeight="900" fontSize="24"
                fill="#C1440E" letterSpacing="1">
                 ADDICT
              </text>
            </svg>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <div className="group relative">
              <button className="flex items-center gap-1 font-condensed text-sm uppercase tracking-widest text-[var(--black)] transition-colors hover:text-[var(--terra)]">
                Championnats
                <ChevronRight className="h-3 w-3 rotate-90" />
              </button>
              <div className="invisible absolute left-0 top-full mt-2 w-64 border border-[var(--cream-3)] bg-white py-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                {leagueNavigation.map((league) => (
                  <Link
                    key={league.id}
                    href={`/ligue/${league.slug}`}
                    className="flex items-center gap-3 px-4 py-2.5 font-condensed text-sm uppercase tracking-wide transition-colors hover:bg-[var(--cream)] hover:text-[var(--terra)]"
                  >
                    <span>{league.flag_emoji}</span>
                    {league.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/coupe-du-monde" className="font-condensed text-sm font-black uppercase tracking-widest text-[var(--terra)] transition-colors hover:text-[var(--black)]">
              Coupe du Monde
            </Link>
            <Link href={CONCEPT_HREF} className="font-condensed text-sm uppercase tracking-widest text-[var(--black)] transition-colors hover:text-[var(--terra)]">
              Maillots concept
            </Link>
            <Link href={NATIONAL_TEAMS_HREF} className="font-condensed text-sm uppercase tracking-widest text-[var(--black)] transition-colors hover:text-[var(--terra)]">
              Sélections nationales
            </Link>
            <Link href={REST_OF_WORLD_HREF} className="font-condensed text-sm uppercase tracking-widest text-[var(--black)] transition-colors hover:text-[var(--terra)]">
              Reste du monde
            </Link>
            <Link href="/retro" className="font-condensed text-sm uppercase tracking-widest text-[var(--black)] transition-colors hover:text-[var(--terra)]">
              Retro
            </Link>
            <Link href="/shop" className="font-condensed text-sm uppercase tracking-widest text-[var(--black)] transition-colors hover:text-[var(--terra)]">
              Tous les maillots
            </Link>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="group rounded-full p-2 text-[var(--black)] transition-colors hover:bg-[var(--cream)]"
              aria-label="Rechercher"
            >
              <Search className="h-6 w-6 transition-transform group-hover:scale-110" />
            </button>

            <AuthAccountLink />
            <CartButton />
            <button
              className="rounded-full p-2 text-[var(--black)] transition-colors hover:bg-[var(--cream)] md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </header>

      <div className={`fixed inset-0 z-[100] bg-white transition-all duration-500 ease-in-out ${searchOpen ? 'translate-y-0 opacity-100 visible' : '-translate-y-full opacity-0 invisible'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-20 items-center justify-between md:h-24">
            <svg height="26" viewBox="0 0 160 26" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[26px] w-auto sm:h-[30px]">
              <text x="0" y="22"
                fontFamily="'Barlow Condensed', sans-serif"
                fontWeight="900" fontSize="24"
                fill="#1C1712" letterSpacing="1">
                MAILLOT
              </text>
              <text x="89" y="22"
                fontFamily="'Barlow Condensed', sans-serif"
                fontWeight="900" fontSize="24"
                fill="#C1440E" letterSpacing="1">
                 ADDICT
              </text>
            </svg>
            <button onClick={() => setSearchOpen(false)} className="p-2 transition-transform hover:rotate-90">
              <X className="h-8 w-8 text-[var(--black)]" />
            </button>
          </div>

          <div className="py-10 md:py-20">
            <form onSubmit={handleSearch} className="group relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="RECHERCHER UN MAILLOT, UNE EQUIPE..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-b-2 border-[#E5E5E5] bg-transparent pb-4 text-2xl font-black uppercase tracking-tight text-[var(--black)] placeholder-[#E5E5E5] transition-colors focus:border-[var(--black)] focus:outline-none md:text-5xl"
              />
              <button type="submit" className="absolute bottom-6 right-0 p-2 text-[#E5E5E5] transition-colors group-focus-within:text-[var(--black)]">
                <ArrowRight className="h-10 w-10 md:h-14 md:w-14" />
              </button>
            </form>

            <div className="mt-12">
              {normalizedSearchQuery ? (
                <div className="rounded-[2rem] border border-[var(--cream-3)] bg-[var(--cream)]/70 p-4 md:p-6">
                  <p className="mb-4 font-condensed text-sm font-bold uppercase tracking-widest text-[#707072]">Suggestions clubs et sélections</p>
                  {liveSuggestions.length > 0 ? (
                    <div className="grid gap-2">
                      {liveSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleSuggestionSelect(suggestion)}
                          className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 text-left transition-colors hover:bg-[var(--black)] hover:text-white"
                        >
                          <span className="font-condensed text-lg font-bold uppercase tracking-[0.08em]">{suggestion}</span>
                          <ArrowRight className="h-5 w-5" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#707072]">Aucun club ou sélection ne commence par cette saisie.</p>
                  )}
                </div>
              ) : (
                <>
                  <p className="mb-6 font-condensed text-sm font-bold uppercase tracking-widest text-[#707072]">Suggestions</p>
                  <div className="flex flex-wrap gap-3">
                    {DEFAULT_SEARCH_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleSuggestionSelect(tag)}
                        className="rounded-full bg-[var(--cream)] px-6 py-2 text-[15px] font-bold transition-all hover:bg-[var(--black)] hover:text-white"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`fixed inset-0 z-[60] transition-opacity duration-300 md:hidden ${mobileOpen ? 'opacity-100 visible' : 'pointer-events-none opacity-0 invisible'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeMobileMenu} />

        <div className={`absolute right-0 top-0 flex h-full w-[85%] max-w-sm transform flex-col bg-white shadow-2xl transition-all duration-500 ease-out ${mobileOpen ? 'translate-x-0 visible' : 'translate-x-full invisible'}`}>
          <div className="flex items-center justify-end p-4">
            <button onClick={closeMobileMenu} className="p-2 transition-transform hover:rotate-90">
              <X className="h-7 w-7 text-[var(--black)]" />
            </button>
          </div>

          <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-4">
            <div className="mb-10 space-y-4">
              <button onClick={() => setShowLeagues(!showLeagues)} className="flex w-full items-center justify-between py-2">
                <span className="text-[28px] font-black uppercase tracking-tight text-[var(--black)]">Championnats</span>
                <ChevronRight className={`h-6 w-6 text-[var(--black)] transition-transform duration-300 ${showLeagues ? 'rotate-90' : ''}`} />
              </button>

              {showLeagues && (
                <div className="mt-4 space-y-3 border-l-2 border-[var(--cream-3)] pl-4 animate-in slide-in-from-left-2 duration-300">
                  {leagueNavigation.map((league) => (
                    <Link
                      key={league.id}
                      href={`/ligue/${league.slug}`}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 font-condensed text-lg font-bold uppercase tracking-wide text-[var(--grey)] hover:text-[var(--terra)]"
                    >
                      <span className="text-xl">{league.flag_emoji}</span>
                      {league.name}
                    </Link>
                  ))}
                </div>
              )}

              <Link href="/coupe-du-monde" onClick={closeMobileMenu} className="flex items-center justify-between py-2">
                <span className="text-[28px] font-black uppercase tracking-tight text-[var(--terra)]">Coupe du Monde</span>
                <ChevronRight className="h-6 w-6 text-[var(--terra)]" />
              </Link>
              <Link href={CONCEPT_HREF} onClick={closeMobileMenu} className="flex items-center justify-between py-2">
                <span className="text-[28px] font-black uppercase tracking-tight text-[var(--black)]">Concept</span>
                <ChevronRight className="h-6 w-6 text-[var(--black)]" />
              </Link>
              <Link href={NATIONAL_TEAMS_HREF} onClick={closeMobileMenu} className="flex items-center justify-between py-2">
                <span className="text-[28px] font-black uppercase tracking-tight text-[var(--black)]">Sélections</span>
                <ChevronRight className="h-6 w-6 text-[var(--black)]" />
              </Link>
              <Link href={REST_OF_WORLD_HREF} onClick={closeMobileMenu} className="flex items-center justify-between py-2">
                <span className="text-[28px] font-black uppercase tracking-tight text-[var(--black)]">Reste du monde</span>
                <ChevronRight className="h-6 w-6 text-[var(--black)]" />
              </Link>
              <Link href="/retro" onClick={closeMobileMenu} className="flex items-center justify-between py-2">
                <span className="text-[28px] font-black uppercase tracking-tight text-[var(--black)]">Retro</span>
                <ChevronRight className="h-6 w-6 text-[var(--black)]" />
              </Link>
              <Link href="/shop" onClick={closeMobileMenu} className="flex items-center justify-between py-2">
                <span className="text-[28px] font-black uppercase tracking-tight text-[var(--black)]">Tout voir</span>
                <ChevronRight className="h-6 w-6 text-[var(--black)]" />
              </Link>
            </div>

            <div className="mb-10 flex flex-col gap-8 border-t border-[var(--cream-3)] pt-10">
              <p className="text-[16px] leading-relaxed text-[#707072]">
                Deviens membre <span className="font-bold text-[var(--black)]">MAILLOT ADDICT</span> pour accéder au meilleur des produits et profiter d’offres exclusives. <span className="cursor-pointer font-bold text-[var(--black)] underline">En savoir plus</span>
              </p>
              <div className="flex gap-3">
                <Link
                  href="/compte"
                  onClick={closeMobileMenu}
                  className="min-w-[120px] rounded-full bg-[var(--black)] px-6 py-2 text-center text-[15px] font-bold text-white transition-opacity hover:opacity-70"
                >
                  Rejoins-nous
                </Link>
                <Link
                  href="/compte"
                  onClick={closeMobileMenu}
                  className="min-w-[120px] rounded-full border border-[#E5E5E5] bg-white px-6 py-2 text-center text-[15px] font-bold text-[var(--black)] transition-colors hover:border-[var(--black)]"
                >
                  S’identifier
                </Link>
              </div>
            </div>

            <div className="space-y-6 border-t border-[var(--cream-3)] pb-20 pt-10">
              <Link href="/faq" onClick={closeMobileMenu} className="group flex items-center gap-4">
                <HelpCircle className="h-6 w-6 text-[var(--black)]" strokeWidth={1} />
                <span className="text-[16px] font-bold text-[var(--black)]">Aide</span>
              </Link>
              <Link href="/panier" onClick={closeMobileMenu} className="group flex items-center gap-4">
                <ShoppingBag className="h-6 w-6 text-[var(--black)]" strokeWidth={1} />
                <span className="text-[16px] font-bold text-[var(--black)]">Panier</span>
              </Link>
              <Link href="/suivi" onClick={closeMobileMenu} className="group flex items-center gap-4">
                <Package className="h-6 w-6 text-[var(--black)]" strokeWidth={1} />
                <span className="text-[16px] font-bold text-[var(--black)]">Commandes</span>
              </Link>
              <Link href="/contact" onClick={closeMobileMenu} className="group flex items-center gap-4">
                <MessageCircle className="h-6 w-6 text-[var(--black)]" strokeWidth={1} />
                <span className="text-[16px] font-bold text-[var(--black)]">Contact</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
