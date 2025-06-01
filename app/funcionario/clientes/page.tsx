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
import { Plus, Search, Edit, Trash } from "lucide-react"
import { activityLogger } from "@/lib/activity-logger"

// Mock data
const initialClients = [
  {
    id: 1,
    name: "João Silva",
    email: "joao@example.com",
    phone: "(11) 98765-4321",
    address: "Rua A, 123",
    cpf: "123.456.789-00",
  },
  {
    id: 2,
    name: "Maria Oliveira",
    email: "maria@example.com",
    phone: "(11) 91234-5678",
    address: "Av. B, 456",
    cpf: "987.654.321-00",
  },
  {
    id: 3,
    name: "Carlos Santos",
    email: "carlos@example.com",
    phone: "(11) 99876-5432",
    address: "Rua C, 789",
    cpf: "456.789.123-00",
  },
]

export default function FuncionarioClientesPage() {
  const [clients, setClients] = useState(initialClients)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentClient, setCurrentClient] = useState({
    id: 0,
    name: "",
    email: "",
    phone: "",
    address: "",
    cpf: "",
  })
  const [isEditing, setIsEditing] = useState(false)

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.cpf.includes(searchTerm),
  )

  const handleAddClient = () => {
    setIsEditing(false)
    setCurrentClient({
      id: clients.length + 1,
      name: "",
      email: "",
      phone: "",
      address: "",
      cpf: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditClient = (client) => {
    setIsEditing(true)
    setCurrentClient(client)
    setIsDialogOpen(true)
  }

  const handleDeleteClient = (id) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      const client = clients.find((c) => c.id === id)
      setClients(clients.filter((client) => client.id !== id))

      activityLogger.log("DELETE_CLIENT", `Cliente excluído: ${client?.name} - ${client?.cpf}`, "CLIENTES")
    }
  }

  const handleSaveClient = () => {
    if (isEditing) {
      setClients(clients.map((client) => (client.id === currentClient.id ? currentClient : client)))
      activityLogger.log(
        "UPDATE_CLIENT",
        `Cliente atualizado: ${currentClient.name} - ${currentClient.cpf}`,
        "CLIENTES",
      )
    } else {
      setClients([...clients, currentClient])
      activityLogger.log(
        "CREATE_CLIENT",
        `Novo cliente criado: ${currentClient.name} - ${currentClient.cpf}`,
        "CLIENTES",
      )
    }
    setIsDialogOpen(false)
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Clientes</CardTitle>
          <Button onClick={handleAddClient}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.cpf}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>{client.address}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClient(client)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClient(client.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Nenhum cliente encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Edite os dados do cliente abaixo." : "Preencha os dados do novo cliente."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={currentClient.name}
                onChange={(e) => setCurrentClient({ ...currentClient, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={currentClient.cpf}
                onChange={(e) => setCurrentClient({ ...currentClient, cpf: formatCPF(e.target.value) })}
                maxLength={14}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={currentClient.email}
                onChange={(e) => setCurrentClient({ ...currentClient, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={currentClient.phone}
                onChange={(e) => setCurrentClient({ ...currentClient, phone: formatPhone(e.target.value) })}
                maxLength={15}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={currentClient.address}
                onChange={(e) => setCurrentClient({ ...currentClient, address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveClient}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
