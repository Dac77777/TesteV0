"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Users, Car, Wrench, Package, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isOnline, setIsOnline] = useState(true)
  const [syncStatus, setSyncStatus] = useState("Sincronizado")

  // Check online status
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine)
      if (navigator.onLine) {
        setSyncStatus("Sincronizando...")
        // Simulate sync process
        setTimeout(() => {
          setSyncStatus("Sincronizado")
        }, 1500)
      } else {
        setSyncStatus("Offline - Dados salvos localmente")
      }
    }

    window.addEventListener("online", handleOnlineStatus)
    window.addEventListener("offline", handleOnlineStatus)

    return () => {
      window.removeEventListener("online", handleOnlineStatus)
      window.removeEventListener("offline", handleOnlineStatus)
    }
  }, [])

  // Mock data
  const stats = [
    { title: "Clientes", value: "124", icon: Users, color: "bg-blue-100 text-blue-700" },
    { title: "Veículos", value: "87", icon: Car, color: "bg-green-100 text-green-700" },
    { title: "Serviços Ativos", value: "12", icon: Wrench, color: "bg-amber-100 text-amber-700" },
    { title: "Itens em Estoque", value: "342", icon: Package, color: "bg-purple-100 text-purple-700" },
  ]

  const todayAppointments = [
    { time: "09:00", client: "João Silva", service: "Troca de Óleo", vehicle: "Fiat Uno 2018" },
    { time: "11:30", client: "Maria Oliveira", service: "Revisão Completa", vehicle: "Honda Civic 2020" },
    { time: "14:00", client: "Carlos Santos", service: "Alinhamento", vehicle: "VW Gol 2019" },
  ]

  return (
    <div className="space-y-6">
      {!isOnline && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Modo Offline</AlertTitle>
          <AlertDescription>
            Você está trabalhando offline. Os dados serão sincronizados quando a conexão for restabelecida.
          </AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-muted-foreground">Status: {syncStatus}</div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex items-center p-6">
              <div className={`mr-4 rounded-full p-2 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos de Hoje</CardTitle>
            <CardDescription>Serviços agendados para hoje</CardDescription>
          </CardHeader>
          <CardContent>
            {todayAppointments.length > 0 ? (
              <div className="space-y-4">
                {todayAppointments.map((appointment, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">
                        {appointment.time} - {appointment.client}
                      </p>
                      <p className="text-sm text-muted-foreground">{appointment.service}</p>
                      <p className="text-xs text-muted-foreground">{appointment.vehicle}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Detalhes
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Nenhum agendamento para hoje</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
            <CardDescription>Visualize e gerencie agendamentos</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
