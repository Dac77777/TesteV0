"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wrench, AlertCircle, User, Users, Shield } from "lucide-react"
import { authService } from "@/lib/auth"
import { useAppContext } from "@/contexts/app-context"

export default function LoginPage() {
  const [adminCredentials, setAdminCredentials] = useState({
    username: "",
    password: "",
  })
  const [employeeCredentials, setEmployeeCredentials] = useState({
    username: "",
    password: "",
  })
  const [clientCpf, setClientCpf] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("admin")
  const router = useRouter()

  // Usar o contexto para obter as configurações da empresa
  const { companySettings, isLoading: isLoadingSettings } = useAppContext()

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const user = await authService.loginAdmin(adminCredentials.username, adminCredentials.password)

      if (user) {
        router.push("/dashboard")
      } else {
        setError("Credenciais de administrador inválidas")
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const user = await authService.loginEmployee(employeeCredentials.username, employeeCredentials.password)

      if (user) {
        router.push("/funcionario")
      } else {
        setError("Credenciais de funcionário inválidas")
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Formatar CPF se necessário (remover pontos e traços)
      const formattedCpf = clientCpf.replace(/[^\d]/g, "")

      // Adicionar formatação padrão se tiver 11 dígitos
      let cpfToSearch = clientCpf
      if (formattedCpf.length === 11) {
        cpfToSearch = `${formattedCpf.slice(0, 3)}.${formattedCpf.slice(3, 6)}.${formattedCpf.slice(6, 9)}-${formattedCpf.slice(9, 11)}`
      }

      const user = await authService.loginCliente(cpfToSearch)

      if (user) {
        router.push("/cliente")
      } else {
        setError("CPF não encontrado no sistema")
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatCpf = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/[^\d]/g, "")

    // Aplica a máscara do CPF
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    }

    return value
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(e.target.value)
    setClientCpf(formatted)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-full">
              <Wrench className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            {isLoadingSettings ? "Carregando..." : companySettings.name}
          </h2>
          <p className="mt-2 text-sm text-gray-600">Faça login para acessar o sistema</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Entrar</CardTitle>
            <CardDescription className="text-center">Escolha seu tipo de acesso</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </TabsTrigger>
                <TabsTrigger value="employee" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Funcionário</span>
                </TabsTrigger>
                <TabsTrigger value="client" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Cliente</span>
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="admin" className="space-y-4 mt-4">
                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-username">Usuário</Label>
                    <Input
                      id="admin-username"
                      type="text"
                      placeholder="Digite seu usuário"
                      value={adminCredentials.username}
                      onChange={(e) => setAdminCredentials({ ...adminCredentials, username: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Senha</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Digite sua senha"
                      value={adminCredentials.password}
                      onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Entrando..." : "Entrar como Admin"}
                  </Button>
                </form>

                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium">Credenciais padrão:</p>
                  <p>Usuário: admin | Senha: admin123</p>
                </div>
              </TabsContent>

              <TabsContent value="employee" className="space-y-4 mt-4">
                <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee-username">Usuário</Label>
                    <Input
                      id="employee-username"
                      type="text"
                      placeholder="Digite seu usuário"
                      value={employeeCredentials.username}
                      onChange={(e) => setEmployeeCredentials({ ...employeeCredentials, username: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employee-password">Senha</Label>
                    <Input
                      id="employee-password"
                      type="password"
                      placeholder="Digite sua senha"
                      value={employeeCredentials.password}
                      onChange={(e) => setEmployeeCredentials({ ...employeeCredentials, password: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Entrando..." : "Entrar como Funcionário"}
                  </Button>
                </form>

                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium">Credenciais padrão:</p>
                  <p>Usuário: jose | Senha: 123456</p>
                  <p>Usuário: ana | Senha: 123456</p>
                </div>
              </TabsContent>

              <TabsContent value="client" className="space-y-4 mt-4">
                <form onSubmit={handleClientSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-cpf">CPF</Label>
                    <Input
                      id="client-cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={clientCpf}
                      onChange={handleCpfChange}
                      maxLength={14}
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">Digite apenas seu CPF para acessar</p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Verificando..." : "Entrar como Cliente"}
                  </Button>
                </form>

                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium">CPFs de teste:</p>
                  <p>123.456.789-00 (João Silva)</p>
                  <p>987.654.321-00 (Maria Oliveira)</p>
                  <p>456.789.123-00 (Carlos Santos)</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
