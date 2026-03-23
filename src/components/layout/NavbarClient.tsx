'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CartButton } from '@/components/cart/CartButton'
import { NATIONAL_TEAMS_HREF } from '@/lib/catalog'
import type { League } from '@/types/product'
import { 
  ChevronRight, 
  X, 
  HelpCircle, 
  ShoppingBag, 
  Package, 
  MessageCircle,
  Menu
} from 'lucide-react'

interface NavbarClientProps {
  leagues: League[]
  userEmail: string | null
}

export function NavbarClient({ leagues, userEmail }: NavbarClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showLeagues, setShowLeagues] = useState(false)

  const closeMobileMenu = () => {
    setMobileOpen(false)
    setShowLeagues(false)
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) closeMobileMenu()
    }
    window.addEventListener('resize', handleResize)
    
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      window.removeEventListener('resize', handleResize)
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--cream-3)] bg-white/95 backdrop-blur-sm">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-bebas text-3xl tracking-widest text-[var(--black)] transition-colors hover:text-[var(--terra)]">
            KITLAB
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/shop" className="font-condensed text-sm uppercase tracking-widest text-[var(--black)] transition-colors hover:text-[var(--terra)]">
              Tous les maillots
            </Link>
            <Link href={NATIONAL_TEAMS_HREF} className="font-condensed text-sm uppercase tracking-widest text-[var(--black)] transition-colors hover:text-[var(--terra)]">
              Selections nationales
            </Link>
            <div className="group relative">
              <button className="flex items-center gap-1 font-condensed text-sm uppercase tracking-widest text-[var(--black)] transition-colors hover:text-[var(--terra)]">
                Championnats
                <ChevronRight className="h-3 w-3 rotate-90" />
              </button>
              <div className="invisible absolute left-0 top-full mt-2 w-64 border border-[var(--cream-3)] bg-white py-2 shadow-lg opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                {leagues.map((league) => (
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
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/compte"
              className="hidden rounded-full border border-[var(--black)] px-5 py-2 text-[14px] font-bold text-[var(--black)] transition-all hover:bg-[var(--black)] hover:text-white md:inline-flex"
            >
              {userEmail ? 'Mon Compte' : 'Se Connecter'}
            </Link>
            <CartButton />
            <button
              className="rounded-full p-2 text-[var(--black)] md:hidden hover:bg-[var(--cream)] transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Sidebar */}
      <div 
        className={`fixed inset-0 z-[60] md:hidden transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={closeMobileMenu}
        />
        
        {/* Panel */}
        <div 
          className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-500 ease-out transform flex flex-col ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Header */}
          <div className="flex items-center justify-end p-4">
            <button 
              onClick={closeMobileMenu}
              className="p-2 transition-transform hover:rotate-90"
            >
              <X className="h-7 w-7 text-[var(--black)]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
            {/* Main Links */}
            <div className="space-y-4 mb-10">
              <Link
                href="/shop"
                onClick={closeMobileMenu}
                className="flex items-center justify-between py-2"
              >
                <span className="text-[28px] font-black uppercase tracking-tight text-[var(--black)]">Tout voir</span>
                <ChevronRight className="h-6 w-6 text-[var(--black)]" />
              </Link>
              <Link
                href={NATIONAL_TEAMS_HREF}
                onClick={closeMobileMenu}
                className="flex items-center justify-between py-2"
              >
                <span className="text-[28px] font-black uppercase tracking-tight text-[var(--black)]">Sélections</span>
                <ChevronRight className="h-6 w-6 text-[var(--black)]" />
              </Link>
              <button
                onClick={() => setShowLeagues(!showLeagues)}
                className="w-full flex items-center justify-between py-2"
              >
                <span className="text-[28px] font-black uppercase tracking-tight text-[var(--black)]">Championnats</span>
                <ChevronRight className={`h-6 w-6 text-[var(--black)] transition-transform duration-300 ${showLeagues ? 'rotate-90' : ''}`} />
              </button>
              
              {showLeagues && (
                <div className="pl-4 space-y-3 mt-4 border-l-2 border-[var(--cream-3)] animate-in slide-in-from-left-2 duration-300">
                  {leagues.map((l) => (
                    <Link
                      key={l.id}
                      href={`/ligue/${l.slug}`}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 text-lg font-bold font-condensed uppercase tracking-wide text-[var(--grey)] hover:text-[var(--terra)]"
                    >
                      <span className="text-xl">{l.flag_emoji}</span>
                      {l.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-10 pt-10 border-t border-[var(--cream-3)] flex flex-col gap-8">
              <p className="text-[#707072] text-[16px] leading-relaxed">
                Deviens membre <span className="font-bold text-[var(--black)]">KITLAB</span> pour accéder au meilleur des produits et profiter d&apos;offres exclusives. <span className="font-bold text-[var(--black)] underline cursor-pointer">En savoir plus</span>
              </p>
              <div className="flex gap-3">
                <Link
                  href="/compte"
                  onClick={closeMobileMenu}
                  className="px-6 py-2 bg-[var(--black)] text-white text-[15px] font-bold rounded-full hover:opacity-70 transition-opacity min-w-[120px] text-center"
                >
                  Rejoins-nous
                </Link>
                <Link
                  href="/compte"
                  onClick={closeMobileMenu}
                  className="px-6 py-2 bg-white text-[var(--black)] border border-[#E5E5E5] text-[15px] font-bold rounded-full hover:border-[var(--black)] transition-colors min-w-[120px] text-center"
                >
                  S&apos;identifier
                </Link>
              </div>
            </div>

            {/* Bottom Utilities */}
            <div className="space-y-6 pt-10 border-t border-[var(--cream-3)] pb-20">
              <Link
                href="/faq"
                onClick={closeMobileMenu}
                className="flex items-center gap-4 group"
              >
                <HelpCircle className="h-6 w-6 text-[var(--black)]" strokeWidth={1} />
                <span className="text-[16px] font-bold text-[var(--black)]">Aide</span>
              </Link>
              <Link
                href="/panier"
                onClick={closeMobileMenu}
                className="flex items-center gap-4 group"
              >
                <ShoppingBag className="h-6 w-6 text-[var(--black)]" strokeWidth={1} />
                <span className="text-[16px] font-bold text-[var(--black)]">Panier</span>
              </Link>
              <Link
                href="/suivi"
                onClick={closeMobileMenu}
                className="flex items-center gap-4 group"
              >
                <Package className="h-6 w-6 text-[var(--black)]" strokeWidth={1} />
                <span className="text-[16px] font-bold text-[var(--black)]">Commandes</span>
              </Link>
              <Link
                href="/contact"
                onClick={closeMobileMenu}
                className="flex items-center gap-4 group"
              >
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
