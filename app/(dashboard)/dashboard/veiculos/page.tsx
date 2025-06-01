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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash, Camera } from "lucide-react"

// Mock data
const initialVehicles = [
  { id: 1, plate: "ABC-1234", brand: "Fiat", model: "Uno", year: "2018", color: "Branco", client: "João Silva" },
  { id: 2, plate: "DEF-5678", brand: "Honda", model: "Civic", year: "2020", color: "Preto", client: "Maria Oliveira" },
  { id: 3, plate: "GHI-9012", brand: "VW", model: "Gol", year: "2019", color: "Prata", client: "Carlos Santos" },
  { id: 4, plate: "JKL-3456", brand: "Chevrolet", model: "Onix", year: "2021", color: "Vermelho", client: "Ana Souza" },
  { id: 5, plate: "MNO-7890", brand: "Toyota", model: "Corolla", year: "2022", color: "Azul", client: "Paulo Lima" },
]

const clients = ["João Silva", "Maria Oliveira", "Carlos Santos", "Ana Souza", "Paulo Lima"]

export default function VeiculosPage() {
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentVehicle, setCurrentVehicle] = useState({
    id: 0,
    plate: "",
    brand: "",
    model: "",
    year: "",
    color: "",
    client: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [vehiclePhotos, setVehiclePhotos] = useState({})

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.client.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddVehicle = () => {
    setIsEditing(false)
    setCurrentVehicle({
      id: vehicles.length + 1,
      plate: "",
      brand: "",
      model: "",
      year: "",
      color: "",
      client: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditVehicle = (vehicle) => {
    setIsEditing(true)
    setCurrentVehicle(vehicle)
    setIsDialogOpen(true)
  }

  const handleDeleteVehicle = (id) => {
    if (confirm("Tem certeza que deseja excluir este veículo?")) {
      setVehicles(vehicles.filter((vehicle) => vehicle.id !== id))
    }
  }

  const handleSaveVehicle = () => {
    if (isEditing) {
      setVehicles(vehicles.map((vehicle) => (vehicle.id === currentVehicle.id ? currentVehicle : vehicle)))
    } else {
      setVehicles([...vehicles, currentVehicle])
    }
    setIsDialogOpen(false)
  }

  const handleTakePhoto = (vehicleId) => {
    setShowCamera(true)
    // In a real app, this would activate the camera
    // For this demo, we'll simulate taking a photo
    setTimeout(() => {
      setVehiclePhotos({
        ...vehiclePhotos,
        [vehicleId]: `/placeholder.svg?height=200&width=300&text=Foto+do+Veículo+${vehicleId}`,
      })
      setShowCamera(false)
      alert("Foto capturada com sucesso!")
    }, 1000)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Veículos</CardTitle>
          <Button onClick={handleAddVehicle}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Veículo
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar veículos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead>Marca/Modelo</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.plate}</TableCell>
                      <TableCell>
                        {vehicle.brand} {vehicle.model}
                      </TableCell>
                      <TableCell>{vehicle.year}</TableCell>
                      <TableCell>{vehicle.color}</TableCell>
                      <TableCell>{vehicle.client}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleTakePhoto(vehicle.id)}>
                          <Camera className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditVehicle(vehicle)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteVehicle(vehicle.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Nenhum veículo encontrado
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
            <DialogTitle>{isEditing ? "Editar Veículo" : "Novo Veículo"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Edite os dados do veículo abaixo." : "Preencha os dados do novo veículo."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="plate">Placa</Label>
              <Input
                id="plate"
                value={currentVehicle.plate}
                onChange={(e) => setCurrentVehicle({ ...currentVehicle, plate: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  value={currentVehicle.brand}
                  onChange={(e) => setCurrentVehicle({ ...currentVehicle, brand: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  value={currentVehicle.model}
                  onChange={(e) => setCurrentVehicle({ ...currentVehicle, model: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="year">Ano</Label>
                <Input
                  id="year"
                  value={currentVehicle.year}
                  onChange={(e) => setCurrentVehicle({ ...currentVehicle, year: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="color">Cor</Label>
                <Input
                  id="color"
                  value={currentVehicle.color}
                  onChange={(e) => setCurrentVehicle({ ...currentVehicle, color: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client">Cliente</Label>
              <Select
                value={currentVehicle.client}
                onValueChange={(value) => setCurrentVehicle({ ...currentVehicle, client: value })}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveVehicle}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background p-4 rounded-lg">
            <h3 className="mb-4 text-lg font-medium">Capturando foto...</h3>
            <div className="aspect-video w-full max-w-md bg-muted flex items-center justify-center">
              <Camera className="h-12 w-12 text-muted-foreground animate-pulse" />
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setShowCamera(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
