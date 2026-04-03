'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import { getDirectImageUrl, getProxyImageUrl, isYupooImage } from '@/lib/images'

type ExternalProductImageProps = Omit<ImageProps, 'src'> & {
  src: string
}

export function ExternalProductImage({ src, alt, onError, referrerPolicy, ...props }: ExternalProductImageProps) {
  const directSrc = getDirectImageUrl(src)
  const proxySrc = getProxyImageUrl(src)
  const [currentSrc, setCurrentSrc] = useState(directSrc)

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      referrerPolicy={currentSrc === directSrc && isYupooImage(directSrc) ? 'no-referrer' : referrerPolicy}
      onError={(event) => {
        if (currentSrc !== proxySrc && proxySrc !== directSrc) {
          setCurrentSrc(proxySrc)
          return
        }

        onError?.(event)
      }}
    />
  )
}
