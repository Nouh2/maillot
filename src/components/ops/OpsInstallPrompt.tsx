'use client'

import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function OpsInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  function closePrompt() {
    setDismissed(true)
    window.localStorage.setItem('ops-install-dismissed', '1')
  }

  async function handleInstall() {
    if (!installEvent) return

    await installEvent.prompt()
    await installEvent.userChoice
    setInstallEvent(null)
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--terra)]">Acces rapide</p>
          <h2 className="mt-2 font-bebas text-3xl text-[var(--black)]">Installer la webapp</h2>
        </div>
        <button
          type="button"
          onClick={closePrompt}
          className="rounded-full border border-[var(--cream-3)] px-3 py-1 text-xs font-condensed uppercase tracking-[0.16em] text-[var(--grey)]"
        >
          Fermer
        </button>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-[var(--grey)]">
        Ca ajoute une icone sur l&apos;ecran d&apos;accueil pour ouvrir directement le back-office sans retaper l&apos;URL.
      </p>

      {installEvent ? (
        <button
          type="button"
          onClick={handleInstall}
          className="mt-4 inline-flex rounded-full bg-[var(--black)] px-5 py-3 font-condensed text-xs uppercase tracking-[0.18em] text-white"
        >
          Installer maintenant
        </button>
      ) : null}

      <div className="mt-4 space-y-2 text-sm text-[var(--black)]">
        <p>iPhone: ouvre cette page dans Safari, touche Partager, puis Sur l&apos;ecran d&apos;accueil.</p>
        <p>Android: ouvre le menu du navigateur puis Ajouter a l&apos;ecran d&apos;accueil ou Installer l&apos;application.</p>
        <p>
          Acces direct: ouvre simplement <strong>/ops/login</strong> depuis ton telephone si tu ne veux pas l&apos;installer.
        </p>
      </div>
    </section>
  )
}
