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
import { Plus, Search, Edit, Trash, Camera, ImageIcon } from "lucide-react"
import { activityLogger } from "@/lib/activity-logger"
import type { ServicePhoto } from "@/types/user"

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

export default function FuncionarioServicosPage() {
  const [services, setServices] = useState(initialServices)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false)
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
  })
  const [isEditing, setIsEditing] = useState(false)
  const [selectedServiceForPhotos, setSelectedServiceForPhotos] = useState(null)
  const [newPhoto, setNewPhoto] = useState({
    description: "",
    url: "",
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
      const service = services.find((s) => s.id === id)
      setServices(services.filter((service) => service.id !== id))

      activityLogger.log("DELETE_SERVICE", `Serviço excluído: ${service?.description} - ${service?.client}`, "SERVICOS")
    }
  }

  const handleSaveService = () => {
    if (isEditing) {
      setServices(services.map((service) => (service.id === currentService.id ? currentService : service)))
      activityLogger.log(
        "UPDATE_SERVICE",
        `Serviço atualizado: ${currentService.description} - ${currentService.client}`,
        "SERVICOS",
      )
    } else {
      setServices([...services, currentService])
      activityLogger.log(
        "CREATE_SERVICE",
        `Novo serviço criado: ${currentService.description} - ${currentService.client}`,
        "SERVICOS",
      )
    }
    setIsDialogOpen(false)
  }

  const handleOpenPhotos = (service) => {
    setSelectedServiceForPhotos(service)
    setIsPhotoDialogOpen(true)
  }

  const handleAddPhoto = () => {
    if (!newPhoto.description) {
      alert("Por favor, adicione uma descrição para a foto")
      return
    }

    // Simular captura de foto
    const photo: ServicePhoto = {
      id: `photo_${Date.now()}`,
      serviceId: selectedServiceForPhotos.id.toString(),
      url: `/placeholder.svg?height=300&width=400&text=Foto+${selectedServiceForPhotos.id}`,
      description: newPhoto.description,
      uploadedAt: new Date().toISOString(),
      uploadedBy: "Funcionário",
    }

    // Atualizar serviço com nova foto
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

    activityLogger.log(
      "ADD_PHOTO",
      `Foto adicionada ao serviço: ${selectedServiceForPhotos.description} - ${photo.description}`,
      "SERVICOS",
    )
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

      activityLogger.log(
        "DELETE_PHOTO",
        `Foto removida do serviço: ${selectedServiceForPhotos.description}`,
        "SERVICOS",
      )
    }
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
                  <TableHead>Fotos</TableHead>
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
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleOpenPhotos(service)}>
                          <ImageIcon className="mr-1 h-4 w-4" />
                          {service.photos?.length || 0}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
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
    </div>
  )
}
