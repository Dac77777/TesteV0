import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rotas que não precisam de autenticação
const publicRoutes = ["/", "/login"]

// Função para verificar se a rota atual é pública
function isPublicRoute(path: string) {
  return publicRoutes.some((route) => path === route || path.startsWith(`${route}/`))
}

// COMENTÁRIO DE SEGURANÇA:
// Este middleware protege as rotas com base nos cookies 'auth_token' e 'user_role'.
// A segurança desta abordagem depende criticamente da integridade e da forma como esses cookies são definidos e validados.
//
// 1. 'auth_token': Atualmente, o token é gerado e gerenciado no lado do cliente (veja lib/auth.ts -> generateToken).
//    A "assinatura" do token é uma simulação e não pode ser validada criptograficamente de forma segura no cliente ou aqui.
//    Em um sistema de produção, um token (como JWT) deve ser emitido por um servidor seguro e assinado com um segredo.
//
// 2. 'user_role': Este valor também é lido de um cookie e sua confiabilidade está atrelada à do 'auth_token'.
//    Se o token puder ser adulterado, o papel também poderá.
//
// Abordagem Ideal em Produção:
// - O 'auth_token' (JWT) seria enviado ao middleware.
// - O middleware (ou um serviço chamado por ele, preferencialmente um endpoint de backend) validaria a assinatura
//   do JWT usando um segredo (para HS256) ou chave pública (para RS256).
// - O 'user_role' seria extraído das 'claims' do JWT validado, não de um cookie separado.
// - Apenas após a validação bem-sucedida do token, o acesso seria concedido.
//
// Este middleware, no estado atual do projeto (com tokens simulados no cliente), oferece um nível básico de
// proteção de rota, mas não deve ser considerado seguro para um ambiente de produção sem as melhorias acima.
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Se for uma rota pública, permite o acesso
  if (isPublicRoute(path)) {
    return NextResponse.next()
  }

  // Obtém o token de autenticação dos cookies
  // Leitura dos cookies de autenticação. Veja o comentário de segurança no topo desta função
  // sobre a validação ideal destes valores em um ambiente de produção.
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
