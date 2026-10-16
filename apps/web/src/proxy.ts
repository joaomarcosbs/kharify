import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Adicione as rotas que não precisam de autenticação aqui
const publicRoutes = ['/login', '/register', '/api/auth']

export function proxy(request: NextRequest) {
  const token = request.cookies.get('kharify_token')?.value
  const { pathname } = request.nextUrl

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  const hasValidToken = !!token && token !== 'undefined' && token !== 'null' && token.trim().length > 0

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
