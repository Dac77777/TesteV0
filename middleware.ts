import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rotas que não precisam de autenticação
const publicRoutes = ["/login", "/"]

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
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Verifica permissões baseadas em rotas e papéis
  if (path.startsWith("/dashboard") && userRole !== "admin") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (path.startsWith("/funcionario") && userRole !== "funcionario") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (path.startsWith("/cliente") && userRole !== "cliente") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

// Configuração para aplicar o middleware apenas nas rotas especificadas
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)"],
}
