'use client'

import { useEffect, useMemo, useSyncExternalStore } from 'react'
import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  captureAttribution,
  getTrackingConsent,
  setTrackingConsent,
  subscribeToTrackingConsent,
  trackEvent,
} from '@/lib/tracking'

export function AnalyticsManager() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const consent = useSyncExternalStore(subscribeToTrackingConsent, getTrackingConsent, () => null)
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim()
  const ga4Id = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim()

  useEffect(() => {
    captureAttribution(searchParams)
  }, [pathname, searchParams])

  useEffect(() => {
    if (consent === 'granted') {
      trackEvent('page_view', { page_path: pathname })
    }
  }, [consent, pathname])

  const gtmScript = useMemo(() => {
    if (!gtmId) return null

    return `
      window.dataLayer = window.dataLayer || [];
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
      var f=d.getElementsByTagName(s)[0], j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
      j.async=true; j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl; f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');
    `
  }, [gtmId])

  const gaScript = useMemo(() => {
    if (!ga4Id) return null

    return `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', '${ga4Id}', { send_page_view: false });
    `
  }, [ga4Id])

  return (
    <>
      {consent === 'granted' && gtmId ? <Script id="gtm-loader" strategy="afterInteractive">{gtmScript}</Script> : null}
      {consent === 'granted' && !gtmId && ga4Id ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
          <Script id="ga4-loader" strategy="afterInteractive">{gaScript}</Script>
        </>
      ) : null}

      {consent === null ? (
        <div className="fixed bottom-4 left-4 right-4 z-[70] mx-auto max-w-3xl rounded-[2rem] border border-[var(--cream-3)] bg-white p-5 shadow-xl">
          <p className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--terra)]">Cookies et mesure</p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--black)]">
            Nous utilisons des cookies de mesure pour suivre les campagnes et ameliorer la boutique. Rien n&apos;est active sans ton accord.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setTrackingConsent('granted')
              }}
              className="inline-flex items-center justify-center rounded-full bg-[var(--black)] px-5 py-3 font-condensed text-sm uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--terra)]"
            >
              Accepter
            </button>
            <button
              type="button"
              onClick={() => {
                setTrackingConsent('denied')
              }}
              className="inline-flex items-center justify-center rounded-full border border-[var(--cream-3)] px-5 py-3 font-condensed text-sm uppercase tracking-[0.18em] text-[var(--black)] transition-colors hover:border-[var(--black)]"
            >
              Refuser
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
