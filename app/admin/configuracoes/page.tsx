"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
  Settings,
  Database,
  FolderSyncIcon as Sync,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Upload,
  UserCheck,
  UserX,
  Plus,
  Edit,
  Trash,
  Search,
  Activity,
  Shield,
} from "lucide-react"
import { authService } from "@/lib/auth"
import { activityLogger } from "@/lib/activity-logger"
import type { User } from "@/types/user"

export default function AdminConfiguracoesPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState("2023-06-01 14:30:00")
  const [autoSync, setAutoSync] = useState(true)
  const [syncInterval, setSyncInterval] = useState(5)

  // Google Sheets configuration
  const [sheetsConfig, setSheetsConfig] = useState({
    spreadsheetId: "",
    serviceAccountKey: "",
    worksheetNames: {
      clients: "Clientes",
      vehicles: "Veículos",
      services: "Serviços",
      stock: "Estoque",
      quotes: "Orçamentos",
      appointments: "Agendamentos",
      employees: "Funcionários",
      admin: "Admin",
    },
  })

  // Company settings
  const [companySettings, setCompanySettings] = useState({
    name: "Oficina do João",
    address: "Rua das Flores, 123",
    phone: "(11) 99999-9999",
    email: "contato@oficina.com",
    cnpj: "12.345.678/0001-90",
  })

  // Admin credentials
  const [adminCredentials, setAdminCredentials] = useState({
    username: "admin",
    password: "admin123",
    newPassword: "",
    confirmPassword: "",
  })

  // Funcionários
  const [employees, setEmployees] = useState<User[]>([])
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

  // Logs
  const [logs, setLogs] = useState(activityLogger.getLogs())
  const [filterModule, setFilterModule] = useState("all")

  useEffect(() => {
    loadSettings()
    loadEmployees()
  }, [])

  const loadSettings = () => {
    // Load settings from localStorage
    const savedCompanySettings = localStorage.getItem("companySettings")
    const savedSheetsConfig = localStorage.getItem("sheetsConfig")
    const savedAdminCredentials = localStorage.getItem("adminCredentials")

    if (savedCompanySettings) {
      setCompanySettings(JSON.parse(savedCompanySettings))
    }

    if (savedSheetsConfig) {
      setSheetsConfig(JSON.parse(savedSheetsConfig))
      if (JSON.parse(savedSheetsConfig).spreadsheetId) {
        setIsConnected(true)
      }
    }

    if (savedAdminCredentials) {
      const creds = JSON.parse(savedAdminCredentials)
      setAdminCredentials({ ...adminCredentials, username: creds.username, password: creds.password })
    }
  }

  const loadEmployees = async () => {
    const employeesList = await authService.getEmployeesList()
    setEmployees(employeesList)
  }

  const handleConnectSheets = async () => {
    setIsSyncing(true)
    // Simulate connection process
    setTimeout(() => {
      setIsConnected(true)
      setIsSyncing(false)
      setLastSync(new Date().toLocaleString("pt-BR"))
    }, 2000)
  }

  const handleDisconnectSheets = () => {
    setIsConnected(false)
    setSheetsConfig({
      ...sheetsConfig,
      spreadsheetId: "",
      serviceAccountKey: "",
    })
  }

  const handleSyncNow = async () => {
    setIsSyncing(true)
    // Simulate sync process
    setTimeout(() => {
      setIsSyncing(false)
      setLastSync(new Date().toLocaleString("pt-BR"))
    }, 3000)
  }

  const handleExportData = () => {
    alert("Dados exportados com sucesso!")
  }

  const handleImportData = () => {
    alert("Dados importados com sucesso!")
  }

  const handleSaveSettings = () => {
    localStorage.setItem("companySettings", JSON.stringify(companySettings))
    localStorage.setItem("sheetsConfig", JSON.stringify(sheetsConfig))
    alert("Configurações salvas com sucesso!")
  }

  const handleUpdateAdminCredentials = async () => {
    if (adminCredentials.newPassword !== adminCredentials.confirmPassword) {
      alert("As senhas não coincidem!")
      return
    }

    if (adminCredentials.newPassword.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres!")
      return
    }

    const success = await authService.updateAdminCredentials(adminCredentials.username, adminCredentials.newPassword)
    if (success) {
      setAdminCredentials({
        ...adminCredentials,
        password: adminCredentials.newPassword,
        newPassword: "",
        confirmPassword: "",
      })
      alert("Credenciais atualizadas com sucesso!")
      activityLogger.log("UPDATE_ADMIN_CREDENTIALS", "Credenciais do administrador atualizadas", "SISTEMA")
    } else {
      alert("Erro ao atualizar credenciais!")
    }
  }

  // Funcionários
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

  // Logs
  const filteredLogs = logs.filter((log) => {
    const matchesModule = filterModule === "all" || log.module === filterModule
    return matchesModule
  })

  const uniqueModules = [...new Set(logs.map((log) => log.module))]

  const handleClearLogs = () => {
    if (confirm("Tem certeza que deseja limpar todos os logs? Esta ação não pode ser desfeita.")) {
      activityLogger.clearLogs()
      setLogs([])
    }
  }

  const getActionBadge = (action: string) => {
    const actionColors = {
      CREATE: "bg-green-100 text-green-800",
      UPDATE: "bg-blue-100 text-blue-800",
      DELETE: "bg-red-100 text-red-800",
      LOGIN: "bg-purple-100 text-purple-800",
      LOGOUT: "bg-gray-100 text-gray-800",
    }

    const baseAction = action.split("_")[0]
    const colorClass = actionColors[baseAction] || "bg-gray-100 text-gray-800"

    return (
      <Badge variant="outline" className={colorClass}>
        {action.replace(/_/g, " ")}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
        </div>
      </div>

      <Tabs defaultValue="geral" className="space-y-4">
        <TabsList>
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="sheets">Google Sheets</TabsTrigger>
          <TabsTrigger value="funcionarios">Funcionários</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="geral">
          <div className="space-y-6">
            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Gerenciamento de Dados
                </CardTitle>
                <CardDescription>Importe e exporte dados do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Dados
                  </Button>
                  <Button variant="outline" onClick={handleImportData}>
                    <Upload className="mr-2 h-4 w-4" />
                    Importar Dados
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Exporte seus dados para backup ou importe dados de outros sistemas
                </p>
              </CardContent>
            </Card>

            {/* Company Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Dados da Empresa
                </CardTitle>
                <CardDescription>Configure as informações da sua oficina</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="companyName">Nome da Empresa</Label>
                    <Input
                      id="companyName"
                      value={companySettings.name}
                      onChange={(e) =>
                        setCompanySettings({
                          ...companySettings,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={companySettings.cnpj}
                      onChange={(e) =>
                        setCompanySettings({
                          ...companySettings,
                          cnpj: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={companySettings.address}
                    onChange={(e) =>
                      setCompanySettings({
                        ...companySettings,
                        address: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={companySettings.phone}
                      onChange={(e) =>
                        setCompanySettings({
                          ...companySettings,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={companySettings.email}
                      onChange={(e) =>
                        setCompanySettings({
                          ...companySettings,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings}>
                    <Settings className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sheets">
          {/* Google Sheets Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Integração Google Sheets
              </CardTitle>
              <CardDescription>Configure a sincronização automática com Google Sheets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>Status da Conexão:</span>
                  {isConnected ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Conectado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                      <XCircle className="mr-1 h-3 w-3" />
                      Desconectado
                    </Badge>
                  )}
                </div>
                {isConnected && <div className="text-sm text-muted-foreground">Última sincronização: {lastSync}</div>}
              </div>

              {!isConnected ? (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="spreadsheetId">ID da Planilha</Label>
                    <Input
                      id="spreadsheetId"
                      placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                      value={sheetsConfig.spreadsheetId}
                      onChange={(e) =>
                        setSheetsConfig({
                          ...sheetsConfig,
                          spreadsheetId: e.target.value,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">Encontre o ID na URL da sua planilha Google Sheets</p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="serviceAccountKey">Chave da Conta de Serviço (JSON)</Label>
                    <Textarea
                      id="serviceAccountKey"
                      placeholder='{"type": "service_account", "project_id": "..."}'
                      value={sheetsConfig.serviceAccountKey}
                      onChange={(e) =>
                        setSheetsConfig({
                          ...sheetsConfig,
                          serviceAccountKey: e.target.value,
                        })
                      }
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Cole aqui o conteúdo do arquivo JSON da conta de serviço
                    </p>
                  </div>

                  <Button
                    onClick={handleConnectSheets}
                    disabled={!sheetsConfig.spreadsheetId || !sheetsConfig.serviceAccountKey || isSyncing}
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <Database className="mr-2 h-4 w-4" />
                        Conectar ao Google Sheets
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Conectado com sucesso!</AlertTitle>
                    <AlertDescription>
                      Seus dados estão sendo sincronizados automaticamente com o Google Sheets.
                    </AlertDescription>
                  </Alert>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch id="autoSync" checked={autoSync} onCheckedChange={setAutoSync} />
                      <Label htmlFor="autoSync">Sincronização Automática</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleSyncNow} disabled={isSyncing}>
                        {isSyncing ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Sincronizando...
                          </>
                        ) : (
                          <>
                            <Sync className="mr-2 h-4 w-4" />
                            Sincronizar Agora
                          </>
                        )}
                      </Button>
                      <Button variant="destructive" onClick={handleDisconnectSheets}>
                        Desconectar
                      </Button>
                    </div>
                  </div>

                  {autoSync && (
                    <div className="grid gap-2">
                      <Label htmlFor="syncInterval">Intervalo de Sincronização (minutos)</Label>
                      <Input
                        id="syncInterval"
                        type="number"
                        min="1"
                        max="60"
                        value={syncInterval}
                        onChange={(e) => setSyncInterval(Number.parseInt(e.target.value) || 5)}
                      />
                    </div>
                  )}

                  <div className="grid gap-4">
                    <h4 className="font-medium">Nomes das Planilhas</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Clientes</Label>
                        <Input
                          value={sheetsConfig.worksheetNames.clients}
                          onChange={(e) =>
                            setSheetsConfig({
                              ...sheetsConfig,
                              worksheetNames: {
                                ...sheetsConfig.worksheetNames,
                                clients: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Veículos</Label>
                        <Input
                          value={sheetsConfig.worksheetNames.vehicles}
                          onChange={(e) =>
                            setSheetsConfig({
                              ...sheetsConfig,
                              worksheetNames: {
                                ...sheetsConfig.worksheetNames,
                                vehicles: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Serviços</Label>
                        <Input
                          value={sheetsConfig.worksheetNames.services}
                          onChange={(e) =>
                            setSheetsConfig({
                              ...sheetsConfig,
                              worksheetNames: {
                                ...sheetsConfig.worksheetNames,
                                services: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Estoque</Label>
                        <Input
                          value={sheetsConfig.worksheetNames.stock}
                          onChange={(e) =>
                            setSheetsConfig({
                              ...sheetsConfig,
                              worksheetNames: {
                                ...sheetsConfig.worksheetNames,
                                stock: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Orçamentos</Label>
                        <Input
                          value={sheetsConfig.worksheetNames.quotes}
                          onChange={(e) =>
                            setSheetsConfig({
                              ...sheetsConfig,
                              worksheetNames: {
                                ...sheetsConfig.worksheetNames,
                                quotes: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Agendamentos</Label>
                        <Input
                          value={sheetsConfig.worksheetNames.appointments}
                          onChange={(e) =>
                            setSheetsConfig({
                              ...sheetsConfig,
                              worksheetNames: {
                                ...sheetsConfig.worksheetNames,
                                appointments: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Admin</Label>
                        <Input
                          value={sheetsConfig.worksheetNames.admin}
                          onChange={(e) =>
                            setSheetsConfig({
                              ...sheetsConfig,
                              worksheetNames: {
                                ...sheetsConfig.worksheetNames,
                                admin: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Funcionários</Label>
                        <Input
                          value={sheetsConfig.worksheetNames.employees}
                          onChange={(e) =>
                            setSheetsConfig({
                              ...sheetsConfig,
                              worksheetNames: {
                                ...sheetsConfig.worksheetNames,
                                employees: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funcionarios">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gerenciar Funcionários</CardTitle>
                <CardDescription>
                  Gerencie os funcionários e suas credenciais de acesso. Os dados são sincronizados com o Google Sheets.
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
        </TabsContent>

        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Credenciais do Administrador
              </CardTitle>
              <CardDescription>Altere suas credenciais de acesso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="adminUsername">Nome de Usuário</Label>
                <Input
                  id="adminUsername"
                  value={adminCredentials.username}
                  onChange={(e) => setAdminCredentials({ ...adminCredentials, username: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={adminCredentials.newPassword}
                  onChange={(e) => setAdminCredentials({ ...adminCredentials, newPassword: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={adminCredentials.confirmPassword}
                  onChange={(e) => setAdminCredentials({ ...adminCredentials, confirmPassword: e.target.value })}
                />
              </div>
              <Button onClick={handleUpdateAdminCredentials}>
                <Shield className="mr-2 h-4 w-4" />
                Atualizar Credenciais
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Logs de Atividade
                  </CardTitle>
                  <CardDescription>
                    Acompanhe todas as ações realizadas no sistema ({logs.length} registros)
                  </CardDescription>
                </div>
                <Button variant="destructive" onClick={handleClearLogs}>
                  <Trash className="mr-2 h-4 w-4" />
                  Limpar Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="filterModule">Filtrar por Módulo</Label>
                <select
                  id="filterModule"
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                  className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">Todos os Módulos</option>
                  {uniqueModules.map((module) => (
                    <option key={module} value={module}>
                      {module}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-md border max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length > 0 ? (
                      filteredLogs.slice(0, 50).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">
                            {new Date(log.timestamp).toLocaleString("pt-BR")}
                          </TableCell>
                          <TableCell className="font-medium">{log.userName}</TableCell>
                          <TableCell>{getActionBadge(log.action)}</TableCell>
                          <TableCell className="max-w-md truncate" title={log.details}>
                            {log.details}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          Nenhum log encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {filteredLogs.length > 50 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Mostrando os 50 registros mais recentes de {filteredLogs.length} total
                </p>
              )}
            </CardContent>
          </Card>
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
