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
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash, AlertTriangle } from "lucide-react"

// Mock data
const initialStock = [
  {
    id: 1,
    name: "Óleo Motor 5W30",
    category: "Lubrificantes",
    quantity: 25,
    minQuantity: 10,
    price: 45.9,
    supplier: "Distribuidora ABC",
  },
  {
    id: 2,
    name: "Filtro de Ar",
    category: "Filtros",
    quantity: 8,
    minQuantity: 15,
    price: 32.5,
    supplier: "Auto Peças XYZ",
  },
  {
    id: 3,
    name: "Pastilha de Freio",
    category: "Freios",
    quantity: 12,
    minQuantity: 5,
    price: 89.9,
    supplier: "Freios & Cia",
  },
  {
    id: 4,
    name: "Vela de Ignição",
    category: "Motor",
    quantity: 30,
    minQuantity: 20,
    price: 15.8,
    supplier: "Motor Parts",
  },
  {
    id: 5,
    name: "Correia Dentada",
    category: "Motor",
    quantity: 3,
    minQuantity: 8,
    price: 125.0,
    supplier: "Auto Peças XYZ",
  },
]

const categories = ["Lubrificantes", "Filtros", "Freios", "Motor", "Elétrica", "Suspensão", "Outros"]

export default function EstoquePage() {
  const [stock, setStock] = useState(initialStock)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState({
    id: 0,
    name: "",
    category: "",
    quantity: 0,
    minQuantity: 0,
    price: 0,
    supplier: "",
  })
  const [isEditing, setIsEditing] = useState(false)

  const filteredStock = stock.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const lowStockItems = stock.filter((item) => item.quantity <= item.minQuantity)

  const handleAddItem = () => {
    setIsEditing(false)
    setCurrentItem({
      id: stock.length + 1,
      name: "",
      category: "",
      quantity: 0,
      minQuantity: 0,
      price: 0,
      supplier: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditItem = (item) => {
    setIsEditing(true)
    setCurrentItem(item)
    setIsDialogOpen(true)
  }

  const handleDeleteItem = (id) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      setStock(stock.filter((item) => item.id !== id))
    }
  }

  const handleSaveItem = () => {
    if (isEditing) {
      setStock(stock.map((item) => (item.id === currentItem.id ? currentItem : item)))
    } else {
      setStock([...stock, currentItem])
    }
    setIsDialogOpen(false)
  }

  const getStockStatus = (item) => {
    if (item.quantity === 0) {
      return <Badge variant="destructive">Sem Estoque</Badge>
    } else if (item.quantity <= item.minQuantity) {
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-800">
          Estoque Baixo
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800">
          Normal
        </Badge>
      )
    }
  }

  return (
    <div className="space-y-4">
      {lowStockItems.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-800">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Alerta de Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-700">
              {lowStockItems.length} {lowStockItems.length === 1 ? "item está" : "itens estão"} com estoque baixo ou
              zerado.
            </p>
            <div className="mt-2 space-y-1">
              {lowStockItems.map((item) => (
                <div key={item.id} className="text-sm text-amber-600">
                  • {item.name} - Quantidade: {item.quantity} (Mín: {item.minQuantity})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Controle de Estoque</CardTitle>
          <Button onClick={handleAddItem}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Item
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar itens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStock.length > 0 ? (
                  filteredStock.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{getStockStatus(item)}</TableCell>
                      <TableCell>R$ {item.price.toFixed(2)}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Nenhum item encontrado
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
            <DialogTitle>{isEditing ? "Editar Item" : "Novo Item"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Edite os dados do item abaixo." : "Preencha os dados do novo item."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Item</Label>
              <Input
                id="name"
                value={currentItem.name}
                onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  value={currentItem.category}
                  onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supplier">Fornecedor</Label>
                <Input
                  id="supplier"
                  value={currentItem.supplier}
                  onChange={(e) => setCurrentItem({ ...currentItem, supplier: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({ ...currentItem, quantity: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minQuantity">Estoque Mínimo</Label>
                <Input
                  id="minQuantity"
                  type="number"
                  value={currentItem.minQuantity}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, minQuantity: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={currentItem.price}
                  onChange={(e) => setCurrentItem({ ...currentItem, price: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveItem}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
