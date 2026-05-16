'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import { getDirectImageUrl, getProxyImageUrl, hasYupooImageProxyFallback, isYupooImage, type BunnyTransformPreset } from '@/lib/images'

type ExternalProductImageProps = Omit<ImageProps, 'src'> & {
  src: string
  fallbackMode?: 'proxy' | 'placeholder'
  placeholderSrc?: string
  bunnyTransform?: BunnyTransformPreset
}

export function ExternalProductImage({
  src,
  alt,
  onError,
  referrerPolicy,
  fallbackMode = 'placeholder',
  placeholderSrc = '/images/product-placeholder.svg',
  bunnyTransform,
  ...props
}: ExternalProductImageProps) {
  const directSrc = getDirectImageUrl(src, bunnyTransform)
  const proxySrc = getProxyImageUrl(src)
  const canUseProxyFallback = fallbackMode === 'proxy' && hasYupooImageProxyFallback(src) && proxySrc !== directSrc
  const [currentSrc, setCurrentSrc] = useState(directSrc)

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      referrerPolicy={currentSrc === directSrc && isYupooImage(directSrc) ? 'no-referrer' : referrerPolicy}
      onError={(event) => {
        if (canUseProxyFallback && currentSrc !== proxySrc) {
          setCurrentSrc(proxySrc)
          return
        }

        if (currentSrc !== placeholderSrc) {
          setCurrentSrc(placeholderSrc)
          return
        }

        onError?.(event)
      }}
    />
  )
}
