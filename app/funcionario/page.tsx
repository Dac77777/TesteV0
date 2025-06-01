"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function FuncionarioPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/funcionario/servicos")
  }, [router])

  return null
}
