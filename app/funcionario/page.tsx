"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Car, Wrench, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { authService } from "@/lib/auth"
import type { User } from "@/types/user"

export default function FuncionarioPage() {
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState({
    pending: 5,
    inProgress: 3,
    completed: 12,
  })

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
  }, [])

  if (!user) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Área do Funcionário</h1>
        <p className="text-muted-foreground">Olá, {user.name}! Aqui estão suas tarefas de hoje.</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.pending}</div>
            <p className="text-xs text-muted-foreground">Aguardando início</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.inProgress}</div>
            <p className="text-xs text-muted-foreground">Sendo executadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas Hoje</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.completed}</div>
            <p className="text-xs text-muted-foreground">Finalizadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tarefas do Dia */}
      <Card>
        <CardHeader>
          <CardTitle>Minhas Tarefas</CardTitle>
          <CardDescription>Serviços atribuídos para você hoje</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              id: 1,
              client: "João Silva",
              service: "Troca de óleo",
              vehicle: "Honda Civic 2020",
              status: "pending",
              priority: "normal",
            },
            {
              id: 2,
              client: "Maria Santos",
              service: "Revisão completa",
              vehicle: "Toyota Corolla 2019",
              status: "in-progress",
              priority: "high",
            },
            {
              id: 3,
              client: "Carlos Oliveira",
              service: "Alinhamento",
              vehicle: "Ford Focus 2021",
              status: "pending",
              priority: "low",
            },
          ].map((task) => (
            <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{task.client}</p>
                  {task.priority === "high" && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Urgente
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{task.service}</p>
                <p className="text-xs text-muted-foreground">{task.vehicle}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={task.status === "pending" ? "outline" : "default"}
                  className={task.status === "in-progress" ? "bg-blue-100 text-blue-800" : ""}
                >
                  {task.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                  {task.status === "in-progress" && <Wrench className="h-3 w-3 mr-1" />}
                  {task.status === "pending" ? "Pendente" : "Em Andamento"}
                </Badge>
                <Button size="sm" variant={task.status === "pending" ? "default" : "outline"}>
                  {task.status === "pending" ? "Iniciar" : "Continuar"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesso rápido às suas funcionalidades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button className="h-16 flex flex-col gap-2" variant="outline">
              <Users className="h-5 w-5" />
              <span>Ver Clientes</span>
            </Button>
            <Button className="h-16 flex flex-col gap-2" variant="outline">
              <Car className="h-5 w-5" />
              <span>Ver Veículos</span>
            </Button>
            <Button className="h-16 flex flex-col gap-2" variant="outline">
              <Wrench className="h-5 w-5" />
              <span>Meus Serviços</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
