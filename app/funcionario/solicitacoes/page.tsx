"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Plus, Search, Eye, Send, Clock, CheckCircle, XCircle } from "lucide-react"

// Mock data
const initialRequests = [
  {
    id: 1,
    number: "SOL-001",
    client: "João Silva",
    vehicle: "ABC-1234 - Fiat Uno",
    description: "Troca de óleo e filtros",
    estimatedValue: 250.0,
    status: "pendente",
    createdDate: "2023-06-01",
    responseDate: null,
    adminNotes: "",
  },
  {
    id: 2,
    number: "SOL-002",
    client: "Maria Oliveira",
    vehicle: "DEF-5678 - Honda Civic",
    description: "Revisão completa dos 20.000km",
    estimatedValue: 850.0,
    status: "aprovada",
    createdDate: "2023-05-28",
    responseDate: "2023-05-29",
    adminNotes: "Orçamento criado e enviado ao cliente",
  },
  {
    id: 3,
    number: "SOL-003",
    client: "Carlos Santos",
    vehicle: "GHI-9012 - VW Gol",
    description: "Alinhamento e balanceamento",
    estimatedValue: 120.0,
    status: "rejeitada",
    createdDate: "2023-05-25",
    responseDate: "2023-05-26",
    adminNotes: "Serviço não autorizado pelo cliente",
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

export default function SolicitacoesPage() {
  const [requests, setRequests] = useState(initialRequests)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentRequest, setCurrentRequest] = useState({
    id: 0,
    number: "",
    client: "",
    vehicle: "",
    description: "",
    estimatedValue: 0,
    status: "pendente",
    createdDate: "",
    responseDate: null,
    adminNotes: "",
  })
  const [isEditing, setIsEditing] = useState(false)

  const filteredRequests = requests.filter(
    (request) =>
      request.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddRequest = () => {
    setIsEditing(false)
    const today = new Date()

    setCurrentRequest({
      id: requests.length + 1,
      number: `SOL-${String(requests.length + 1).padStart(3, "0")}`,
      client: "",
      vehicle: "",
      description: "",
      estimatedValue: 0,
      status: "pendente",
      createdDate: today.toISOString().split("T")[0],
      responseDate: null,
      adminNotes: "",
    })
    setIsDialogOpen(true)
  }

  const handleViewRequest = (request) => {
    setIsEditing(true)
    setCurrentRequest(request)
    setIsDialogOpen(true)
  }

  const handleSaveRequest = () => {
    if (isEditing) {
      setRequests(requests.map((request) => (request.id === currentRequest.id ? currentRequest : request)))
    } else {
      setRequests([...requests, currentRequest])
    }
    setIsDialogOpen(false)
  }

  const handleSendRequest = (request) => {
    // Simulate sending request to admin
    alert(`Solicitação ${request.number} enviada para o administrador`)
    setRequests(requests.map((r) => (r.id === request.id ? { ...r, status: "enviada" } : r)))
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "pendente":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            <Clock className="mr-1 h-3 w-3" />
            Pendente
          </Badge>
        )
      case "enviada":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            <Send className="mr-1 h-3 w-3" />
            Enviada
          </Badge>
        )
      case "aprovada":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Aprovada
          </Badge>
        )
      case "rejeitada":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Rejeitada
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Solicitações de Orçamento</CardTitle>
          <Button onClick={handleAddRequest}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Solicitação
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar solicitações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Valor Estimado</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.number}</TableCell>
                      <TableCell>{request.client}</TableCell>
                      <TableCell>{request.vehicle}</TableCell>
                      <TableCell>R$ {request.estimatedValue.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>{request.createdDate}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleViewRequest(request)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === "pendente" && (
                          <Button variant="ghost" size="icon" onClick={() => handleSendRequest(request)}>
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Nenhuma solicitação encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Visualizar Solicitação" : "Nova Solicitação"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Detalhes da solicitação de orçamento." : "Preencha os dados da nova solicitação."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={currentRequest.number}
                  onChange={(e) => setCurrentRequest({ ...currentRequest, number: e.target.value })}
                  disabled={isEditing}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Input id="status" value={currentRequest.status} disabled />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="client">Cliente</Label>
                <Select
                  value={currentRequest.client}
                  onValueChange={(value) => setCurrentRequest({ ...currentRequest, client: value })}
                  disabled={isEditing}
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
                  value={currentRequest.vehicle}
                  onValueChange={(value) => setCurrentRequest({ ...currentRequest, vehicle: value })}
                  disabled={isEditing}
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
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição dos Serviços</Label>
              <Textarea
                id="description"
                value={currentRequest.description}
                onChange={(e) => setCurrentRequest({ ...currentRequest, description: e.target.value })}
                rows={3}
                disabled={isEditing}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="estimatedValue">Valor Estimado (R$)</Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  step="0.01"
                  value={currentRequest.estimatedValue}
                  onChange={(e) =>
                    setCurrentRequest({ ...currentRequest, estimatedValue: Number.parseFloat(e.target.value) || 0 })
                  }
                  disabled={isEditing}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="createdDate">Data de Criação</Label>
                <Input
                  id="createdDate"
                  type="date"
                  value={currentRequest.createdDate}
                  onChange={(e) => setCurrentRequest({ ...currentRequest, createdDate: e.target.value })}
                  disabled={isEditing}
                />
              </div>
            </div>
            {isEditing && currentRequest.adminNotes && (
              <div className="grid gap-2">
                <Label htmlFor="adminNotes">Observações do Administrador</Label>
                <Textarea id="adminNotes" value={currentRequest.adminNotes} disabled rows={2} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {isEditing ? "Fechar" : "Cancelar"}
            </Button>
            {!isEditing && <Button onClick={handleSaveRequest}>Salvar</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
