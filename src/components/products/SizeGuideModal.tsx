'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'

export function SizeGuideModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col border-2 border-[var(--black)] bg-white shadow-[4px_4px_0px_0px_var(--terra)] md:shadow-[8px_8px_0px_0px_var(--terra)]">
        <div className="flex shrink-0 items-center justify-between border-b-2 border-[var(--black)] bg-[var(--cream)] p-4">
          <h2 className="font-bebas text-xl md:text-2xl uppercase tracking-wider text-[var(--black)]">
            Guide des Tailles
          </h2>
          <button
            onClick={onClose}
            className="p-1 transition-colors hover:text-[var(--terra)]"
            aria-label="Fermer le guide des tailles"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
          <p className="font-condensed text-sm md:text-base leading-relaxed text-[var(--grey)]">
            Les mesures sont en centimetres (cm) et representent le maillot pose a plat. Nous vous conseillons de prendre votre taille habituelle pour une coupe standard.
          </p>

          <div className="overflow-x-auto border border-[var(--cream-3)] rounded-sm">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="border-b-2 border-[var(--black)] p-2 md:pb-3 font-mono text-[10px] md:text-xs uppercase tracking-widest text-[var(--grey)]">Taille</th>
                  <th className="border-b-2 border-[var(--black)] p-2 md:pb-3 text-center font-mono text-[10px] md:text-xs uppercase tracking-widest text-[var(--grey)]">Largeur (Poitrine)</th>
                  <th className="border-b-2 border-[var(--black)] p-2 md:pb-3 text-center font-mono text-[10px] md:text-xs uppercase tracking-widest text-[var(--grey)]">Longueur</th>
                </tr>
              </thead>
              <tbody className="font-condensed text-base md:text-lg">
                {[
                  { size: 'S', width: '49', length: '70' },
                  { size: 'M', width: '51', length: '72' },
                  { size: 'L', width: '53', length: '74' },
                  { size: 'XL', width: '55', length: '76' },
                  { size: 'XXL', width: '57', length: '78' },
                  { size: '3XL', width: '60', length: '80' },
                ].map((row) => (
                  <tr key={row.size} className="border-b border-[var(--cream-3)] transition-colors hover:bg-[var(--cream)]">
                    <td className="p-2 md:py-4 font-bold text-[var(--black)]">{row.size}</td>
                    <td className="p-2 md:py-4 text-center">{row.width}</td>
                    <td className="p-2 md:py-4 text-center">{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border border-[var(--cream-3)] bg-[var(--cream-2)] p-4">
            <h3 className="mb-2 font-condensed text-xs md:text-sm font-bold uppercase text-[var(--black)]">Conseil coupe :</h3>
            <p className="font-condensed text-xs md:text-sm text-[var(--grey)]">
              La version &quot;Classique / Supporter&quot; taille normalement. La version &quot;Pro / Joueur&quot; a une coupe tres cintree pres du corps. Si vous optez pour la version Pro, prevoyez une taille au-dessus pour etre a l&apos;aise.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
