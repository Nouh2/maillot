import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full font-condensed tracking-widest uppercase transition-all',
        {
          'bg-[var(--terra)] text-white hover:bg-[var(--terra-2)] active:scale-95': variant === 'primary',
          'border-2 border-[var(--terra)] text-[var(--terra)] hover:bg-[var(--terra-lt)]': variant === 'secondary',
          'text-[var(--grey)] hover:text-[var(--black)]': variant === 'ghost',
          'px-4 py-2 text-sm': size === 'sm',
          'px-6 py-3 text-base': size === 'md',
          'min-h-[56px] px-8 py-4 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
