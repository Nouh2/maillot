import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { linkOrdersToUserAccount } from '@/lib/orders'

function getSafeRedirectPath(candidate: string | null) {
  if (!candidate || !candidate.startsWith('/')) {
    return '/compte'
  }

  return candidate
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const nextPath = getSafeRedirectPath(request.nextUrl.searchParams.get('next'))
  const redirectUrl = new URL(nextPath, request.url)
  const response = NextResponse.redirect(redirectUrl, { status: 303 })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  if (!code) {
    return NextResponse.redirect(new URL('/compte?error=auth', request.url), { status: 303 })
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL('/compte?error=auth', request.url), { status: 303 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user?.email) {
    await linkOrdersToUserAccount(user.id, user.email)
    redirectUrl.searchParams.set('auth', 'success')
    response.headers.set('Location', redirectUrl.toString())
  }

  return response
}
