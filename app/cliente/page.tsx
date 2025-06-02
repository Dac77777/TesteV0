"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Car, Clock, CheckCircle, AlertCircle, Calendar, FileText } from "lucide-react"
import { authService } from "@/lib/auth"
import type { User } from "@/types/user"

export default function ClientePage() {
  const [user, setUser] = useState<User | null>(null)
  const [services, setServices] = useState([])

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)

    // Simular dados dos serviços do cliente
    setServices([
      {
        id: 1,
        vehicle: "Honda Civic 2020",
        service: "Troca de óleo",
        status: "completed",
        date: "2024-01-15",
        value: 150.0,
      },
      {
        id: 2,
        vehicle: "Honda Civic 2020",
        service: "Revisão completa",
        status: "in-progress",
        date: "2024-01-20",
        value: 450.0,
      },
      {
        id: 3,
        vehicle: "Honda Civic 2020",
        service: "Alinhamento",
        status: "pending",
        date: "2024-01-25",
        value: 80.0,
      },
    ])
  }, [])

  if (!user) {
    return <div>Carregando...</div>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Concluído
          </Badge>
        )
      case "in-progress":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Em Andamento
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Área do Cliente</h1>
        <p className="text-muted-foreground">Olá, {user.name}! Acompanhe seus serviços aqui.</p>
      </div>

      {/* Informações do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Informações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome</p>
              <p className="text-lg">{user.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">CPF</p>
              <p className="text-lg">{user.cpf}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Serviços */}
      <Card>
        <CardHeader>
          <CardTitle>Seus Serviços</CardTitle>
          <CardDescription>Histórico e status dos seus serviços</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {services.map((service: any) => (
            <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{service.vehicle}</p>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{service.service}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(service.date).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    R$ {service.value.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(service.status)}
                <Button size="sm" variant="outline">
                  Detalhes
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serviços Concluídos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.filter((s: any) => s.status === "completed").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.filter((s: any) => s.status === "in-progress").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {services.reduce((total: number, s: any) => total + s.value, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
