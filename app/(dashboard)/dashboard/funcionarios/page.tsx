"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  UserCheck,
  UserX,
  Plus,
  Edit,
  Trash,
  Search,
  Users,
  TrendingUp,
  Clock,
  Star,
  DollarSign,
  Calendar,
  Wrench,
  FileText,
} from "lucide-react"
import { authService } from "@/lib/auth"
import { activityLogger } from "@/lib/activity-logger"
import type { User } from "@/types/user"

// Mock data para métricas
const mockMetrics = {
  func1: {
    atendimentos: 45,
    servicos: 38,
    orcamentos: 12,
    valorGerado: 15750.0,
    satisfacao: 4.8,
    eficiencia: 92,
    tempoMedio: 85,
    historico: [
      { mes: "Jan", atendimentos: 8, servicos: 6, orcamentos: 2 },
      { mes: "Fev", atendimentos: 12, servicos: 10, orcamentos: 3 },
      { mes: "Mar", atendimentos: 15, servicos: 12, orcamentos: 4 },
      { mes: "Abr", atendimentos: 10, servicos: 10, orcamentos: 3 },
    ],
    ultimosServicos: [
      {
        id: 1,
        cliente: "João Silva",
        veiculo: "Honda Civic",
        servico: "Troca de óleo",
        data: "2024-01-15",
        valor: 150,
      },
      { id: 2, cliente: "Maria Santos", veiculo: "Toyota Corolla", servico: "Revisão", data: "2024-01-14", valor: 300 },
      { id: 3, cliente: "Carlos Lima", veiculo: "Ford Focus", servico: "Freios", data: "2024-01-13", valor: 450 },
    ],
  },
  func2: {
    atendimentos: 32,
    servicos: 28,
    orcamentos: 8,
    valorGerado: 11200.0,
    satisfacao: 4.6,
    eficiencia: 88,
    tempoMedio: 95,
    historico: [
      { mes: "Jan", atendimentos: 6, servicos: 5, orcamentos: 1 },
      { mes: "Fev", atendimentos: 9, servicos: 8, orcamentos: 2 },
      { mes: "Mar", atendimentos: 11, servicos: 9, orcamentos: 3 },
      { mes: "Abr", atendimentos: 6, servicos: 6, orcamentos: 2 },
    ],
    ultimosServicos: [
      { id: 1, cliente: "Ana Costa", veiculo: "Volkswagen Gol", servico: "Pneus", data: "2024-01-15", valor: 400 },
      {
        id: 2,
        cliente: "Pedro Oliveira",
        veiculo: "Chevrolet Onix",
        servico: "Bateria",
        data: "2024-01-14",
        valor: 250,
      },
      { id: 3, cliente: "Lucia Ferreira", veiculo: "Fiat Uno", servico: "Alinhamento", data: "2024-01-12", valor: 80 },
    ],
  },
}

export default function FuncionariosPage() {
  const [employees, setEmployees] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false)
  const [currentEmployee, setCurrentEmployee] = useState<Partial<User>>({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "funcionario",
    isActive: true,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<string>("func1")

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    const employeesList = await authService.getEmployeesList()
    setEmployees(employeesList)
  }

  // Funcionários filtrados pela busca
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
      username: "",
      password: "",
      role: "funcionario",
      isActive: true,
    })
    setIsEmployeeDialogOpen(true)
  }

  const handleEditEmployee = (employee: User) => {
    setIsEditing(true)
    setCurrentEmployee(employee)
    setIsEmployeeDialogOpen(true)
  }

  const handleDeleteEmployee = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este funcionário?")) {
      const employee = employees.find((e) => e.id === id)
      await authService.deleteEmployee(id)
      await loadEmployees()

      activityLogger.log(
        "DELETE_EMPLOYEE",
        `Funcionário excluído: ${employee?.name} - ${employee?.email}`,
        "FUNCIONARIOS",
      )
    }
  }

  const handleToggleActive = async (id: string) => {
    const employee = employees.find((e) => e.id === id)
    if (employee) {
      const newStatus = !employee.isActive
      await authService.updateEmployee(id, { isActive: newStatus })
      await loadEmployees()

      activityLogger.log(
        "TOGGLE_EMPLOYEE_STATUS",
        `Funcionário ${newStatus ? "ativado" : "desativado"}: ${employee.name}`,
        "FUNCIONARIOS",
      )
    }
  }

  const handleSaveEmployee = async () => {
    if (!currentEmployee.name || !currentEmployee.email || !currentEmployee.password || !currentEmployee.username) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    if (isEditing && currentEmployee.id) {
      await authService.updateEmployee(currentEmployee.id, currentEmployee)
      activityLogger.log(
        "UPDATE_EMPLOYEE",
        `Funcionário atualizado: ${currentEmployee.name} - ${currentEmployee.email}`,
        "FUNCIONARIOS",
      )
    } else {
      await authService.addEmployee(currentEmployee as Omit<User, "id" | "createdAt">)
      activityLogger.log(
        "CREATE_EMPLOYEE",
        `Novo funcionário criado: ${currentEmployee.name} - ${currentEmployee.email}`,
        "FUNCIONARIOS",
      )
    }

    await loadEmployees()
    setIsEmployeeDialogOpen(false)
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

  const selectedMetrics = mockMetrics[selectedEmployee] || mockMetrics.func1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Funcionários</h1>
          <p className="text-muted-foreground">Gerencie funcionários e visualize métricas de desempenho</p>
        </div>
      </div>

      <Tabs defaultValue="lista" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lista">Lista de Funcionários</TabsTrigger>
          <TabsTrigger value="metricas">Métricas de Desempenho</TabsTrigger>
        </TabsList>

        <TabsContent value="lista">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gerenciar Funcionários</CardTitle>
                <CardDescription>
                  Cadastre e gerencie os funcionários da oficina. Total: {employees.length} funcionário(s)
                  cadastrado(s).
                </CardDescription>
              </div>
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
                      <TableHead>Usuário</TableHead>
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
                          <TableCell>{employee.username}</TableCell>
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
                        <TableCell colSpan={6} className="text-center">
                          Nenhum funcionário encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metricas">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar de seleção de funcionário */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Selecionar Funcionário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {employees.map((employee) => (
                    <Button
                      key={employee.id}
                      variant={selectedEmployee === employee.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedEmployee(employee.id)}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      {employee.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Métricas principais */}
            <div className="lg:col-span-3 space-y-6">
              {/* Cards de resumo */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Atendimentos</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedMetrics.atendimentos}</div>
                    <p className="text-xs text-muted-foreground">Total no período</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Serviços</CardTitle>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedMetrics.servicos}</div>
                    <p className="text-xs text-muted-foreground">Serviços executados</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedMetrics.orcamentos}</div>
                    <p className="text-xs text-muted-foreground">Orçamentos criados</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Valor Gerado</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ {selectedMetrics.valorGerado.toLocaleString("pt-BR")}</div>
                    <p className="text-xs text-muted-foreground">Receita total</p>
                  </CardContent>
                </Card>
              </div>

              {/* Indicadores de desempenho */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl font-bold">{selectedMetrics.satisfacao}</div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= selectedMetrics.satisfacao ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Avaliação média dos clientes</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Eficiência</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedMetrics.eficiencia}%</div>
                    <p className="text-xs text-muted-foreground">Taxa de conclusão no prazo</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedMetrics.tempoMedio}min</div>
                    <p className="text-xs text-muted-foreground">Por serviço executado</p>
                  </CardContent>
                </Card>
              </div>

              {/* Histórico mensal */}
              <Card>
                <CardHeader>
                  <CardTitle>Histórico Mensal</CardTitle>
                  <CardDescription>Evolução de atendimentos, serviços e orçamentos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedMetrics.historico.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="font-medium">{item.mes}</div>
                        <div className="flex space-x-4 text-sm">
                          <span className="text-blue-600">{item.atendimentos} atendimentos</span>
                          <span className="text-green-600">{item.servicos} serviços</span>
                          <span className="text-orange-600">{item.orcamentos} orçamentos</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Últimos serviços */}
              <Card>
                <CardHeader>
                  <CardTitle>Últimos Serviços</CardTitle>
                  <CardDescription>Serviços mais recentes realizados pelo funcionário</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Veículo</TableHead>
                          <TableHead>Serviço</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedMetrics.ultimosServicos.map((servico) => (
                          <TableRow key={servico.id}>
                            <TableCell className="font-medium">{servico.cliente}</TableCell>
                            <TableCell>{servico.veiculo}</TableCell>
                            <TableCell>{servico.servico}</TableCell>
                            <TableCell>{new Date(servico.data).toLocaleDateString("pt-BR")}</TableCell>
                            <TableCell className="text-right">R$ {servico.valor.toLocaleString("pt-BR")}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para funcionários */}
      <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
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
              <Label htmlFor="username">Usuário *</Label>
              <Input
                id="username"
                value={currentEmployee.username || ""}
                onChange={(e) => setCurrentEmployee({ ...currentEmployee, username: e.target.value })}
                placeholder="Nome de usuário para login"
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
            <Button variant="outline" onClick={() => setIsEmployeeDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEmployee}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
