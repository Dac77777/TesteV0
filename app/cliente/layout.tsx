"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState(authService.getCurrentUser())
  const router = useRouter()

  useEffect(() => {
    setMounted(true)

    const currentUser = authService.getCurrentUser()
    if (!currentUser || currentUser.role !== "cliente") {
      authService.logout()
      router.push("/login")
      return
    }

    setUser(currentUser)
  }, [router])

  if (!mounted || !user || user.role !== "cliente") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <h1 className="text-xl font-bold">Área do Cliente</h1>
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <span className="text-sm text-gray-600">Olá, {user.name}</span>
            <button
              onClick={() => {
                authService.logout()
                router.push("/login")
              }}
              className="text-sm text-red-600 hover:text-red-800 text-left sm:text-center"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
