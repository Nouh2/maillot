'use client'

import React from 'react'
import Link from 'next/link'

interface CollectionHeaderProps {
  title: string
  subtitle?: string
  emoji?: string
  color?: string
  breadcrumb?: { label: string; href?: string }[]
}

export function CollectionHeader({
  title,
  subtitle,
  color = '#1c1712',
  breadcrumb = [],
}: CollectionHeaderProps) {
  return (
    <div className="w-full bg-[var(--cream)] pb-4 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Breadcrumbs */}
        <nav className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--grey-lt)]">
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
          className="relative overflow-hidden rounded-xl px-6 py-4 md:px-8 md:py-5"
          style={{ 
            backgroundColor: color,
            boxShadow: `0 4px 20px -5px ${color}40`
          }}
        >
          <div className="relative z-10 flex items-center justify-between">
            <h1 className="font-bebas text-3xl tracking-wide text-white md:text-4xl">
              {title}
            </h1>
            
            {subtitle && (
              <p className="hidden font-condensed text-[10px] font-black uppercase tracking-widest text-white/80 md:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
