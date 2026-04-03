const YUPOO_HOSTS = ['photo.yupoo.com', 'x.yupoo.com', 'y.yupoo.com']

export function isYupooImage(url: string): boolean {
  if (!url) return false
  try {
    const { hostname } = new URL(url)
    return YUPOO_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`))
  } catch {
    return false
  }
}

export function getDirectImageUrl(url: string): string {
  return url
}

export function getProxyImageUrl(url: string): string {
  if (!url) return url
  if (!isYupooImage(url)) return url
  return `/api/img?url=${encodeURIComponent(url)}`
}

export function proxyImage(url: string): string {
  return getDirectImageUrl(url)
}
