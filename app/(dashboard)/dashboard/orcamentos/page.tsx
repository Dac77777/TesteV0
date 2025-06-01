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
import { Plus, Search, Edit, Trash, Send } from "lucide-react"

// Mock data
const initialQuotes = [
  {
    id: 1,
    number: "ORC-001",
    client: "João Silva",
    vehicle: "ABC-1234 - Fiat Uno",
    description: "Troca de óleo e filtros",
    value: 250.0,
    status: "pendente",
    createdDate: "2023-06-01",
    validUntil: "2023-06-15",
  },
  {
    id: 2,
    number: "ORC-002",
    client: "Maria Oliveira",
    vehicle: "DEF-5678 - Honda Civic",
    description: "Revisão completa dos 20.000km",
    value: 850.0,
    status: "aprovado",
    createdDate: "2023-05-28",
    validUntil: "2023-06-12",
  },
  {
    id: 3,
    number: "ORC-003",
    client: "Carlos Santos",
    vehicle: "GHI-9012 - VW Gol",
    description: "Alinhamento e balanceamento",
    value: 120.0,
    status: "rejeitado",
    createdDate: "2023-05-25",
    validUntil: "2023-06-08",
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

const statusOptions = [
  { value: "pendente", label: "Pendente" },
  { value: "aprovado", label: "Aprovado" },
  { value: "rejeitado", label: "Rejeitado" },
  { value: "expirado", label: "Expirado" },
]

export default function OrcamentosPage() {
  const [quotes, setQuotes] = useState(initialQuotes)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentQuote, setCurrentQuote] = useState({
    id: 0,
    number: "",
    client: "",
    vehicle: "",
    description: "",
    value: 0,
    status: "pendente",
    createdDate: "",
    validUntil: "",
  })
  const [isEditing, setIsEditing] = useState(false)

  const filteredQuotes = quotes.filter(
    (quote) =>
      quote.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddQuote = () => {
    setIsEditing(false)
    const today = new Date()
    const validUntil = new Date(today)
    validUntil.setDate(today.getDate() + 15)

    setCurrentQuote({
      id: quotes.length + 1,
      number: `ORC-${String(quotes.length + 1).padStart(3, "0")}`,
      client: "",
      vehicle: "",
      description: "",
      value: 0,
      status: "pendente",
      createdDate: today.toISOString().split("T")[0],
      validUntil: validUntil.toISOString().split("T")[0],
    })
    setIsDialogOpen(true)
  }

  const handleEditQuote = (quote) => {
    setIsEditing(true)
    setCurrentQuote(quote)
    setIsDialogOpen(true)
  }

  const handleDeleteQuote = (id) => {
    if (confirm("Tem certeza que deseja excluir este orçamento?")) {
      setQuotes(quotes.filter((quote) => quote.id !== id))
    }
  }

  const handleSaveQuote = () => {
    if (isEditing) {
      setQuotes(quotes.map((quote) => (quote.id === currentQuote.id ? currentQuote : quote)))
    } else {
      setQuotes([...quotes, currentQuote])
    }
    setIsDialogOpen(false)
  }

  const handleSendQuote = (quote) => {
    // Simulate sending quote
    alert(`Orçamento ${quote.number} enviado para ${quote.client}`)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "pendente":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            Pendente
          </Badge>
        )
      case "aprovado":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Aprovado
          </Badge>
        )
      case "rejeitado":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Rejeitado
          </Badge>
        )
      case "expirado":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Expirado
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
          <CardTitle>Orçamentos</CardTitle>
          <Button onClick={handleAddQuote}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Orçamento
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar orçamentos..."
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
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Válido até</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.length > 0 ? (
                  filteredQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">{quote.number}</TableCell>
                      <TableCell>{quote.client}</TableCell>
                      <TableCell>{quote.vehicle}</TableCell>
                      <TableCell>R$ {quote.value.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(quote.status)}</TableCell>
                      <TableCell>{quote.validUntil}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleSendQuote(quote)}>
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditQuote(quote)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteQuote(quote.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Nenhum orçamento encontrado
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
            <DialogTitle>{isEditing ? "Editar Orçamento" : "Novo Orçamento"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Edite os dados do orçamento abaixo." : "Preencha os dados do novo orçamento."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={currentQuote.number}
                  onChange={(e) => setCurrentQuote({ ...currentQuote, number: e.target.value })}
                  disabled={isEditing}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={currentQuote.status}
                  onValueChange={(value) => setCurrentQuote({ ...currentQuote, status: value })}
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="client">Cliente</Label>
                <Select
                  value={currentQuote.client}
                  onValueChange={(value) => setCurrentQuote({ ...currentQuote, client: value })}
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
                  value={currentQuote.vehicle}
                  onValueChange={(value) => setCurrentQuote({ ...currentQuote, vehicle: value })}
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
                value={currentQuote.description}
                onChange={(e) => setCurrentQuote({ ...currentQuote, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="value">Valor Total (R$)</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={currentQuote.value}
                  onChange={(e) => setCurrentQuote({ ...currentQuote, value: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="createdDate">Data de Criação</Label>
                <Input
                  id="createdDate"
                  type="date"
                  value={currentQuote.createdDate}
                  onChange={(e) => setCurrentQuote({ ...currentQuote, createdDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="validUntil">Válido até</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={currentQuote.validUntil}
                  onChange={(e) => setCurrentQuote({ ...currentQuote, validUntil: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveQuote}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
