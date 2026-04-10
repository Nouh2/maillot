import { redirect } from 'next/navigation'
import { OpsEmailLabClient } from '@/components/ops/OpsEmailLabClient'
import { OpsPageShell } from '@/components/ops/OpsPageShell'
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
    <OpsPageShell maxWidth="5xl">
      <OpsEmailLabClient templates={templates} />
    </OpsPageShell>
  )
}
