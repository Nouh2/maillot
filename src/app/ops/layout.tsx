import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ops',
  robots: {
    index: false,
    follow: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Maillot Ops',
  },
}

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return children
}
