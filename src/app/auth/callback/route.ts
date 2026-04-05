import { createServerClient } from '@supabase/ssr'
import type { EmailOtpType } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { linkOrdersToUserAccount } from '@/lib/orders'

function getSafeRedirectPath(candidate: string | null) {
  if (!candidate || !candidate.startsWith('/')) {
    return '/compte'
  }

  return candidate
}

function getOtpType(candidate: string | null): EmailOtpType | null {
  if (!candidate) return null

  const supportedTypes: EmailOtpType[] = ['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email']
  return supportedTypes.includes(candidate as EmailOtpType) ? (candidate as EmailOtpType) : null
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const tokenHash = request.nextUrl.searchParams.get('token_hash')
  const type = getOtpType(request.nextUrl.searchParams.get('type'))
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

  if (!code && !(tokenHash && type)) {
    return NextResponse.redirect(new URL('/compte?error=auth', request.url), { status: 303 })
  }

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({
        token_hash: tokenHash!,
        type: type!,
      })

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
