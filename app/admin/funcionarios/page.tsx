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
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash, UserCheck, UserX } from "lucide-react"
import { authService } from "@/lib/auth"
import { activityLogger } from "@/lib/activity-logger"
import type { User } from "@/types/user"

export default function AdminFuncionariosPage() {
  const [employees, setEmployees] = useState<User[]>(authService.getEmployeesList())
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentEmployee, setCurrentEmployee] = useState<Partial<User>>({
    name: "",
    email: "",
    password: "",
    role: "funcionario",
    isActive: true,
  })
  const [isEditing, setIsEditing] = useState(false)

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddEmployee = () => {
    setIsEditing(false)
    setCurrentEmployee({
      name: "",
      email: "",
      password: "",
      role: "funcionario",
      isActive: true,
    })
    setIsDialogOpen(true)
  }

  const handleEditEmployee = (employee: User) => {
    setIsEditing(true)
    setCurrentEmployee(employee)
    setIsDialogOpen(true)
  }

  const handleDeleteEmployee = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este funcionário?")) {
      const employee = employees.find((e) => e.id === id)
      authService.deleteEmployee(id)
      setEmployees(authService.getEmployeesList())

      activityLogger.log(
        "DELETE_EMPLOYEE",
        `Funcionário excluído: ${employee?.name} - ${employee?.email}`,
        "FUNCIONARIOS",
      )
    }
  }

  const handleToggleActive = (id: string) => {
    const employee = employees.find((e) => e.id === id)
    if (employee) {
      const newStatus = !employee.isActive
      authService.updateEmployee(id, { isActive: newStatus })
      setEmployees(authService.getEmployeesList())

      activityLogger.log(
        "TOGGLE_EMPLOYEE_STATUS",
        `Funcionário ${newStatus ? "ativado" : "desativado"}: ${employee.name}`,
        "FUNCIONARIOS",
      )
    }
  }

  const handleSaveEmployee = () => {
    if (!currentEmployee.name || !currentEmployee.email || !currentEmployee.password) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    if (isEditing && currentEmployee.id) {
      authService.updateEmployee(currentEmployee.id, currentEmployee)
      activityLogger.log(
        "UPDATE_EMPLOYEE",
        `Funcionário atualizado: ${currentEmployee.name} - ${currentEmployee.email}`,
        "FUNCIONARIOS",
      )
    } else {
      authService.addEmployee(currentEmployee as Omit<User, "id" | "createdAt">)
      activityLogger.log(
        "CREATE_EMPLOYEE",
        `Novo funcionário criado: ${currentEmployee.name} - ${currentEmployee.email}`,
        "FUNCIONARIOS",
      )
    }

    setEmployees(authService.getEmployeesList())
    setIsDialogOpen(false)
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="outline" className="bg-green-100 text-green-800">
        <UserCheck className="mr-1 h-3 w-3" />
        Ativo
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-red-100 text-red-800">
        <UserX className="mr-1 h-3 w-3" />
        Inativo
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gerenciar Funcionários</CardTitle>
          <Button onClick={handleAddEmployee}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Funcionário
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar funcionários..."
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
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{getStatusBadge(employee.isActive)}</TableCell>
                      <TableCell>{new Date(employee.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(employee.id)}
                          title={employee.isActive ? "Desativar" : "Ativar"}
                        >
                          {employee.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditEmployee(employee)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteEmployee(employee.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Nenhum funcionário encontrado
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
            <DialogTitle>{isEditing ? "Editar Funcionário" : "Novo Funcionário"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Edite os dados do funcionário abaixo." : "Preencha os dados do novo funcionário."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={currentEmployee.name || ""}
                onChange={(e) => setCurrentEmployee({ ...currentEmployee, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={currentEmployee.email || ""}
                onChange={(e) => setCurrentEmployee({ ...currentEmployee, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                value={currentEmployee.password || ""}
                onChange={(e) => setCurrentEmployee({ ...currentEmployee, password: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={currentEmployee.isActive || false}
                onCheckedChange={(checked) => setCurrentEmployee({ ...currentEmployee, isActive: checked })}
              />
              <Label htmlFor="isActive">Funcionário Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEmployee}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
