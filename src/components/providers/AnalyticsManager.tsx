'use client'

import { useEffect, useMemo, useSyncExternalStore } from 'react'
import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { getClarityProjectId } from '@/lib/clarityConfig'
import { getTikTokPixelId } from '@/lib/tiktokConfig'
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
  const tiktokPixelId = getTikTokPixelId()
  const clarityProjectId = getClarityProjectId()

  useEffect(() => {
    captureAttribution(searchParams)
  }, [pathname, searchParams])

  useEffect(() => {
    if (consent === 'granted') {
      trackEvent('page_view', { page_path: pathname })
    }
  }, [consent, pathname])

  useEffect(() => {
    document.body.classList.toggle('maillot-cookie-pending', consent === null)

    return () => {
      document.body.classList.remove('maillot-cookie-pending')
    }
  }, [consent])

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

  const tiktokScript = useMemo(() => {
    if (!tiktokPixelId) return null

    return `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=d.createElement("script");n.type="text/javascript",n.async=true,n.src=r+"?sdkid="+e+"&lib="+t;e=d.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
        ttq.load('${tiktokPixelId}');
      }(window, document, 'ttq');
    `
  }, [tiktokPixelId])

  const clarityScript = useMemo(() => {
    if (!clarityProjectId) return null

    return `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${clarityProjectId}");
    `
  }, [clarityProjectId])

  return (
    <>
      {consent === 'granted' && gtmId ? <Script id="gtm-loader" strategy="afterInteractive">{gtmScript}</Script> : null}
      {consent === 'granted' && !gtmId && ga4Id ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
          <Script id="ga4-loader" strategy="afterInteractive">{gaScript}</Script>
        </>
      ) : null}
      {consent === 'granted' && tiktokPixelId ? (
        <Script id="tiktok-pixel-loader" strategy="afterInteractive">{tiktokScript}</Script>
      ) : null}
      {consent === 'granted' && clarityProjectId ? (
        <Script id="clarity-loader" strategy="afterInteractive">{clarityScript}</Script>
      ) : null}

      {consent === null ? (
        <div
          id="maillot-cookie-banner"
          className="fixed inset-x-2 bottom-[calc(12px+env(safe-area-inset-bottom,0px))] z-[300] mx-auto max-h-[calc(100dvh-24px-env(safe-area-inset-bottom,0px))] max-w-4xl overflow-y-auto rounded-xl border border-[var(--cream-3)] bg-white/95 p-3 shadow-xl backdrop-blur sm:bottom-3 sm:p-4"
        >
          <p className="sr-only">Cookies et mesure</p>
          <p className="text-xs leading-snug text-[var(--black)] sm:text-sm">
            Cookies de mesure pour TikTok, Clarity et analytics. Rien sans ton accord.
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setTrackingConsent('granted')
              }}
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--black)] px-4 py-2 font-condensed text-xs font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[var(--terra)]"
            >
              Accepter
            </button>
            <button
              type="button"
              onClick={() => {
                setTrackingConsent('denied')
              }}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--cream-3)] px-4 py-2 font-condensed text-xs font-bold uppercase tracking-[0.14em] text-[var(--black)] transition-colors hover:border-[var(--black)]"
            >
              Refuser
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
