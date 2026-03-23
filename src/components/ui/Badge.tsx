import { cn } from '@/lib/utils'

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn(
      'inline-block font-condensed text-xs tracking-widest uppercase px-2 py-0.5',
      'bg-[var(--terra-lt)] text-[var(--terra)] border border-[var(--terra-mid)]',
      className
    )}>
      {children}
    </span>
  )
}
