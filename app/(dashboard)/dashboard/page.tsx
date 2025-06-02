"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Car, Users, Wrench, DollarSign, Clock } from "lucide-react"
import { authService } from "@/lib/auth"
import type { User } from "@/types/user"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState({
    totalClients: 0,
    totalVehicles: 0,
    activeServices: 0,
    pendingServices: 0,
    completedServices: 0,
    monthlyRevenue: 0,
  })

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)

    // Simular dados do dashboard
    setStats({
      totalClients: 45,
      totalVehicles: 67,
      activeServices: 12,
      pendingServices: 8,
      completedServices: 156,
      monthlyRevenue: 25400,
    })
  }, [])

  if (!user) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo de volta, {user.name}!</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">+12% em relação ao mês passado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veículos Cadastrados</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVehicles}</div>
            <p className="text-xs text-muted-foreground">+8% em relação ao mês passado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serviços Ativos</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeServices}</div>
            <p className="text-xs text-muted-foreground">Em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15% em relação ao mês passado</p>
          </CardContent>
        </Card>
      </div>

      {/* Serviços Recentes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Serviços Pendentes</CardTitle>
            <CardDescription>Serviços aguardando aprovação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: 1, client: "João Silva", service: "Troca de óleo", vehicle: "Honda Civic 2020" },
              { id: 2, client: "Maria Santos", service: "Revisão completa", vehicle: "Toyota Corolla 2019" },
              { id: 3, client: "Carlos Oliveira", service: "Alinhamento", vehicle: "Ford Focus 2021" },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{item.client}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.service} - {item.vehicle}
                  </p>
                </div>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  Pendente
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Serviços em Andamento</CardTitle>
            <CardDescription>Serviços sendo executados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                id: 1,
                client: "Ana Costa",
                service: "Reparo de freios",
                vehicle: "Volkswagen Golf 2018",
                progress: 75,
              },
              { id: 2, client: "Pedro Lima", service: "Troca de pneus", vehicle: "Chevrolet Onix 2020", progress: 50 },
              {
                id: 3,
                client: "Lucia Ferreira",
                service: "Diagnóstico eletrônico",
                vehicle: "Hyundai HB20 2019",
                progress: 25,
              },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.client}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.service} - {item.vehicle}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${item.progress}%` }}></div>
                  </div>
                </div>
                <Badge variant="default">
                  <Wrench className="h-3 w-3 mr-1" />
                  {item.progress}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesso rápido às funcionalidades principais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button className="h-20 flex flex-col gap-2" variant="outline">
              <Users className="h-6 w-6" />
              <span>Novo Cliente</span>
            </Button>
            <Button className="h-20 flex flex-col gap-2" variant="outline">
              <Car className="h-6 w-6" />
              <span>Novo Veículo</span>
            </Button>
            <Button className="h-20 flex flex-col gap-2" variant="outline">
              <Wrench className="h-6 w-6" />
              <span>Novo Serviço</span>
            </Button>
            <Button className="h-20 flex flex-col gap-2" variant="outline">
              <Calendar className="h-6 w-6" />
              <span>Agendar</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
