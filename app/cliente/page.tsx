"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LogOut, Car, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { authService } from "@/lib/auth"

export default function ClientePage() {
  const [user, setUser] = useState(authService.getCurrentUser())
  const [services, setServices] = useState([])
  const [vehicles, setVehicles] = useState([])
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== "cliente") {
      router.push("/login")
      return
    }

    // Carregar serviços do cliente
    loadClientData()
  }, [user, router])

  const loadClientData = () => {
    // Mock data - em produção viria da API
    const mockServices = [
      {
        id: 1,
        description: "Troca de Óleo",
        vehicle: "ABC-1234 - Fiat Uno",
        status: "em_andamento",
        startDate: "2023-06-01",
        endDate: null,
        value: 150.0,
        notes: "Troca de óleo e filtro",
      },
      {
        id: 2,
        description: "Revisão Completa",
        vehicle: "ABC-1234 - Fiat Uno",
        status: "concluido",
        startDate: "2023-05-15",
        endDate: "2023-05-17",
        value: 450.0,
        notes: "Revisão dos 20.000km",
      },
      {
        id: 3,
        description: "Alinhamento",
        vehicle: "ABC-1234 - Fiat Uno",
        status: "agendado",
        startDate: "2023-06-10",
        endDate: null,
        value: 80.0,
        notes: "Agendado para próxima semana",
      },
    ]

    const mockVehicles = [
      {
        id: 1,
        plate: "ABC-1234",
        brand: "Fiat",
        model: "Uno",
        year: "2018",
        color: "Branco",
      },
    ]

    setServices(mockServices)
    setVehicles(mockVehicles)
  }

  const handleLogout = () => {
    authService.logout()
    router.push("/login")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "agendado":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            <Clock className="mr-1 h-3 w-3" />
            Agendado
          </Badge>
        )
      case "em_andamento":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            <AlertCircle className="mr-1 h-3 w-3" />
            Em Andamento
          </Badge>
        )
      case "concluido":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Concluído
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const currentServices = services.filter((s) => s.status !== "concluido")
  const serviceHistory = services.filter((s) => s.status === "concluido")

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Olá, {user?.name}!</h1>
            <p className="text-muted-foreground">Acompanhe seus serviços e histórico</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>

        {/* Meus Veículos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Meus Veículos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="border rounded-lg p-4">
                  <div className="font-medium text-lg">{vehicle.plate}</div>
                  <div className="text-muted-foreground">
                    {vehicle.brand} {vehicle.model} {vehicle.year}
                  </div>
                  <div className="text-sm text-muted-foreground">{vehicle.color}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Serviços Atuais */}
        <Card>
          <CardHeader>
            <CardTitle>Serviços em Andamento</CardTitle>
            <CardDescription>Acompanhe o status dos seus serviços atuais</CardDescription>
          </CardHeader>
          <CardContent>
            {currentServices.length > 0 ? (
              <div className="space-y-4">
                {currentServices.map((service) => (
                  <div key={service.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{service.description}</h3>
                      {getStatusBadge(service.status)}
                    </div>
                    <div className="grid gap-2 text-sm text-muted-foreground">
                      <div>Veículo: {service.vehicle}</div>
                      <div>Data de Início: {service.startDate}</div>
                      <div>Valor: R$ {service.value.toFixed(2)}</div>
                      {service.notes && <div>Observações: {service.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum serviço em andamento</p>
            )}
          </CardContent>
        </Card>

        {/* Histórico */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Serviços</CardTitle>
            <CardDescription>Todos os serviços já realizados</CardDescription>
          </CardHeader>
          <CardContent>
            {serviceHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceHistory.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.description}</TableCell>
                      <TableCell>{service.vehicle}</TableCell>
                      <TableCell>
                        {service.startDate} - {service.endDate}
                      </TableCell>
                      <TableCell>R$ {service.value.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(service.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum serviço no histórico</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
