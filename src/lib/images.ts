const YUPOO_HOSTS = ['photo.yupoo.com', 'x.yupoo.com', 'y.yupoo.com']

export function proxyImage(url: string): string {
  if (!url) return url
  try {
    const { hostname } = new URL(url)
    if (YUPOO_HOSTS.some((h) => hostname === h || hostname.endsWith('.' + h))) {
      return `/api/img?url=${encodeURIComponent(url)}`
    }
  } catch {
    // URL invalide, retourner tel quel
  }
  return url
}
