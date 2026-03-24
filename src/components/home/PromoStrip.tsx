'use client'
// src/components/home/PromoStrip.tsx
import { useState, useEffect } from 'react'

const MESSAGES = [
  '🚚 LIVRAISON OFFERTE DÈS 60€ · EXPÉDITION 24/48H',
  '⭐ 4.9/5 · PLUS DE 1 000 CLIENTS SATISFAITS',
  '🏆 390+ MAILLOTS · TOUS LES GRANDS CLUBS',
]

export function PromoStrip() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % MESSAGES.length)
        setVisible(true)
      }, 300)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-[var(--terra)] py-2.5 px-4 overflow-hidden">
      <p
        className="text-center font-condensed text-xs font-bold uppercase tracking-[0.05em] text-white transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {MESSAGES[index]}
      </p>
    </div>
  )
}
