import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rotas que não precisam de autenticação
const publicRoutes = ["/", "/login"]

// Função para verificar se a rota atual é pública
function isPublicRoute(path: string) {
  return publicRoutes.some((route) => path === route || path.startsWith(`${route}/`))
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Se for uma rota pública, permite o acesso
  if (isPublicRoute(path)) {
    return NextResponse.next()
  }

  // Obtém o token de autenticação dos cookies
  const authToken = request.cookies.get("auth_token")?.value
  const userRole = request.cookies.get("user_role")?.value

  // Se não houver token, redireciona para o login
  if (!authToken) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Verifica permissões baseadas em rotas e papéis
  if (path.startsWith("/dashboard") && userRole !== "admin") {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (path.startsWith("/funcionario") && userRole !== "funcionario") {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (path.startsWith("/cliente") && userRole !== "cliente") {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Configuração para aplicar o middleware apenas nas rotas especificadas
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)"],
}
