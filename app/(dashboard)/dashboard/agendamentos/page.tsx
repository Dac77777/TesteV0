"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock, User, Car, CalendarIcon } from "lucide-react"

// Mock data
const initialAppointments = [
  {
    id: 1,
    date: "2023-06-01",
    time: "09:00",
    client: "João Silva",
    vehicle: "ABC-1234 - Fiat Uno",
    service: "Troca de Óleo",
    status: "agendado",
    notes: "Cliente prefere pela manhã",
  },
  {
    id: 2,
    date: "2023-06-01",
    time: "11:30",
    client: "Maria Oliveira",
    vehicle: "DEF-5678 - Honda Civic",
    service: "Revisão Completa",
    status: "confirmado",
    notes: "Revisão dos 20.000km",
  },
  {
    id: 3,
    date: "2023-06-01",
    time: "14:00",
    client: "Carlos Santos",
    vehicle: "GHI-9012 - VW Gol",
    service: "Alinhamento",
    status: "em_andamento",
    notes: "Cliente relatou vibração no volante",
  },
  {
    id: 4,
    date: "2023-06-02",
    time: "10:00",
    client: "Ana Souza",
    vehicle: "JKL-3456 - Chevrolet Onix",
    service: "Troca de Pastilhas",
    status: "agendado",
    notes: "",
  },
]

const clients = ["João Silva", "Maria Oliveira", "Carlos Santos", "Ana Souza", "Paulo Lima"]
const vehicles = [
  "ABC-1234 - Fiat Uno",
  "DEF-5678 - Honda Civic",
  "GHI-9012 - VW Gol",
  "JKL-3456 - Chevrolet Onix",
  "MNO-7890 - Toyota Corolla",
]

const services = [
  "Troca de Óleo",
  "Revisão Completa",
  "Alinhamento",
  "Balanceamento",
  "Troca de Pastilhas",
  "Troca de Filtros",
  "Diagnóstico",
]

const timeSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
]

const statusOptions = [
  { value: "agendado", label: "Agendado" },
  { value: "confirmado", label: "Confirmado" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" },
]

export default function AgendamentosPage() {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentAppointment, setCurrentAppointment] = useState({
    id: 0,
    date: "",
    time: "",
    client: "",
    vehicle: "",
    service: "",
    status: "agendado",
    notes: "",
  })
  const [isEditing, setIsEditing] = useState(false)

  const selectedDateStr = selectedDate?.toISOString().split("T")[0] || ""
  const dayAppointments = appointments.filter((apt) => apt.date === selectedDateStr)

  const handleAddAppointment = () => {
    setIsEditing(false)
    setCurrentAppointment({
      id: appointments.length + 1,
      date: selectedDateStr,
      time: "",
      client: "",
      vehicle: "",
      service: "",
      status: "agendado",
      notes: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditAppointment = (appointment) => {
    setIsEditing(true)
    setCurrentAppointment(appointment)
    setIsDialogOpen(true)
  }

  const handleSaveAppointment = () => {
    if (isEditing) {
      setAppointments(appointments.map((apt) => (apt.id === currentAppointment.id ? currentAppointment : apt)))
    } else {
      setAppointments([...appointments, currentAppointment])
    }
    setIsDialogOpen(false)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "agendado":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Agendado
          </Badge>
        )
      case "confirmado":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Confirmado
          </Badge>
        )
      case "em_andamento":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            Em Andamento
          </Badge>
        )
      case "concluido":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Concluído
          </Badge>
        )
      case "cancelado":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Cancelado
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getAvailableTimeSlots = () => {
    const bookedTimes = dayAppointments.map((apt) => apt.time)
    return timeSlots.filter((time) => !bookedTimes.includes(time))
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Calendário</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Agendamentos - {selectedDate?.toLocaleDateString("pt-BR")}</CardTitle>
          <Button onClick={handleAddAppointment} disabled={!selectedDate}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </CardHeader>
        <CardContent>
          {dayAppointments.length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-2">{dayAppointments.length} serviço(s) agendado(s)</div>
              {dayAppointments
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleEditAppointment(appointment)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-lg">{appointment.time}</span>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{appointment.client}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-purple-600" />
                        <span>{appointment.vehicle}</span>
                      </div>
                      <div className="bg-muted/50 p-2 rounded">
                        <span className="font-medium text-blue-700">{appointment.service}</span>
                      </div>
                      {appointment.notes && (
                        <div className="text-xs text-muted-foreground bg-amber-50 p-2 rounded border-l-2 border-amber-200">
                          <strong>Obs:</strong> {appointment.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum serviço agendado para esta data</p>
              <p className="text-sm text-muted-foreground mt-1">Clique em "Novo Agendamento" para adicionar</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Edite os dados do agendamento." : "Preencha os dados do novo agendamento."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={currentAppointment.date}
                  onChange={(e) => setCurrentAppointment({ ...currentAppointment, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Horário</Label>
                <Select
                  value={currentAppointment.time}
                  onValueChange={(value) => setCurrentAppointment({ ...currentAppointment, time: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {(isEditing ? timeSlots : getAvailableTimeSlots()).map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client">Cliente</Label>
              <Select
                value={currentAppointment.client}
                onValueChange={(value) => setCurrentAppointment({ ...currentAppointment, client: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client} value={client}>
                      {client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vehicle">Veículo</Label>
              <Select
                value={currentAppointment.vehicle}
                onValueChange={(value) => setCurrentAppointment({ ...currentAppointment, vehicle: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um veículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle} value={vehicle}>
                      {vehicle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="service">Serviço</Label>
              <Select
                value={currentAppointment.service}
                onValueChange={(value) => setCurrentAppointment({ ...currentAppointment, service: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={currentAppointment.status}
                onValueChange={(value) => setCurrentAppointment({ ...currentAppointment, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={currentAppointment.notes}
                onChange={(e) => setCurrentAppointment({ ...currentAppointment, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAppointment}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
