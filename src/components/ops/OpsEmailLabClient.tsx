'use client'

import { useMemo, useState } from 'react'
import type { EmailTemplateId, EmailTemplatePreview } from '@/lib/email'

type OpsEmailLabClientProps = {
  templates: EmailTemplatePreview[]
}

export function OpsEmailLabClient({ templates }: OpsEmailLabClientProps) {
  const [testAddress, setTestAddress] = useState('')
  const [busyTemplateId, setBusyTemplateId] = useState<EmailTemplateId | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const groupedTemplates = useMemo(
    () => ({
      transactional: templates.filter((template) => template.category === 'transactional'),
      lifecycle: templates.filter((template) => template.category === 'lifecycle'),
    }),
    [templates],
  )

  async function sendTest(templateId: EmailTemplateId) {
    const email = testAddress.trim()
    if (!email) {
      setMessage('Renseigne une adresse email de test.')
      return
    }

    setBusyTemplateId(templateId)
    setMessage(null)

    try {
      const response = await fetch('/api/internal/emails/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, templateId }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        setMessage(data?.error ?? 'Envoi impossible')
        return
      }

      setMessage(`Mail de test envoyé pour ${templateId}.`)
    } catch {
      setMessage('Envoi impossible')
    } finally {
      setBusyTemplateId(null)
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-5">
        <p className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--terra)]">Email lab</p>
        <h1 className="mt-2 font-bebas text-4xl text-[var(--black)]">Emails</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--grey)]">
          Ici tu peux prévisualiser tous les mails utiles au lancement et envoyer un test vers une adresse de ton choix.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            value={testAddress}
            onChange={(event) => setTestAddress(event.target.value)}
            placeholder="Adresse email de test"
            className="w-full rounded-2xl border border-[var(--cream-3)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--terra)]"
          />
        </div>

        {message ? <p className="mt-4 text-sm text-[var(--terra)]">{message}</p> : null}
      </section>

      {([
        ['transactional', 'Emails transactionnels'],
        ['lifecycle', 'Emails lifecycle / marketing'],
      ] as const).map(([category, label]) => (
        <section key={category} className="space-y-4">
          <div>
            <p className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--terra)]">{label}</p>
          </div>

          <div className="grid gap-4">
            {groupedTemplates[category].map((template) => (
              <article key={template.id} className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-condensed text-xs uppercase tracking-[0.16em] text-[var(--terra)]">
                      {template.label}
                    </p>
                    <h2 className="mt-2 font-condensed text-lg font-bold uppercase tracking-[0.08em] text-[var(--black)]">
                      {template.subject}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--grey)]">{template.preview}</p>
                  </div>

                  <button
                    type="button"
                    disabled={busyTemplateId === template.id}
                    onClick={() => sendTest(template.id)}
                    className="rounded-full bg-[var(--black)] px-4 py-3 text-xs font-condensed uppercase tracking-[0.16em] text-white disabled:opacity-60"
                  >
                    Envoyer un test
                  </button>
                </div>

                <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-[var(--cream-3)]">
                  <iframe
                    title={template.label}
                    srcDoc={template.html}
                    className="h-[560px] w-full bg-white"
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
