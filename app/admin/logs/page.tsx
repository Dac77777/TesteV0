"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Trash2, Download } from "lucide-react"
import { activityLogger } from "@/lib/activity-logger"

export default function AdminLogsPage() {
  const [logs, setLogs] = useState(activityLogger.getLogs())
  const [searchTerm, setSearchTerm] = useState("")
  const [filterModule, setFilterModule] = useState("all")
  const [filterUser, setFilterUser] = useState("all")

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesModule = filterModule === "all" || log.module === filterModule
    const matchesUser = filterUser === "all" || log.userId === filterUser

    return matchesSearch && matchesModule && matchesUser
  })

  const uniqueModules = [...new Set(logs.map((log) => log.module))]
  const uniqueUsers = [...new Set(logs.map((log) => ({ id: log.userId, name: log.userName })))]

  const handleClearLogs = () => {
    if (confirm("Tem certeza que deseja limpar todos os logs? Esta ação não pode ser desfeita.")) {
      activityLogger.clearLogs()
      setLogs([])
    }
  }

  const handleExportLogs = () => {
    const csvContent = [
      ["Data/Hora", "Usuário", "Ação", "Detalhes", "Módulo"],
      ...filteredLogs.map((log) => [
        new Date(log.timestamp).toLocaleString("pt-BR"),
        log.userName,
        log.action,
        log.details,
        log.module,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `logs_atividade_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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

  const getModuleBadge = (module: string) => {
    const moduleColors = {
      CLIENTES: "bg-blue-100 text-blue-800",
      VEICULOS: "bg-green-100 text-green-800",
      SERVICOS: "bg-amber-100 text-amber-800",
      ESTOQUE: "bg-purple-100 text-purple-800",
      FUNCIONARIOS: "bg-red-100 text-red-800",
      SISTEMA: "bg-gray-100 text-gray-800",
    }

    const colorClass = moduleColors[module] || "bg-gray-100 text-gray-800"

    return (
      <Badge variant="outline" className={colorClass}>
        {module}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Logs de Atividade</CardTitle>
              <CardDescription>
                Acompanhe todas as ações realizadas no sistema ({logs.length} registros)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportLogs}>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button variant="destructive" onClick={handleClearLogs}>
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar Logs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar nos logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Módulo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Módulos</SelectItem>
                {uniqueModules.map((module) => (
                  <SelectItem key={module} value={module}>
                    {module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Usuários</SelectItem>
                {uniqueUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>Módulo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {new Date(log.timestamp).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell className="font-medium">{log.userName}</TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell className="max-w-md truncate" title={log.details}>
                        {log.details}
                      </TableCell>
                      <TableCell>{getModuleBadge(log.module)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Nenhum log encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
