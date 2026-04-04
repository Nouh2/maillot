import { redirect } from 'next/navigation'
import { OpsLoginForm } from '@/components/ops/OpsLoginForm'
import { OpsInstallPrompt } from '@/components/ops/OpsInstallPrompt'
import { getOpsExpectedUsername, getOpsSession } from '@/lib/opsAuth'

export const metadata = { title: 'Ops Login' }

export default async function OpsLoginPage() {
  const session = await getOpsSession()
  if (session) {
    redirect('/ops')
  }

  return (
    <div className="min-h-screen bg-[var(--cream)] px-4 py-10">
      <div className="mx-auto max-w-md space-y-4">
        <OpsInstallPrompt />

        <div className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-6 shadow-[0_18px_40px_rgba(0,0,0,0.06)]">
          <p className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--terra)]">Webapp interne</p>
          <h1 className="mt-3 font-bebas text-5xl text-[var(--black)]">OPS LOGIN</h1>
          <p className="mt-4 text-sm leading-relaxed text-[var(--grey)]">
            Connexion rapide pour gerer les commandes depuis un telephone ou n importe quel navigateur.
          </p>
          <div className="mt-6">
            <OpsLoginForm defaultUsername={getOpsExpectedUsername()} />
          </div>
        </div>
      </div>
    </div>
  )
}
