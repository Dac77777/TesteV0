"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
  BarChart3,
  Users,
  Wrench,
  FileText,
  Star,
  TrendingUp,
  Clock,
  DollarSign,
} from "lucide-react"
import { authService } from "@/lib/auth"
import { activityLogger } from "@/lib/activity-logger"
import type { User } from "@/types/user"

// Tipo para métricas de funcionário
interface EmployeeMetrics {
  id: string
  name: string
  atendimentos: number
  servicosRealizados: number
  orcamentosFeitos: number
  valorGerado: number
  tempoMedio: number // em minutos
  satisfacaoCliente: number // 0-5
  eficiencia: number // 0-100%
  historico: {
    mes: string
    atendimentos: number
    servicos: number
    orcamentos: number
    valor: number
  }[]
}

export default function FuncionariosPage() {
  const [employees, setEmployees] = useState<User[]>([])
  const [metrics, setMetrics] = useState<EmployeeMetrics[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false)
  const [currentEmployee, setCurrentEmployee] = useState<Partial<User>>({
    name: "",
    email: "",
    password: "",
    role: "funcionario",
    isActive: true,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)

  useEffect(() => {
    loadEmployees()
    loadMetrics()
  }, [])

  const loadEmployees = async () => {
    const employeesList = await authService.getEmployeesList()
    setEmployees(employeesList)

    // Se temos funcionários e nenhum selecionado, selecione o primeiro
    if (employeesList.length > 0 && !selectedEmployee) {
      setSelectedEmployee(employeesList[0].id)
    }
  }

  const loadMetrics = async () => {
    // Em um sistema real, isso viria da API
    // Aqui estamos gerando dados mock para demonstração
    const mockMetrics: EmployeeMetrics[] = employees.map((emp) => ({
      id: emp.id,
      name: emp.name,
      atendimentos: Math.floor(Math.random() * 100) + 20,
      servicosRealizados: Math.floor(Math.random() * 80) + 10,
      orcamentosFeitos: Math.floor(Math.random() * 50) + 5,
      valorGerado: Math.floor(Math.random() * 50000) + 5000,
      tempoMedio: Math.floor(Math.random() * 120) + 30,
      satisfacaoCliente: Math.random() * 2 + 3, // 3-5
      eficiencia: Math.floor(Math.random() * 30) + 70, // 70-100%
      historico: [
        {
          mes: "Jan",
          atendimentos: Math.floor(Math.random() * 20) + 5,
          servicos: Math.floor(Math.random() * 15) + 3,
          orcamentos: Math.floor(Math.random() * 10) + 2,
          valor: Math.floor(Math.random() * 8000) + 1000,
        },
        {
          mes: "Fev",
          atendimentos: Math.floor(Math.random() * 20) + 5,
          servicos: Math.floor(Math.random() * 15) + 3,
          orcamentos: Math.floor(Math.random() * 10) + 2,
          valor: Math.floor(Math.random() * 8000) + 1000,
        },
        {
          mes: "Mar",
          atendimentos: Math.floor(Math.random() * 20) + 5,
          servicos: Math.floor(Math.random() * 15) + 3,
          orcamentos: Math.floor(Math.random() * 10) + 2,
          valor: Math.floor(Math.random() * 8000) + 1000,
        },
        {
          mes: "Abr",
          atendimentos: Math.floor(Math.random() * 20) + 5,
          servicos: Math.floor(Math.random() * 15) + 3,
          orcamentos: Math.floor(Math.random() * 10) + 2,
          valor: Math.floor(Math.random() * 8000) + 1000,
        },
        {
          mes: "Mai",
          atendimentos: Math.floor(Math.random() * 20) + 5,
          servicos: Math.floor(Math.random() * 15) + 3,
          orcamentos: Math.floor(Math.random() * 10) + 2,
          valor: Math.floor(Math.random() * 8000) + 1000,
        },
        {
          mes: "Jun",
          atendimentos: Math.floor(Math.random() * 20) + 5,
          servicos: Math.floor(Math.random() * 15) + 3,
          orcamentos: Math.floor(Math.random() * 10) + 2,
          valor: Math.floor(Math.random() * 8000) + 1000,
        },
      ],
    }))

    setMetrics(mockMetrics)
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
    await loadMetrics()
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

  // Encontrar métricas do funcionário selecionado
  const selectedMetrics = metrics.find((m) => m.id === selectedEmployee)

  // Função para renderizar barras de progresso
  const renderProgressBar = (value: number, max: number, color: string) => {
    const percentage = (value / max) * 100
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Funcionários</h1>
          <p className="text-muted-foreground">Gerencie funcionários e visualize métricas de desempenho</p>
        </div>
        <Button onClick={handleAddEmployee}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Funcionário
        </Button>
      </div>

      <Tabs defaultValue="lista" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lista">Lista de Funcionários</TabsTrigger>
          <TabsTrigger value="metricas">Métricas de Desempenho</TabsTrigger>
        </TabsList>

        <TabsContent value="lista">
          <Card>
            <CardHeader>
              <CardTitle>Funcionários Cadastrados</CardTitle>
              <CardDescription>Total de {employees.length} funcionário(s) no sistema</CardDescription>
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
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Funcionários</CardTitle>
                <CardDescription>Selecione para ver métricas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className={`p-3 rounded-md cursor-pointer flex items-center justify-between ${
                        selectedEmployee === employee.id ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedEmployee(employee.id)}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-xs text-muted-foreground">{employee.email}</p>
                        </div>
                      </div>
                      {employee.isActive ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-800">
                          Inativo
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="md:col-span-3 space-y-4">
              {selectedMetrics ? (
                <>
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Atendimentos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{selectedMetrics.atendimentos}</div>
                        <p className="text-xs text-muted-foreground">Total de clientes atendidos</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Serviços</CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{selectedMetrics.servicosRealizados}</div>
                        <p className="text-xs text-muted-foreground">Serviços realizados</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{selectedMetrics.orcamentosFeitos}</div>
                        <p className="text-xs text-muted-foreground">Orçamentos elaborados</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor Gerado</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">R$ {selectedMetrics.valorGerado.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total em serviços</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Indicadores de Desempenho</CardTitle>
                        <CardDescription>Métricas de qualidade e eficiência</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Satisfação do Cliente</Label>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className="font-medium">{selectedMetrics.satisfacaoCliente.toFixed(1)}/5</span>
                            </div>
                          </div>
                          {renderProgressBar(selectedMetrics.satisfacaoCliente, 5, "bg-yellow-500")}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Eficiência</Label>
                            <div className="flex items-center">
                              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                              <span className="font-medium">{selectedMetrics.eficiencia}%</span>
                            </div>
                          </div>
                          {renderProgressBar(selectedMetrics.eficiencia, 100, "bg-green-500")}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Tempo Médio de Serviço</Label>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-blue-500 mr-1" />
                              <span className="font-medium">{selectedMetrics.tempoMedio} min</span>
                            </div>
                          </div>
                          {renderProgressBar(120 - selectedMetrics.tempoMedio, 120, "bg-blue-500")}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Histórico Mensal</CardTitle>
                        <CardDescription>Desempenho nos últimos 6 meses</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[220px] flex items-end justify-between gap-2">
                          {selectedMetrics.historico.map((mes, index) => (
                            <div key={index} className="flex flex-col items-center gap-1 w-full">
                              <div className="w-full flex justify-center gap-1 h-[180px] items-end">
                                <div
                                  className="w-2 bg-blue-500 rounded-t"
                                  style={{ height: `${(mes.atendimentos / 20) * 100}%` }}
                                  title={`${mes.atendimentos} atendimentos`}
                                ></div>
                                <div
                                  className="w-2 bg-green-500 rounded-t"
                                  style={{ height: `${(mes.servicos / 15) * 100}%` }}
                                  title={`${mes.servicos} serviços`}
                                ></div>
                                <div
                                  className="w-2 bg-amber-500 rounded-t"
                                  style={{ height: `${(mes.orcamentos / 10) * 100}%` }}
                                  title={`${mes.orcamentos} orçamentos`}
                                ></div>
                              </div>
                              <span className="text-xs text-muted-foreground">{mes.mes}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-center mt-2 gap-4">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <span className="text-xs">Atendimentos</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span className="text-xs">Serviços</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-amber-500 rounded"></div>
                            <span className="text-xs">Orçamentos</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Últimos Serviços Realizados</CardTitle>
                      <CardDescription>Serviços mais recentes deste funcionário</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Serviço</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            {
                              data: "15/06/2023",
                              cliente: "João Silva",
                              servico: "Troca de óleo",
                              valor: 150,
                              status: "Concluído",
                            },
                            {
                              data: "12/06/2023",
                              cliente: "Maria Oliveira",
                              servico: "Revisão completa",
                              valor: 450,
                              status: "Concluído",
                            },
                            {
                              data: "10/06/2023",
                              cliente: "Carlos Santos",
                              servico: "Troca de pastilhas",
                              valor: 280,
                              status: "Concluído",
                            },
                            {
                              data: "05/06/2023",
                              cliente: "Ana Costa",
                              servico: "Alinhamento",
                              valor: 120,
                              status: "Concluído",
                            },
                            {
                              data: "01/06/2023",
                              cliente: "Pedro Lima",
                              servico: "Diagnóstico",
                              valor: 100,
                              status: "Concluído",
                            },
                          ].map((servico, index) => (
                            <TableRow key={index}>
                              <TableCell>{servico.data}</TableCell>
                              <TableCell>{servico.cliente}</TableCell>
                              <TableCell>{servico.servico}</TableCell>
                              <TableCell>R$ {servico.valor.toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                  {servico.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Selecione um funcionário</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-md mt-2">
                      Escolha um funcionário na lista à esquerda para visualizar suas métricas de desempenho e histórico
                      de atividades.
                    </p>
                  </CardContent>
                </Card>
              )}
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
