"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Verificar se o usuário já está logado
    const currentUser = authService.getCurrentUser()

    if (currentUser) {
      // Redirecionar baseado no papel do usuário
      switch (currentUser.role) {
        case "admin":
          router.push("/dashboard")
          break
        case "funcionario":
          router.push("/funcionario")
          break
        case "cliente":
          router.push("/cliente")
          break
        default:
          router.push("/login")
      }
    } else {
      // Se não estiver logado, ir para a página de login
      router.push("/login")
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Workshop Manager</h1>
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  )
}
