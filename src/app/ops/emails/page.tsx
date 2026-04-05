import { redirect } from 'next/navigation'
import { OpsEmailLabClient } from '@/components/ops/OpsEmailLabClient'
import { OpsInstallPrompt } from '@/components/ops/OpsInstallPrompt'
import { getEmailTemplatePreviews } from '@/lib/email'
import { getOpsSession } from '@/lib/opsAuth'

export const metadata = { title: 'Ops Emails' }

export default async function OpsEmailsPage() {
  const session = await getOpsSession()
  if (!session) {
    redirect('/ops/login')
  }

  const templates = getEmailTemplatePreviews()

  return (
    <div className="min-h-screen bg-[var(--cream)] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <OpsInstallPrompt />
        <OpsEmailLabClient templates={templates} />
      </div>
    </div>
  )
}
