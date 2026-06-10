import { Star } from 'lucide-react'

function StarRating({ count = 5, size = 'sm' }: { count?: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'h-4 w-4' : 'h-3 w-3'
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className={`${cls} fill-[#00b67a] text-[#00b67a]`} />
      ))}
    </div>
  )
}

interface TrustBadgeProps {
  className?: string
}

export function TrustBadge({ className = '' }: TrustBadgeProps) {
  return (
    <div className={`inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--cream-3)] bg-white px-3 py-2 shadow-sm sm:gap-3 sm:px-4 ${className}`}>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <StarRating size="md" />
        <span className="whitespace-nowrap font-condensed text-sm font-bold text-[var(--black)]">Excellent</span>
      </div>
      <span className="h-4 w-px bg-[var(--cream-3)]" />
      <span className="whitespace-nowrap font-condensed text-sm font-bold text-[var(--terra)]">4.8 / 5</span>
      <span className="h-4 w-px bg-[var(--cream-3)]" />
      <span className="whitespace-nowrap font-condensed text-xs text-[var(--grey)]">+1000 clients satisfaits</span>
    </div>
  )
}
