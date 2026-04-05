'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LAUNCH_PROMO_CTA, LAUNCH_PROMO_DURATION_DAYS, LAUNCH_PROMO_ENABLED, LAUNCH_PROMO_LABEL, LAUNCH_PROMO_START_ISO } from '@/lib/siteConfig'

function getPromoEndDate() {
  if (!LAUNCH_PROMO_START_ISO) return null
  const start = new Date(LAUNCH_PROMO_START_ISO)
  return new Date(start.getTime() + LAUNCH_PROMO_DURATION_DAYS * 24 * 60 * 60 * 1000)
}

function getTimeUntilPromoEnd() {
  const now = new Date()
  const promoEnd = getPromoEndDate()
  if (!promoEnd) return { h: 0, m: 0 }
  const diff = Math.max(0, promoEnd.getTime() - now.getTime())
  const h = Math.floor(diff / 1000 / 60 / 60)
  const m = Math.floor((diff / 1000 / 60) % 60)
  return { h, m }
}

function Pad({ n }: { n: number }) {
  return String(n).padStart(2, '0')
}

export function CountdownBanner() {
  const [time, setTime] = useState({ h: 0, m: 0 })

  useEffect(() => {
    if (!LAUNCH_PROMO_ENABLED || !LAUNCH_PROMO_START_ISO) return

    const syncTime = () => setTime(getTimeUntilPromoEnd())
    const timeoutId = window.setTimeout(syncTime, 0)
    const intervalId = window.setInterval(syncTime, 60_000)

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [])

  if (!LAUNCH_PROMO_ENABLED || !LAUNCH_PROMO_START_ISO) return null

  return (
    <section className="bg-[var(--black)] px-4 py-10">
      <div className="mx-auto max-w-lg text-center">
        <p className="mb-3 font-condensed text-xs uppercase tracking-[0.25em] text-[var(--terra)]">{LAUNCH_PROMO_LABEL}</p>
        <h2 className="mb-2 font-condensed text-2xl font-bold uppercase tracking-[0.05em] text-white sm:text-3xl">
          PRIX PROMO SUR{' '}
          <span className="text-[var(--terra)]">TOUS LES MAILLOTS</span>
        </h2>
        <p className="mb-6 font-condensed text-xs uppercase tracking-widest text-[var(--grey-lt)]">L&apos;offre se termine dans</p>

        <div className="mb-6 flex items-center justify-center gap-3">
          {[
            { value: time.h, label: 'H' },
            { value: time.m, label: 'MIN' },
          ].map(({ value, label }, index) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-14 w-[52px] items-center justify-center text-2xl font-condensed font-bold text-white" style={{ background: 'var(--terra)', borderRadius: 4 }}>
                  <Pad n={value} />
                </div>
                <span className="mt-1 font-condensed text-[10px] uppercase tracking-widest text-[var(--grey-lt)]">{label}</span>
              </div>
              {index < 1 ? <span className="pb-4 font-condensed text-2xl font-bold text-white/40">:</span> : null}
            </div>
          ))}
        </div>

        <p className="mb-6 font-condensed text-xs text-[var(--grey-lt)]">{LAUNCH_PROMO_CTA}</p>

        <Link
          href="/shop"
          className="inline-block w-full bg-white py-4 text-center font-condensed text-sm font-bold uppercase tracking-[0.15em] text-[var(--black)] transition-colors hover:bg-[var(--cream)]"
          style={{ borderRadius: 0 }}
        >
          Profiter de l&apos;offre →
        </Link>
      </div>
    </section>
  )
}
