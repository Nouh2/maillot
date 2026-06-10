'use client'

import React from 'react'
import Link from 'next/link'

interface CollectionHeaderProps {
  title: string
  subtitle?: string
  emoji?: string
  color?: string
  breadcrumb?: { label: string; href?: string }[]
  compact?: boolean
}

export function CollectionHeader({
  title,
  subtitle,
  color = '#1c1712',
  breadcrumb = [],
  compact = false,
}: CollectionHeaderProps) {
  return (
    <div className={`w-full bg-[var(--cream)] ${compact ? 'pb-2 pt-4 md:pb-4 md:pt-6' : 'pb-4 pt-6'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Breadcrumbs */}
        <nav className={`${compact ? 'hidden md:flex' : 'flex'} mb-3 items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--grey-lt)]`}>
          <Link href="/" className="transition-colors hover:text-[var(--black)]">
            Maison
          </Link>
          <span className="opacity-30">|</span>
          <Link href="/shop" className="transition-colors hover:text-[var(--black)]">
            Collection
          </Link>
          {breadcrumb.map((item, index) => (
            <React.Fragment key={index}>
              <span className="opacity-30">|</span>
              {item.href ? (
                <Link href={item.href} className="transition-colors hover:text-[var(--black)]">
                  {item.label}
                </Link>
              ) : (
                <span className="text-[var(--black)] font-black">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Banner Section */}
        <div 
          className={`relative overflow-hidden rounded-xl ${compact ? 'bg-transparent px-0 py-0 shadow-none md:px-8 md:py-5' : 'px-6 py-4 md:px-8 md:py-5'}`}
          style={{ 
            backgroundColor: compact ? 'transparent' : color,
            boxShadow: compact ? 'none' : `0 4px 20px -5px ${color}40`
          }}
        >
          <div className="relative z-10 flex items-center justify-between">
            <h1 className={`font-bebas tracking-wide ${compact ? 'text-4xl leading-none text-[var(--black)] md:text-5xl' : 'text-3xl text-white md:text-4xl'}`}>
              {title}
            </h1>
            
            {subtitle && (
              <p className={`hidden font-condensed text-[10px] font-black uppercase tracking-widest md:block ${compact ? 'text-[var(--grey)]' : 'text-white/80'}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
