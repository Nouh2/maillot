import { OpsInstallPrompt } from '@/components/ops/OpsInstallPrompt'
import { OpsNavigation } from '@/components/ops/OpsNavigation'

type OpsPageShellProps = {
  children: React.ReactNode
  maxWidth?: '3xl' | '5xl' | '7xl'
}

const MAX_WIDTH_CLASS: Record<NonNullable<OpsPageShellProps['maxWidth']>, string> = {
  '3xl': 'max-w-3xl',
  '5xl': 'max-w-5xl',
  '7xl': 'max-w-7xl',
}

export function OpsPageShell({ children, maxWidth = '5xl' }: OpsPageShellProps) {
  return (
    <div className="min-h-screen bg-[var(--cream)] px-4 py-6 sm:px-6">
      <div className={`mx-auto space-y-4 ${MAX_WIDTH_CLASS[maxWidth]}`}>
        <OpsInstallPrompt />
        <OpsNavigation />
        {children}
      </div>
    </div>
  )
}
