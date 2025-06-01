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
import {
  Settings,
  Database,
  FolderSyncIcon as Sync,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Upload,
} from "lucide-react"

export default function ConfiguracoesPage() {
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
    // Simulate data export
    alert("Dados exportados com sucesso!")
  }

  const handleImportData = () => {
    // Simulate data import
    alert("Dados importados com sucesso!")
  }

  const handleSaveSettings = () => {
    // Save settings to localStorage or API
    localStorage.setItem("companySettings", JSON.stringify(companySettings))
    localStorage.setItem("sheetsConfig", JSON.stringify(sheetsConfig))
    alert("Configurações salvas com sucesso!")
  }

  useEffect(() => {
    // Load settings from localStorage
    const savedCompanySettings = localStorage.getItem("companySettings")
    const savedSheetsConfig = localStorage.getItem("sheetsConfig")

    if (savedCompanySettings) {
      setCompanySettings(JSON.parse(savedCompanySettings))
    }

    if (savedSheetsConfig) {
      setSheetsConfig(JSON.parse(savedSheetsConfig))
      if (JSON.parse(savedSheetsConfig).spreadsheetId) {
        setIsConnected(true)
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
        </div>
      </div>

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
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>
          <Settings className="mr-2 h-4 w-4" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  )
}
