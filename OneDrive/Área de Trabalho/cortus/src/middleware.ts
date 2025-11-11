import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Evitar loops infinitos de redirecionamento
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rotas protegidas que requerem autenticação
  const protectedPaths = ['/dashboard', '/crm', '/financeiro', '/projetos', '/comunicacao', '/calendario', '/configuracoes', '/automacoes']
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))
  
  // Rotas de autenticação que devem redirecionar se já autenticado
  const authPaths = ['/signin', '/signup']
  const isAuthPath = authPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // Redirecionar rota raiz para dashboard se autenticado
  if (user && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  if (!user && isProtectedPath) {
    // Não autenticado tentando acessar rota protegida
    const url = request.nextUrl.clone()
    url.pathname = '/signin'
    return NextResponse.redirect(url)
  }

  if (user && isAuthPath) {
    // Autenticado tentando acessar rota de auth
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

