import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MAILLOT ADDICT Ops',
    short_name: 'Maillot Ops',
    description: 'Webapp interne de gestion des commandes MAILLOT ADDICT.',
    start_url: '/ops',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f6f1ea',
    theme_color: '#111111',
    icons: [
      {
        src: '/logohead.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/logohead.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  }
}
