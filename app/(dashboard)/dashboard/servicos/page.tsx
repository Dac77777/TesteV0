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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Edit, Trash, Camera, ImageIcon, FileText, DollarSign, CheckCircle, XCircle } from "lucide-react"

// Mock data
const initialServices = [
  {
    id: 1,
    description: "Troca de Óleo",
    vehicle: "ABC-1234 - Fiat Uno",
    client: "João Silva",
    status: "em_andamento",
    startDate: "2023-06-01",
    endDate: null,
    notes: "Cliente solicitou verificação dos freios também",
    photos: [],
    budget: {
      id: "orc_1",
      items: [
        { id: 1, description: "Óleo Motor 5W30", quantity: 4, unitPrice: 45.9, confirmed: true },
        { id: 2, description: "Filtro de Óleo", quantity: 1, unitPrice: 25.0, confirmed: true },
        { id: 3, description: "Mão de obra", quantity: 1, unitPrice: 80.0, confirmed: true },
      ],
      additionalItems: [],
    },
  },
  {
    id: 2,
    description: "Revisão Completa",
    vehicle: "DEF-5678 - Honda Civic",
    client: "Maria Oliveira",
    status: "concluido",
    startDate: "2023-05-28",
    endDate: "2023-05-30",
    notes: "Substituição de filtros e verificação geral",
    photos: [],
    budget: {
      id: "orc_2",
      items: [
        { id: 1, description: "Óleo Motor", quantity: 4, unitPrice: 50.0, confirmed: true },
        { id: 2, description: "Filtro de Ar", quantity: 1, unitPrice: 35.0, confirmed: true },
        { id: 3, description: "Filtro de Combustível", quantity: 1, unitPrice: 40.0, confirmed: true },
        { id: 4, description: "Velas de Ignição", quantity: 4, unitPrice: 25.0, confirmed: true },
      ],
      additionalItems: [],
    },
  },
  {
    id: 3,
    description: "Alinhamento",
    vehicle: "GHI-9012 - VW Gol",
    client: "Carlos Santos",
    status: "agendado",
    startDate: "2023-06-05",
    endDate: null,
    notes: "Cliente relatou vibração no volante",
    photos: [],
    budget: {
      id: "orc_3",
      items: [
        { id: 1, description: "Alinhamento", quantity: 1, unitPrice: 80.0, confirmed: false },
        { id: 2, description: "Balanceamento", quantity: 1, unitPrice: 60.0, confirmed: false },
      ],
      additionalItems: [],
    },
  },
]

const vehicles = [
  "ABC-1234 - Fiat Uno",
  "DEF-5678 - Honda Civic",
  "GHI-9012 - VW Gol",
  "JKL-3456 - Chevrolet Onix",
  "MNO-7890 - Toyota Corolla",
]

const clients = ["João Silva", "Maria Oliveira", "Carlos Santos", "Ana Souza", "Paulo Lima"]

const statusOptions = [
  { value: "agendado", label: "Agendado" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" },
]

export default function ServicosPage() {
  const [services, setServices] = useState(initialServices)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false)
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false)
  const [currentService, setCurrentService] = useState({
    id: 0,
    description: "",
    vehicle: "",
    client: "",
    status: "agendado",
    startDate: "",
    endDate: null,
    notes: "",
    photos: [],
    budget: { id: "", items: [], additionalItems: [] },
  })
  const [isEditing, setIsEditing] = useState(false)
  const [selectedServiceForPhotos, setSelectedServiceForPhotos] = useState(null)
  const [selectedServiceForBudget, setSelectedServiceForBudget] = useState(null)
  const [newPhoto, setNewPhoto] = useState({
    description: "",
    url: "",
  })
  const [newBudgetItem, setNewBudgetItem] = useState({
    description: "",
    quantity: 1,
    unitPrice: 0,
    confirmed: false,
  })

  const filteredServices = services.filter(
    (service) =>
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.client.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddService = () => {
    setIsEditing(false)
    setCurrentService({
      id: services.length + 1,
      description: "",
      vehicle: "",
      client: "",
      status: "agendado",
      startDate: new Date().toISOString().split("T")[0],
      endDate: null,
      notes: "",
      photos: [],
      budget: { id: `orc_${services.length + 1}`, items: [], additionalItems: [] },
    })
    setIsDialogOpen(true)
  }

  const handleEditService = (service) => {
    setIsEditing(true)
    setCurrentService(service)
    setIsDialogOpen(true)
  }

  const handleDeleteService = (id) => {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      setServices(services.filter((service) => service.id !== id))
    }
  }

  const handleSaveService = () => {
    if (isEditing) {
      setServices(services.map((service) => (service.id === currentService.id ? currentService : service)))
    } else {
      setServices([...services, currentService])
    }
    setIsDialogOpen(false)
  }

  // Fotos
  const handleOpenPhotos = (service) => {
    setSelectedServiceForPhotos(service)
    setIsPhotoDialogOpen(true)
  }

  const handleAddPhoto = () => {
    if (!newPhoto.description) {
      alert("Por favor, adicione uma descrição para a foto")
      return
    }

    const photo = {
      id: `photo_${Date.now()}`,
      serviceId: selectedServiceForPhotos.id.toString(),
      url: `/placeholder.svg?height=300&width=400&text=Foto+${selectedServiceForPhotos.id}`,
      description: newPhoto.description,
      uploadedAt: new Date().toISOString(),
      uploadedBy: "Usuário",
    }

    const updatedServices = services.map((service) => {
      if (service.id === selectedServiceForPhotos.id) {
        return {
          ...service,
          photos: [...(service.photos || []), photo],
        }
      }
      return service
    })

    setServices(updatedServices)
    setSelectedServiceForPhotos({
      ...selectedServiceForPhotos,
      photos: [...(selectedServiceForPhotos.photos || []), photo],
    })

    setNewPhoto({ description: "", url: "" })
  }

  const handleDeletePhoto = (photoId) => {
    if (confirm("Tem certeza que deseja excluir esta foto?")) {
      const updatedPhotos = selectedServiceForPhotos.photos.filter((p) => p.id !== photoId)

      const updatedServices = services.map((service) => {
        if (service.id === selectedServiceForPhotos.id) {
          return {
            ...service,
            photos: updatedPhotos,
          }
        }
        return service
      })

      setServices(updatedServices)
      setSelectedServiceForPhotos({
        ...selectedServiceForPhotos,
        photos: updatedPhotos,
      })
    }
  }

  // Orçamento
  const handleOpenBudget = (service) => {
    setSelectedServiceForBudget(service)
    setIsBudgetDialogOpen(true)
  }

  const handleAddBudgetItem = () => {
    if (!newBudgetItem.description || newBudgetItem.quantity <= 0 || newBudgetItem.unitPrice <= 0) {
      alert("Por favor, preencha todos os campos corretamente")
      return
    }

    const item = {
      id: Date.now(),
      ...newBudgetItem,
    }

    const updatedServices = services.map((service) => {
      if (service.id === selectedServiceForBudget.id) {
        return {
          ...service,
          budget: {
            ...service.budget,
            additionalItems: [...(service.budget.additionalItems || []), item],
          },
        }
      }
      return service
    })

    setServices(updatedServices)
    setSelectedServiceForBudget({
      ...selectedServiceForBudget,
      budget: {
        ...selectedServiceForBudget.budget,
        additionalItems: [...(selectedServiceForBudget.budget.additionalItems || []), item],
      },
    })

    setNewBudgetItem({
      description: "",
      quantity: 1,
      unitPrice: 0,
      confirmed: false,
    })
  }

  const handleToggleItemConfirmation = (itemId, isAdditional = false) => {
    const updatedServices = services.map((service) => {
      if (service.id === selectedServiceForBudget.id) {
        const updatedBudget = { ...service.budget }

        if (isAdditional) {
          updatedBudget.additionalItems = updatedBudget.additionalItems.map((item) =>
            item.id === itemId ? { ...item, confirmed: !item.confirmed } : item,
          )
        } else {
          updatedBudget.items = updatedBudget.items.map((item) =>
            item.id === itemId ? { ...item, confirmed: !item.confirmed } : item,
          )
        }

        return { ...service, budget: updatedBudget }
      }
      return service
    })

    setServices(updatedServices)

    // Atualizar o serviço selecionado
    const updatedService = updatedServices.find((s) => s.id === selectedServiceForBudget.id)
    setSelectedServiceForBudget(updatedService)
  }

  const handleDeleteBudgetItem = (itemId, isAdditional = false) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      const updatedServices = services.map((service) => {
        if (service.id === selectedServiceForBudget.id) {
          const updatedBudget = { ...service.budget }

          if (isAdditional) {
            updatedBudget.additionalItems = updatedBudget.additionalItems.filter((item) => item.id !== itemId)
          } else {
            updatedBudget.items = updatedBudget.items.filter((item) => item.id !== itemId)
          }

          return { ...service, budget: updatedBudget }
        }
        return service
      })

      setServices(updatedServices)

      const updatedService = updatedServices.find((s) => s.id === selectedServiceForBudget.id)
      setSelectedServiceForBudget(updatedService)
    }
  }

  const calculateBudgetTotal = (budget) => {
    const originalTotal = budget.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const additionalTotal = (budget.additionalItems || []).reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    )
    return originalTotal + additionalTotal
  }

  const calculateConfirmedTotal = (budget) => {
    const originalConfirmed = budget.items
      .filter((item) => item.confirmed)
      .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    const additionalConfirmed = (budget.additionalItems || [])
      .filter((item) => item.confirmed)
      .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    return originalConfirmed + additionalConfirmed
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "agendado":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Agendado
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
          <Badge variant="outline" className="bg-green-100 text-green-800">
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

  const getConfirmationBadge = (confirmed) => {
    return confirmed ? (
      <Badge variant="outline" className="bg-green-100 text-green-800">
        <CheckCircle className="mr-1 h-3 w-3" />
        Confirmado
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-amber-100 text-amber-800">
        <XCircle className="mr-1 h-3 w-3" />
        Pendente
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Serviços</CardTitle>
          <Button onClick={handleAddService}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Serviço
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Início</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.description}</TableCell>
                      <TableCell>{service.vehicle}</TableCell>
                      <TableCell>{service.client}</TableCell>
                      <TableCell>{getStatusBadge(service.status)}</TableCell>
                      <TableCell>{service.startDate}</TableCell>
                      <TableCell>R$ {calculateBudgetTotal(service.budget).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenPhotos(service)}>
                          <ImageIcon className="mr-1 h-4 w-4" />
                          {service.photos?.length || 0}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenBudget(service)}>
                          <FileText className="mr-1 h-4 w-4" />
                          Orçamento
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditService(service)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteService(service.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Nenhum serviço encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para editar/criar serviço */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Edite os dados do serviço abaixo." : "Preencha os dados do novo serviço."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={currentService.description}
                onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vehicle">Veículo</Label>
              <Select
                value={currentService.vehicle}
                onValueChange={(value) => setCurrentService({ ...currentService, vehicle: value })}
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
              <Label htmlFor="client">Cliente</Label>
              <Select
                value={currentService.client}
                onValueChange={(value) => setCurrentService({ ...currentService, client: value })}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={currentService.status}
                  onValueChange={(value) => setCurrentService({ ...currentService, status: value })}
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
                <Label htmlFor="startDate">Data Início</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={currentService.startDate}
                  onChange={(e) => setCurrentService({ ...currentService, startDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={currentService.notes}
                onChange={(e) => setCurrentService({ ...currentService, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveService}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para gerenciar fotos */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Fotos do Serviço</DialogTitle>
            <DialogDescription>
              {selectedServiceForPhotos?.description} - {selectedServiceForPhotos?.client}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Adicionar nova foto */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Adicionar Nova Foto</h4>
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="photoDescription">Descrição da Foto</Label>
                  <Input
                    id="photoDescription"
                    placeholder="Ex: Motor antes da manutenção"
                    value={newPhoto.description}
                    onChange={(e) => setNewPhoto({ ...newPhoto, description: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddPhoto} className="w-fit">
                  <Camera className="mr-2 h-4 w-4" />
                  Capturar Foto
                </Button>
              </div>
            </div>

            {/* Lista de fotos */}
            <div className="space-y-3">
              <h4 className="font-medium">Fotos Existentes ({selectedServiceForPhotos?.photos?.length || 0})</h4>
              {selectedServiceForPhotos?.photos?.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {selectedServiceForPhotos.photos.map((photo) => (
                    <div key={photo.id} className="border rounded-lg p-3">
                      <img
                        src={photo.url || "/placeholder.svg"}
                        alt={photo.description}
                        className="w-full h-48 object-cover rounded mb-2"
                      />
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{photo.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(photo.uploadedAt).toLocaleString("pt-BR")}
                        </p>
                        <Button variant="destructive" size="sm" onClick={() => handleDeletePhoto(photo.id)}>
                          <Trash className="mr-1 h-3 w-3" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma foto adicionada ainda</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsPhotoDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para gerenciar orçamento */}
      <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Orçamento do Serviço</DialogTitle>
            <DialogDescription>
              {selectedServiceForBudget?.description} - {selectedServiceForBudget?.client}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="items" className="space-y-4">
            <TabsList>
              <TabsTrigger value="items">Itens do Orçamento</TabsTrigger>
              <TabsTrigger value="summary">Resumo</TabsTrigger>
            </TabsList>

            <TabsContent value="items" className="space-y-4">
              {/* Orçamento Original */}
              <div className="space-y-3">
                <h4 className="font-medium text-lg">Orçamento Original</h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Qtd</TableHead>
                        <TableHead>Valor Unit.</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedServiceForBudget?.budget?.items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>R$ {item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell>R$ {(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                          <TableCell>{getConfirmationBadge(item.confirmed)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleItemConfirmation(item.id, false)}
                            >
                              {item.confirmed ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteBudgetItem(item.id, false)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Itens Adicionais */}
              <div className="space-y-3">
                <h4 className="font-medium text-lg">Itens Adicionais</h4>

                {/* Adicionar novo item */}
                <div className="border rounded-lg p-4">
                  <h5 className="font-medium mb-3">Adicionar Novo Item</h5>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="grid gap-2">
                      <Label>Descrição</Label>
                      <Input
                        placeholder="Ex: Pastilha de freio"
                        value={newBudgetItem.description}
                        onChange={(e) => setNewBudgetItem({ ...newBudgetItem, description: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newBudgetItem.quantity}
                        onChange={(e) =>
                          setNewBudgetItem({ ...newBudgetItem, quantity: Number.parseInt(e.target.value) || 1 })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Valor Unitário</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newBudgetItem.unitPrice}
                        onChange={(e) =>
                          setNewBudgetItem({ ...newBudgetItem, unitPrice: Number.parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Ação</Label>
                      <Button onClick={handleAddBudgetItem}>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Lista de itens adicionais */}
                {selectedServiceForBudget?.budget?.additionalItems?.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Qtd</TableHead>
                          <TableHead>Valor Unit.</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedServiceForBudget.budget.additionalItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.description}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>R$ {item.unitPrice.toFixed(2)}</TableCell>
                            <TableCell>R$ {(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                            <TableCell>{getConfirmationBadge(item.confirmed)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleItemConfirmation(item.id, true)}
                              >
                                {item.confirmed ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteBudgetItem(item.id, true)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Nenhum item adicional</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="summary">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Resumo Financeiro
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Orçamento Original</h4>
                        <div className="text-2xl font-bold">
                          R${" "}
                          {selectedServiceForBudget?.budget?.items
                            ?.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
                            .toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Confirmado: R${" "}
                          {selectedServiceForBudget?.budget?.items
                            ?.filter((item) => item.confirmed)
                            .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
                            .toFixed(2)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Itens Adicionais</h4>
                        <div className="text-2xl font-bold">
                          R${" "}
                          {(selectedServiceForBudget?.budget?.additionalItems || [])
                            .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
                            .toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Confirmado: R${" "}
                          {(selectedServiceForBudget?.budget?.additionalItems || [])
                            .filter((item) => item.confirmed)
                            .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
                            .toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium">Total Geral:</span>
                        <span className="text-2xl font-bold">
                          R${" "}
                          {selectedServiceForBudget
                            ? calculateBudgetTotal(selectedServiceForBudget.budget).toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Total Confirmado:</span>
                        <span>
                          R${" "}
                          {selectedServiceForBudget
                            ? calculateConfirmedTotal(selectedServiceForBudget.budget).toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button onClick={() => setIsBudgetDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
