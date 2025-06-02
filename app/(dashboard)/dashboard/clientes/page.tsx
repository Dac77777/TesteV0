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

// Mock data
const initialClients = [
  { id: 1, name: "João Silva", email: "joao@example.com", phone: "(11) 98765-4321", address: "Rua A, 123" },
  { id: 2, name: "Maria Oliveira", email: "maria@example.com", phone: "(11) 91234-5678", address: "Av. B, 456" },
  { id: 3, name: "Carlos Santos", email: "carlos@example.com", phone: "(11) 99876-5432", address: "Rua C, 789" },
  { id: 4, name: "Ana Souza", email: "ana@example.com", phone: "(11) 95678-1234", address: "Av. D, 101" },
  { id: 5, name: "Paulo Lima", email: "paulo@example.com", phone: "(11) 92345-6789", address: "Rua E, 202" },
]

export default function ClientesPage() {
  const [clients, setClients] = useState(initialClients)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentClient, setCurrentClient] = useState({
    id: 0,
    name: "",
    email: "",
    phone: "",
    address: "",
  })
  const [isEditing, setIsEditing] = useState(false)

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm),
  )

  const handleAddClient = () => {
    setIsEditing(false)
    setCurrentClient({
      id: clients.length + 1,
      name: "",
      email: "",
      phone: "",
      address: "",
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
      setClients(clients.filter((client) => client.id !== id))
    }
  }

  const handleSaveClient = () => {
    if (isEditing) {
      setClients(clients.map((client) => (client.id === currentClient.id ? currentClient : client)))
    } else {
      setClients([...clients, currentClient])
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle>Clientes</CardTitle>
          <Button onClick={handleAddClient} className="w-full sm:w-auto">
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
              className="w-full sm:max-w-sm"
            />
          </div>

          {/* Mobile View */}
          <div className="block sm:hidden space-y-4">
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <Card key={client.id}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{client.name}</h3>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClient(client)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClient(client.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                      <p className="text-sm text-muted-foreground">{client.phone}</p>
                      <p className="text-sm text-muted-foreground">{client.address}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum cliente encontrado</p>
              </div>
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden sm:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead className="hidden lg:table-cell">Endereço</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{client.email}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell className="hidden lg:table-cell">{client.address}</TableCell>
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
                    <TableCell colSpan={5} className="text-center">
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
        <DialogContent className="w-[95vw] max-w-md">
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
                onChange={(e) => setCurrentClient({ ...currentClient, phone: e.target.value })}
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
          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleSaveClient} className="w-full sm:w-auto">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
