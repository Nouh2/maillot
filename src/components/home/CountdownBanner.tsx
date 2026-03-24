'use client'
// src/components/home/CountdownBanner.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'

function getTimeUntilMidnight() {
  const now = new Date()
  const midnight = new Date()
  midnight.setHours(24, 0, 0, 0)
  const diff = midnight.getTime() - now.getTime()
  const h = Math.floor(diff / 1000 / 60 / 60)
  const m = Math.floor((diff / 1000 / 60) % 60)
  const s = Math.floor((diff / 1000) % 60)
  return { h, m, s }
}

function Pad({ n }: { n: number }) {
  return String(n).padStart(2, '0')
}

export function CountdownBanner() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 })

  useEffect(() => {
    setTime(getTimeUntilMidnight())
    const id = setInterval(() => setTime(getTimeUntilMidnight()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="bg-[var(--black)] py-10 px-4">
      <div className="max-w-lg mx-auto text-center">
        <p className="font-condensed text-xs uppercase tracking-[0.25em] text-[var(--terra)] mb-3">
          🔥 Offre limitée
        </p>
        <h2 className="font-condensed text-2xl sm:text-3xl font-bold uppercase tracking-[0.05em] text-white mb-2">
          3 MAILLOTS ACHETÉS ={' '}
          <span className="text-[var(--terra)]">1 OFFERT</span>
        </h2>
        <p className="font-condensed text-xs uppercase tracking-widest text-[var(--grey-lt)] mb-6">
          L&apos;offre expire dans
        </p>

        <div className="flex items-center justify-center gap-3 mb-6">
          {[
            { value: time.h, label: 'H' },
            { value: time.m, label: 'MIN' },
            { value: time.s, label: 'SEC' },
          ].map(({ value, label }, i) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div
                  className="flex items-center justify-center text-white font-condensed text-2xl font-bold"
                  style={{ width: 52, height: 56, background: 'var(--terra)', borderRadius: 4 }}
                >
                  <Pad n={value} />
                </div>
                <span className="font-condensed text-[10px] uppercase tracking-widest text-[var(--grey-lt)] mt-1">
                  {label}
                </span>
              </div>
              {i < 2 && (
                <span className="font-condensed text-2xl font-bold text-white/40 pb-4">:</span>
              )}
            </div>
          ))}
        </div>

        <p className="font-condensed text-xs text-[var(--grey-lt)] mb-6">
          Ajoute 4 maillots au panier — le 4ème est offert automatiquement au checkout
        </p>

        <Link
          href="/shop"
          className="inline-block w-full bg-white text-[var(--black)] font-condensed text-sm font-bold uppercase tracking-[0.15em] py-4 text-center hover:bg-[var(--cream)] transition-colors"
          style={{ borderRadius: 0 }}
        >
          Profiter de l&apos;offre →
        </Link>
      </div>
    </section>
  )
}
