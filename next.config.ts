// next.config.ts
import type { NextConfig } from 'next'

const bunnyCdnEndpoint = process.env.NEXT_PUBLIC_BUNNY_CDN_BASE_URL?.trim() ?? 'https://maillotaddict.b-cdn.net'
const bunnyCdnHostname = (() => {
  try {
    return new URL(bunnyCdnEndpoint).hostname
  } catch {
    return null
  }
})()

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
    staticGenerationMaxConcurrency: 1,
    staticGenerationMinPagesPerWorker: 50,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 80, 128, 256, 384],
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
      {
        protocol: 'https',
        hostname: 'maillotaddict.fr',
      },
      {
        protocol: 'https',
        hostname: 'www.maillotaddict.fr',
      },
      ...(bunnyCdnHostname
        ? [
            {
              protocol: 'https' as const,
              hostname: bunnyCdnHostname,
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
