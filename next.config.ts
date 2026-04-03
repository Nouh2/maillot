// next.config.ts
import type { NextConfig } from 'next'

const imageKitEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT?.trim()
const imageKitHostname = (() => {
  if (!imageKitEndpoint) return null
  try {
    return new URL(imageKitEndpoint).hostname
  } catch {
    return null
  }
})()

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.yupoo.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      ...(imageKitHostname
        ? [
            {
              protocol: 'https' as const,
              hostname: imageKitHostname,
            },
          ]
        : []),
    ],
  },
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/logohead.jpg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig
