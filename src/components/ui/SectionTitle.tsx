import { cn } from '@/lib/utils'

export function SectionTitle({ children, sub, center, className }: {
  children: React.ReactNode
  sub?: string
  center?: boolean
  className?: string
}) {
  return (
    <div className={cn('mb-8', center && 'text-center', className)}>
      {sub && (
        <p className="font-condensed text-sm tracking-[4px] uppercase text-[var(--terra)] mb-2">{sub}</p>
      )}
      <h2 className="font-bebas text-5xl md:text-6xl leading-none text-[var(--black)]">{children}</h2>
    </div>
  )
}
