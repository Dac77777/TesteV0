"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Database,
  CheckCircle,
  XCircle,
  RefreshCw,
  UserCheck,
  UserX,
  Plus,
  Edit,
  Trash,
  Search,
  Shield,
  Building,
  Palette,
  Save,
  AlertCircle,
  RefreshCcw,
} from "lucide-react"
import { authService } from "@/lib/auth"
import { activityLogger } from "@/lib/activity-logger"
import { useAppContext } from "@/contexts/app-context"
import type { User } from "@/types/user"
import { GoogleSheetsConfig } from "@/components/admin/google-sheets-config"; // Importar o novo componente

export default function AdminConfiguracoesPage() {
  const [isConnected, setIsConnected] = useState(false) // Este estado pode ser removido se GoogleSheetsConfig gerenciar o status
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState("2023-06-01 14:30:00")
  const [autoSync, setAutoSync] = useState(true)
  const [syncInterval, setSyncInterval] = useState(5)

  // Usar o contexto para obter e atualizar as configurações
  const { 
    companySettings, 
    updateCompanySettings, 
    adminCredentials, 
    updateAdminCredentials,
    refreshSettings,
    isLoading 
  } = useAppContext()

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

  // Company settings form state
  const [companyForm, setCompanyForm] = useState({ ...companySettings })

  // Admin credentials
  const [adminForm, setAdminForm] = useState({
    currentUsername: adminCredentials.username,
    currentPassword: "",
    newUsername: "",
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

  // Estados para feedback
  const [saveMessage, setSaveMessage] = useState("")
  const [saveError, setSaveError] = useState("")

  // Atualizar formulários quando as configurações mudarem
  useEffect(() => {
    setCompanyForm({ ...companySettings })
  }, [companySettings])

  useEffect(() => {
    setAdminForm(prev => ({
      ...prev,
      currentUsername: adminCredentials.username,
    }))
  }, [adminCredentials])

  useEffect(() => {
    loadSettings()
    loadEmployees()
  }, [])

  const loadSettings = async () => {
    // Forçar atualização das configurações do contexto
    await refreshSettings()
    
    // Load settings from localStorage
    const savedSheetsConfig = localStorage.getItem("sheetsConfig")

    if (savedSheetsConfig) {
      setSheetsConfig(JSON.parse(savedSheetsConfig))
      if (JSON.parse(savedSheetsConfig).spreadsheetId) {
        setIsConnected(true)
      }
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

  const handleSaveCompanySettings = async () => {
    try {
      // Usar o método do contexto para atualizar as configurações
      const success = await updateCompanySettings(companyForm)
      
      if (success) {
        setSaveMessage("Configurações da empresa salvas com sucesso!")
        setSaveError("")

        activityLogger.log(
          "UPDATE_COMPANY_SETTINGS",
          `Configurações da empresa atualizadas: ${companyForm.name}`,
          "CONFIGURACOES",
        )

        setTimeout(() => setSaveMessage(""), 3000)
      } else {
        setSaveError("Erro ao salvar configurações da empresa")
        setTimeout(() => setSaveError(""), 3000)
      }
    } catch (error) {
      setSaveError("Erro ao salvar configurações da empresa")
      setTimeout(() => setSaveError(""), 3000)
    }
  }

  const handleUpdateAdminCredentials = async () => {
    if (!adminForm.currentPassword) {
      setSaveError("Digite a senha atual para confirmar as alterações")
      setTimeout(() => setSaveError(""), 3000)
      return
    }

    // Verificar se a senha atual está correta
    const currentCreds = authService.getAdminCredentials()

    if (adminForm.currentPassword !== currentCreds.password) {
      setSaveError("Senha atual incorreta!")
      setTimeout(() => setSaveError(""), 3000)
      return
    }

    // Validar novo usuário se fornecido
    if (adminForm.newUsername && adminForm.newUsername.length < 3) {
      setSaveError("O novo nome de usuário deve ter pelo menos 3 caracteres!")
      setTimeout(() => setSaveError(""), 3000)
      return
    }

    // Validar nova senha se fornecida
    if (adminForm.newPassword) {
      if (adminForm.newPassword.length < 6) {
        setSaveError("A nova senha deve ter pelo menos 6 caracteres!")
        setTimeout(() => setSaveError(""), 3000)
        return
      }

      if (adminForm.newPassword !== adminForm.confirmPassword) {
        setSaveError("As senhas não coincidem!")
        setTimeout(() => setSaveError(""), 3000)
        return
      }
    }

    try {
      const newUsername = adminForm.newUsername || adminForm.currentUsername
      const newPassword = adminForm.newPassword || adminForm.currentPassword

      // Usar o método do contexto para atualizar as credenciais
      const success = await updateAdminCredentials(newUsername, newPassword)

      if (success) {
        // Salvar timestamp da última alteração
        localStorage.setItem("lastCredentialUpdate", new Date().toISOString())

        setAdminForm({
          currentUsername: newUsername,
          currentPassword: "",
          newUsername: "",
          newPassword: "",
          confirmPassword: "",
        })

        setSaveMessage(
          `Credenciais atualizadas com sucesso! ${adminForm.newUsername ? `Novo usuário: ${newUsername}` : ""}`,
        )
        setSaveError("")

        activityLogger.log("UPDATE_ADMIN_CREDENTIALS", `Credenciais atualizadas - Usuário: ${newUsername}`, "SISTEMA")

        setTimeout(() => setSaveMessage(""), 5000)
      } else {
        setSaveError("Erro ao atualizar credenciais!")
        setTimeout(() => setSaveError(""), 3000)
      }
    } catch (error) {
      setSaveError("Erro ao atualizar credenciais!")
      setTimeout(() => setSaveError(""), 3000)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
        </div>
        <Button variant="outline" onClick={loadSettings}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Mensagens de feedback */}
      {saveMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{saveMessage}</AlertDescription>
        </Alert>
      )}

      {saveError && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="empresa" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="funcionarios">Funcionários</TabsTrigger>
          <TabsTrigger value="sheets">Google Sheets</TabsTrigger>
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Conteúdo da Aba Empresa */}
        <TabsContent value="empresa">
          <div className="space-y-6">
            {/* Configurações da Empresa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informações da Empresa
                </CardTitle>
                <CardDescription>Configure as informações da sua oficina que aparecerão no sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="companyName">Nome da Oficina *</Label>
                    <Input
                      id="companyName"
                      value={companyForm.name}
                      onChange={(e) =>
                        setCompanyForm({
                          ...companyForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="Ex: Oficina do João"
                    />
                    <p className="text-xs text-muted-foreground">Este nome aparecerá no login e navegação</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={companyForm.cnpj}
                      onChange={(e) =>
                        setCompanyForm({
                          ...companyForm,
                          cnpj: e.target.value,
                        })
                      }
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Input
                    id="address"
                    value={companyForm.address}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        address: e.target.value,
                      })
                    }
                    placeholder="Rua, número, bairro, cidade - CEP"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={companyForm.phone}
                      onChange={(e) =>
                        setCompanyForm({
                          ...companyForm,
                          phone: e.target.value,
                        })
                      }
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={companyForm.email}
                      onChange={(e) =>
                        setCompanyForm({
                          ...companyForm,
                          email: e.target.value,
                        })
                      }
                      placeholder="contato@oficina.com"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveCompanySettings}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações da Empresa
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Personalização Visual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Personalização Visual
                </CardTitle>
                <CardDescription>Customize a aparência do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="primaryColor">Cor Primária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={companyForm.primaryColor}
                        onChange={(e) =>
                          setCompanyForm({
                            ...companyForm,
                            primaryColor: e.target.value,
                          })
                        }
                        className="w-16 h-10"
                      />
                      <Input
                        value={companyForm.primaryColor}
                        onChange={(e) =>
                          setCompanyForm({
                            ...companyForm,
                            primaryColor: e.target.value,
                          })
                        }
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="secondaryColor">Cor Secundária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={companyForm.secondaryColor}
                        onChange={(e) =>
                          setCompanyForm({
                            ...companyForm,
                            secondaryColor: e.target.value,
                          })
                        }
                        className="w-16 h-10"
                      />
                      <Input
                        value={companyForm.secondaryColor}
                        onChange={(e) =>
                          setCompanyForm({
                            ...companyForm,
                            secondaryColor: e.target.value,
                          })
                        }
                        placeholder="#64748b"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="logo">URL do Logo (opcional)</Label>
                  <Input
                    id="logo"
                    value={companyForm.logo}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        logo: e.target.value,
                      })
                    }
                    placeholder="https://exemplo.com/logo.png"
                  />
                  <p className="text-xs text-muted-foreground">Deixe em branco para usar o ícone padrão</p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveCompanySettings}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Personalização
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Credenciais do Administrador
              </CardTitle>
              <CardDescription>Altere seu nome de usuário e senha de acesso ao sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informações atuais */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Credenciais Atuais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Usuário atual:</span>
                    <p className="font-medium">{adminForm.currentUsername}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Última alteração:</span>
                    <p className="font-medium">
                      {localStorage.getItem("lastCredentialUpdate")
                        ? new Date(localStorage.getItem("lastCredentialUpdate")!).toLocaleDateString("pt-BR")
                        : "Nunca alterado"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Formulário de alteração */}
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="currentPassword">Senha Atual *</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={adminForm.currentPassword}
                    onChange={(e) => setAdminForm({ ...adminForm, currentPassword: e.target.value })}
                    placeholder="Digite sua senha atual para confirmar alterações"
                  />
                  <p className="text-xs text-muted-foreground">
                    Obrigatório para confirmar qualquer alteração de credenciais
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="newUsername">Novo Nome de Usuário</Label>
                  <Input
                    id="newUsername"
                    value={adminForm.newUsername}
                    onChange={(e) => setAdminForm({ ...adminForm, newUsername: e.target.value })}
                    placeholder={`Atual: ${adminForm.currentUsername}`}
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco para manter o usuário atual. Mínimo 3 caracteres.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={adminForm.newPassword}
                    onChange={(e) => setAdminForm({ ...adminForm, newPassword: e.target.value })}
                    placeholder="Deixe em branco para manter a senha atual"
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco para manter a senha atual. Mínimo 6 caracteres.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={adminForm.confirmPassword}
                    onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })}
                    placeholder="Repita a nova senha"
                    disabled={!adminForm.newPassword}
                  />
                  <p className="text-xs text-muted-foreground">Obrigatório apenas se você estiver alterando a senha</p>
                </div>

                {/* Validações visuais */}
                {adminForm.newUsername && adminForm.newUsername.length < 3 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>O nome de usuário deve ter pelo menos 3 caracteres</AlertDescription>
                  </Alert>
                )}

                {adminForm.newPassword && adminForm.newPassword.length < 6 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>A senha deve ter pelo menos 6 caracteres</AlertDescription>
                  </Alert>
                )}

                {adminForm.newPassword &&
                  adminForm.confirmPassword &&
                  adminForm.newPassword !== adminForm.confirmPassword && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>As senhas não coincidem</AlertDescription>
                    </Alert>
                  )}

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleUpdateAdminCredentials}
                    disabled={
                      !adminForm.currentPassword ||
                      (adminForm.newUsername && adminForm.newUsername.length < 3) ||
                      (adminForm.newPassword && adminForm.newPassword.length < 6) ||
                      (adminForm.newPassword &&
                        adminForm.newPassword !== adminForm.confirmPassword)
                    }
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Atualizar Credenciais
                  </Button>
                </div>
              </div>

              {/* Dicas de segurança */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 Dicas de Segurança</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use uma senha forte com pelo menos 8 caracteres</li>
                  <li>• Combine letras maiúsculas, minúsculas, números e símbolos</li>
                  <li>• Não use informações pessoais óbvias</li>
                  <li>• Altere suas credenciais regularmente</li>
                  <li>• Mantenha suas credenciais em local seguro</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funcionarios">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gerenciar Funcionários</CardTitle>
                <CardDescription>
                  Gerencie os funcionários e suas credenciais de acesso. Total: {employees.length} funcionário(s)
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

        {/* Conteúdo da Aba Google Sheets */}
        <TabsContent value="sheets">
          <GoogleSheetsConfig />
        </TabsContent>

        {/* Conteúdo da Aba Dados */}
        <TabsContent value="dados">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Gerenciamento de Dados
              </CardTitle>
              <CardDescription>Exporte ou importe dados do sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={handleExportData} variant="outline">
                  Exportar Dados
                </Button>
                <Button onClick={handleImportData} variant="outline">
                  Importar Dados (Substituir)
                </Button>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  A importação de dados substituirá todos os dados existentes. Faça um backup antes de prosseguir.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conteúdo da Aba Logs */}
        <TabsContent value="logs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Logs de Atividade</CardTitle>
                <CardDescription>Visualize os logs de atividade do sistema.</CardDescription>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                  className="border p-2 rounded text-sm"
                >
                  <option value="all">Todos os Módulos</option>
                  {uniqueModules.map((mod) => (
                    <option key={mod} value={mod}>
                      {mod}
                    </option>
                  ))}
                </select>
                <Button onClick={handleClearLogs} variant="destructive">
                  Limpar Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Módulo</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {new Date(log.timestamp).toLocaleString("pt-BR", {
                              dateStyle: "short",
                              timeStyle: "medium",
                            })}
                          </TableCell>
                          <TableCell>{getActionBadge(log.action)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{log.module}</Badge>
                          </TableCell>
                          <TableCell className="text-xs">{log.details}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          Nenhum log encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
