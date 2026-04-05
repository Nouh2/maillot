import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_HOSTS = ['photo.yupoo.com', 'x.yupoo.com', 'y.yupoo.com']
const IMAGE_CACHE_SECONDS = 60 * 60 * 24 * 30
const IMAGE_STALE_SECONDS = 60 * 60 * 24 * 365

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return new NextResponse('Missing url', { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return new NextResponse('Invalid url', { status: 400 })
  }

  if (!ALLOWED_HOSTS.some((h) => parsed.hostname === h || parsed.hostname.endsWith('.' + h))) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const res = await fetch(url, {
    next: {
      revalidate: IMAGE_CACHE_SECONDS,
    },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Referer: 'https://www.yupoo.com/',
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    },
  })

  if (!res.ok) {
    return new NextResponse('Image fetch failed', { status: res.status })
  }

  const headers = new Headers()
  headers.set('Content-Type', res.headers.get('content-type') ?? 'image/jpeg')
  headers.set('Cache-Control', `public, max-age=${IMAGE_CACHE_SECONDS}, s-maxage=${IMAGE_CACHE_SECONDS}, stale-while-revalidate=${IMAGE_STALE_SECONDS}, immutable`)

  const contentLength = res.headers.get('content-length')
  if (contentLength) {
    headers.set('Content-Length', contentLength)
  }

  const etag = res.headers.get('etag')
  if (etag) {
    headers.set('ETag', etag)
  }

  const lastModified = res.headers.get('last-modified')
  if (lastModified) {
    headers.set('Last-Modified', lastModified)
  }

  return new NextResponse(res.body, { headers })
}
