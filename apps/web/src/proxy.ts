import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Adicione as rotas que não precisam de autenticação aqui
const publicRoutes = ['/login', '/register', '/api/auth']

function hasUsableToken(token: string | undefined) {
  if (!token || token === 'undefined' || token === 'null' || token.trim().length === 0) {
    return false
  }

  // This is only an early routing check. The API remains responsible for
  // verifying the JWT signature and claims.
  const parts = token.split('.')
  if (parts.length !== 3) return false

  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.exp !== 'number' || payload.exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get('kharify_token')?.value
  const { pathname } = request.nextUrl

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  const hasValidToken = hasUsableToken(token)

  // Se não tem token e a rota não é pública, redireciona pro login
  if (!hasValidToken && !isPublicRoute && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se tem token e tenta acessar login/register, manda pro dashboard
  if (hasValidToken && (pathname === '/login' || pathname === '/register' || pathname === '/')) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return NextResponse.next()
}

// Configura em quais rotas o middleware vai rodar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
