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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Eye, CheckCircle, XCircle, Clock, Send, FileText, DollarSign } from "lucide-react"

// Mock data
const initialRequests = [
  {
    id: 1,
    number: "SOL-001",
    employee: "José Silva",
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
    employee: "Ana Santos",
    client: "Maria Oliveira",
    vehicle: "DEF-5678 - Honda Civic",
    description: "Revisão completa dos 20.000km",
    estimatedValue: 850.0,
    status: "pendente",
    createdDate: "2023-05-28",
    responseDate: null,
    adminNotes: "",
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

export default function SolicitacoesFuncionariosPage() {
  const [requests, setRequests] = useState(initialRequests)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false)
  const [currentRequest, setCurrentRequest] = useState(null)
  const [quoteItems, setQuoteItems] = useState([])
  const [newQuoteItem, setNewQuoteItem] = useState({
    description: "",
    quantity: 1,
    unitPrice: 0,
  })

  const filteredRequests = requests.filter(
    (request) =>
      request.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.vehicle.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const pendingRequests = filteredRequests.filter((req) => req.status === "pendente")
  const processedRequests = filteredRequests.filter((req) => req.status !== "pendente")

  const handleViewRequest = (request) => {
    setCurrentRequest(request)
    setIsDialogOpen(true)
  }

  const handleCreateQuote = (request) => {
    setCurrentRequest(request)
    setQuoteItems([])
    setIsQuoteDialogOpen(true)
  }

  const handleApproveRequest = (id) => {
    setRequests(
      requests.map((req) =>
        req.id === id ? { ...req, status: "aprovada", responseDate: new Date().toISOString().split("T")[0] } : req,
      ),
    )
  }

  const handleRejectRequest = (id) => {
    const notes = prompt("Motivo da rejeição:")
    if (notes) {
      setRequests(
        requests.map((req) =>
          req.id === id
            ? {
                ...req,
                status: "rejeitada",
                responseDate: new Date().toISOString().split("T")[0],
                adminNotes: notes,
              }
            : req,
        ),
      )
    }
  }

  const handleAddQuoteItem = () => {
    if (newQuoteItem.description && newQuoteItem.quantity > 0 && newQuoteItem.unitPrice > 0) {
      setQuoteItems([
        ...quoteItems,
        {
          ...newQuoteItem,
          id: Date.now(),
          total: newQuoteItem.quantity * newQuoteItem.unitPrice,
        },
      ])
      setNewQuoteItem({ description: "", quantity: 1, unitPrice: 0 })
    }
  }

  const handleRemoveQuoteItem = (id) => {
    setQuoteItems(quoteItems.filter((item) => item.id !== id))
  }

  const handleSendQuote = () => {
    if (quoteItems.length > 0) {
      const total = quoteItems.reduce((sum, item) => sum + item.total, 0)

      // Simulate creating and sending quote
      alert(`Orçamento criado e enviado para ${currentRequest.client}\nTotal: R$ ${total.toFixed(2)}`)

      // Update request status
      setRequests(
        requests.map((req) =>
          req.id === currentRequest.id
            ? { ...req, status: "orcamento_enviado", responseDate: new Date().toISOString().split("T")[0] }
            : req,
        ),
      )

      setIsQuoteDialogOpen(false)
    }
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
      case "orcamento_enviado":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            <Send className="mr-1 h-3 w-3" />
            Orçamento Enviado
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const totalQuoteValue = quoteItems.reduce((sum, item) => sum + item.total, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Solicitações de Funcionários</h1>
          <p className="text-muted-foreground">Gerencie as solicitações de orçamento dos funcionários</p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar solicitações..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs defaultValue="pendentes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pendentes">Pendentes ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="processadas">Processadas ({processedRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Funcionário</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Valor Estimado</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.length > 0 ? (
                      pendingRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.number}</TableCell>
                          <TableCell>{request.employee}</TableCell>
                          <TableCell>{request.client}</TableCell>
                          <TableCell>{request.vehicle}</TableCell>
                          <TableCell>R$ {request.estimatedValue.toFixed(2)}</TableCell>
                          <TableCell>{request.createdDate}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleViewRequest(request)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleCreateQuote(request)}>
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleApproveRequest(request.id)}>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleRejectRequest(request.id)}>
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          Nenhuma solicitação pendente
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processadas">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações Processadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Funcionário</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Resposta</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedRequests.length > 0 ? (
                      processedRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.number}</TableCell>
                          <TableCell>{request.employee}</TableCell>
                          <TableCell>{request.client}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>{request.responseDate}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleViewRequest(request)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          Nenhuma solicitação processada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para visualizar solicitação */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
            <DialogDescription>Informações completas da solicitação de orçamento</DialogDescription>
          </DialogHeader>
          {currentRequest && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Número</Label>
                  <Input value={currentRequest.number} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <div>{getStatusBadge(currentRequest.status)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Funcionário</Label>
                  <Input value={currentRequest.employee} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Cliente</Label>
                  <Input value={currentRequest.client} disabled />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Veículo</Label>
                <Input value={currentRequest.vehicle} disabled />
              </div>
              <div className="grid gap-2">
                <Label>Descrição dos Serviços</Label>
                <Textarea value={currentRequest.description} disabled rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Valor Estimado</Label>
                  <Input value={`R$ ${currentRequest.estimatedValue.toFixed(2)}`} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Data de Criação</Label>
                  <Input value={currentRequest.createdDate} disabled />
                </div>
              </div>
              {currentRequest.adminNotes && (
                <div className="grid gap-2">
                  <Label>Observações do Administrador</Label>
                  <Textarea value={currentRequest.adminNotes} disabled rows={2} />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para criar orçamento */}
      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Criar Orçamento</DialogTitle>
            <DialogDescription>Crie um orçamento detalhado para {currentRequest?.client}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Informações do cliente */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Informações do Serviço</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Cliente:</strong> {currentRequest?.client}
                </div>
                <div>
                  <strong>Veículo:</strong> {currentRequest?.vehicle}
                </div>
                <div className="col-span-2">
                  <strong>Descrição:</strong> {currentRequest?.description}
                </div>
              </div>
            </div>

            {/* Adicionar item */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Adicionar Item ao Orçamento</h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={newQuoteItem.description}
                    onChange={(e) => setNewQuoteItem({ ...newQuoteItem, description: e.target.value })}
                    placeholder="Ex: Troca de óleo 5W30"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newQuoteItem.quantity}
                    onChange={(e) =>
                      setNewQuoteItem({ ...newQuoteItem, quantity: Number.parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="unitPrice">Preço Unitário</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={newQuoteItem.unitPrice}
                    onChange={(e) =>
                      setNewQuoteItem({ ...newQuoteItem, unitPrice: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <Button onClick={handleAddQuoteItem} className="mt-3">
                <DollarSign className="mr-2 h-4 w-4" />
                Adicionar Item
              </Button>
            </div>

            {/* Lista de itens */}
            {quoteItems.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Itens do Orçamento</h4>
                <div className="space-y-2">
                  {quoteItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-muted/50 p-3 rounded">
                      <div className="flex-1">
                        <div className="font-medium">{item.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity}x R$ {item.unitPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">R$ {item.total.toFixed(2)}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveQuoteItem(item.id)}>
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total:</span>
                    <span>R$ {totalQuoteValue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQuoteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendQuote} disabled={quoteItems.length === 0}>
              <Send className="mr-2 h-4 w-4" />
              Enviar Orçamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
