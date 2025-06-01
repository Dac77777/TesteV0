"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, User, Users, Shield } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authService } from "@/lib/auth"

export default function LoginPage() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Cliente
  const [cpf, setCpf] = useState("")

  // Funcionário/Admin
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!cpf) {
      setError("Por favor, digite seu CPF")
      setLoading(false)
      return
    }

    try {
      const user = await authService.loginCliente(cpf)
      if (user) {
        router.push("/cliente")
      } else {
        setError("CPF não encontrado")
      }
    } catch (err) {
      setError("Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!username || !password) {
      setError("Por favor, preencha todos os campos")
      setLoading(false)
      return
    }

    try {
      const user = await authService.loginEmployee(username, password)
      if (user) {
        router.push("/funcionario")
      } else {
        setError("Usuário ou senha inválidos")
      }
    } catch (err) {
      setError("Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!username || !password) {
      setError("Por favor, preencha todos os campos")
      setLoading(false)
      return
    }

    try {
      const user = await authService.loginAdmin(username, password)
      if (user) {
        router.push("/admin")
      } else {
        setError("Usuário ou senha inválidos")
      }
    } catch (err) {
      setError("Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Workshop Manager</CardTitle>
          <CardDescription>Escolha seu tipo de acesso</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="cliente" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cliente" className="text-xs">
                <User className="h-4 w-4 mr-1" />
                Cliente
              </TabsTrigger>
              <TabsTrigger value="funcionario" className="text-xs">
                <Users className="h-4 w-4 mr-1" />
                Funcionário
              </TabsTrigger>
              <TabsTrigger value="admin" className="text-xs">
                <Shield className="h-4 w-4 mr-1" />
                Admin
              </TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="cliente">
              <form onSubmit={handleClientLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                    maxLength={14}
                  />
                  <p className="text-xs text-muted-foreground">
                    Digite seu CPF para acessar o status dos seus serviços
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Acessar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="funcionario">
              <form onSubmit={handleEmployeeLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emp-username">Usuário</Label>
                  <Input
                    id="emp-username"
                    placeholder="Nome do funcionário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emp-password">Senha</Label>
                  <Input
                    id="emp-password"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">Usuário demo: José Mecânico / Senha: 123456</p>
              </form>
            </TabsContent>

            <TabsContent value="admin">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-username">Usuário</Label>
                  <Input
                    id="admin-username"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Senha</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Senha do administrador"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">Usuário: admin / Senha: admin123</p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
