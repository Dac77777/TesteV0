"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { CalendarIcon, Clock, Plus, Edit, Trash, Search, Filter } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Agendamento {
  id: string
  clienteNome: string
  clientePhone: string
  servicoTipo: string
  servicoDescricao: string
  funcionario: string
  data: string
  horario: string
  status: "agendado" | "confirmado" | "em_andamento" | "concluido" | "cancelado"
  observacoes?: string
  valor?: number
  duracao?: number // em minutos
}

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([
    {
      id: "1",
      clienteNome: "João Silva",
      clientePhone: "(11) 98765-4321",
      servicoTipo: "Troca de Óleo",
      servicoDescricao: "Troca de óleo do motor + filtro",
      funcionario: "Carlos Mecânico",
      data: "2024-01-15",
      horario: "09:00",
      status: "confirmado",
      observacoes: "Cliente prefere óleo sintético",
      valor: 120.0,
      duracao: 60,
    },
    {
      id: "2",
      clienteNome: "Maria Santos",
      clientePhone: "(11) 91234-5678",
      servicoTipo: "Revisão Completa",
      servicoDescricao: "Revisão dos 10.000 km",
      funcionario: "Ana Técnica",
      data: "2024-01-15",
      horario: "14:00",
      status: "agendado",
      observacoes: "Verificar freios e suspensão",
      valor: 350.0,
      duracao: 180,
    },
    {
      id: "3",
      clienteNome: "Pedro Costa",
      clientePhone: "(11) 99876-5432",
      servicoTipo: "Alinhamento",
      servicoDescricao: "Alinhamento e balanceamento",
      funcionario: "José Alinhador",
      data: "2024-01-16",
      horario: "10:30",
      status: "em_andamento",
      observacoes: "",
      valor: 80.0,
      duracao: 90,
    },
    {
      id: "4",
      clienteNome: "Ana Oliveira",
      clientePhone: "(11) 95555-1234",
      servicoTipo: "Diagnóstico",
      servicoDescricao: "Diagnóstico eletrônico do motor",
      funcionario: "Roberto Eletricista",
      data: "2024-01-16",
      horario: "16:00",
      status: "agendado",
      observacoes: "Carro apresentando falhas na ignição",
      valor: 150.0,
      duracao: 120,
    },
  ])

  const [filteredAgendamentos, setFilteredAgendamentos] = useState<Agendamento[]>(agendamentos)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentAgendamento, setCurrentAgendamento] = useState<Partial<Agendamento>>({})
  const [isEditing, setIsEditing] = useState(false)

  // Filtrar agendamentos
  useEffect(() => {
    let filtered = agendamentos

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (agendamento) =>
          agendamento.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agendamento.servicoTipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agendamento.funcionario.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtro por data
    if (selectedDate) {
      const dateString = format(selectedDate, "yyyy-MM-dd")
      filtered = filtered.filter((agendamento) => agendamento.data === dateString)
    }

    // Filtro por status
    if (statusFilter !== "todos") {
      filtered = filtered.filter((agendamento) => agendamento.status === statusFilter)
    }

    setFilteredAgendamentos(filtered)
  }, [agendamentos, searchTerm, selectedDate, statusFilter])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      agendado: { label: "Agendado", className: "bg-blue-100 text-blue-800" },
      confirmado: { label: "Confirmado", className: "bg-green-100 text-green-800" },
      em_andamento: { label: "Em Andamento", className: "bg-yellow-100 text-yellow-800" },
      concluido: { label: "Concluído", className: "bg-gray-100 text-gray-800" },
      cancelado: { label: "Cancelado", className: "bg-red-100 text-red-800" },
    }

    const config = statusConfig[status] || statusConfig.agendado

    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const handleAddAgendamento = () => {
    setIsEditing(false)
    setCurrentAgendamento({
      clienteNome: "",
      clientePhone: "",
      servicoTipo: "",
      servicoDescricao: "",
      funcionario: "",
      data: "",
      horario: "",
      status: "agendado",
      observacoes: "",
      valor: 0,
      duracao: 60,
    })
    setIsDialogOpen(true)
  }

  const handleEditAgendamento = (agendamento: Agendamento) => {
    setIsEditing(true)
    setCurrentAgendamento(agendamento)
    setIsDialogOpen(true)
  }

  const handleDeleteAgendamento = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      setAgendamentos(agendamentos.filter((a) => a.id !== id))
    }
  }

  const handleSaveAgendamento = () => {
    if (!currentAgendamento.clienteNome || !currentAgendamento.data || !currentAgendamento.horario) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    if (isEditing && currentAgendamento.id) {
      setAgendamentos(
        agendamentos.map((a) => (a.id === currentAgendamento.id ? (currentAgendamento as Agendamento) : a)),
      )
    } else {
      const newAgendamento: Agendamento = {
        ...currentAgendamento,
        id: Date.now().toString(),
      } as Agendamento

      setAgendamentos([...agendamentos, newAgendamento])
    }

    setIsDialogOpen(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`
    }
    return `${mins}min`
  }

  // Agrupar agendamentos por data
  const agendamentosPorData = filteredAgendamentos.reduce(
    (acc, agendamento) => {
      const data = agendamento.data
      if (!acc[data]) {
        acc[data] = []
      }
      acc[data].push(agendamento)
      return acc
    },
    {} as Record<string, Agendamento[]>,
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground">Gerencie os agendamentos de serviços</p>
        </div>
        <Button onClick={handleAddAgendamento}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cliente, serviço ou funcionário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ações</Label>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedDate(undefined)
                  setStatusFilter("todos")
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Agendamentos */}
      <Tabs defaultValue="lista" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lista">Lista</TabsTrigger>
          <TabsTrigger value="calendario">Calendário</TabsTrigger>
        </TabsList>

        <TabsContent value="lista">
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos ({filteredAgendamentos.length})</CardTitle>
              <CardDescription>
                {selectedDate &&
                  `Agendamentos para ${format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(agendamentosPorData).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(agendamentosPorData)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([data, agendamentosData]) => (
                      <div key={data} className="space-y-3">
                        <h3 className="text-lg font-semibold border-b pb-2">
                          {format(new Date(data), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                        </h3>
                        <div className="grid gap-3">
                          {agendamentosData
                            .sort((a, b) => a.horario.localeCompare(b.horario))
                            .map((agendamento) => (
                              <Card key={agendamento.id} className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-mono text-lg font-semibold">{agendamento.horario}</span>
                                      </div>
                                      {getStatusBadge(agendamento.status)}
                                      {agendamento.duracao && (
                                        <Badge variant="outline">{formatDuration(agendamento.duracao)}</Badge>
                                      )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div>
                                        <p className="text-sm text-muted-foreground">Cliente</p>
                                        <p className="font-medium">{agendamento.clienteNome}</p>
                                        <p className="text-sm text-muted-foreground">{agendamento.clientePhone}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Serviço</p>
                                        <p className="font-medium">{agendamento.servicoTipo}</p>
                                        <p className="text-sm text-muted-foreground">{agendamento.servicoDescricao}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Funcionário</p>
                                        <p className="font-medium">{agendamento.funcionario}</p>
                                        {agendamento.valor && (
                                          <p className="text-sm font-semibold text-green-600">
                                            {formatCurrency(agendamento.valor)}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {agendamento.observacoes && (
                                      <div>
                                        <p className="text-sm text-muted-foreground">Observações</p>
                                        <p className="text-sm">{agendamento.observacoes}</p>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditAgendamento(agendamento)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteAgendamento(agendamento.id)}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum agendamento encontrado para os filtros selecionados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendario">
          <Card>
            <CardHeader>
              <CardTitle>Visualização em Calendário</CardTitle>
              <CardDescription>Selecione uma data para ver os agendamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
                <div className="space-y-4">
                  {selectedDate && agendamentosPorData[format(selectedDate, "yyyy-MM-dd")] ? (
                    <div>
                      <h3 className="font-semibold mb-3">Agendamentos para {format(selectedDate, "dd/MM/yyyy")}</h3>
                      <div className="space-y-2">
                        {agendamentosPorData[format(selectedDate, "yyyy-MM-dd")]
                          .sort((a, b) => a.horario.localeCompare(b.horario))
                          .map((agendamento) => (
                            <div key={agendamento.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">
                                    {agendamento.horario} - {agendamento.clienteNome}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{agendamento.servicoTipo}</p>
                                </div>
                                {getStatusBadge(agendamento.status)}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      {selectedDate
                        ? "Nenhum agendamento para esta data"
                        : "Selecione uma data para ver os agendamentos"}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para adicionar/editar agendamento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Edite os dados do agendamento." : "Preencha os dados para criar um novo agendamento."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clienteNome">Nome do Cliente *</Label>
                <Input
                  id="clienteNome"
                  value={currentAgendamento.clienteNome || ""}
                  onChange={(e) => setCurrentAgendamento({ ...currentAgendamento, clienteNome: e.target.value })}
                  placeholder="Nome completo do cliente"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientePhone">Telefone do Cliente</Label>
                <Input
                  id="clientePhone"
                  value={currentAgendamento.clientePhone || ""}
                  onChange={(e) => setCurrentAgendamento({ ...currentAgendamento, clientePhone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="servicoTipo">Tipo de Serviço *</Label>
                <Select
                  value={currentAgendamento.servicoTipo || ""}
                  onValueChange={(value) => setCurrentAgendamento({ ...currentAgendamento, servicoTipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Troca de Óleo">Troca de Óleo</SelectItem>
                    <SelectItem value="Revisão Completa">Revisão Completa</SelectItem>
                    <SelectItem value="Alinhamento">Alinhamento e Balanceamento</SelectItem>
                    <SelectItem value="Freios">Manutenção de Freios</SelectItem>
                    <SelectItem value="Suspensão">Suspensão</SelectItem>
                    <SelectItem value="Diagnóstico">Diagnóstico Eletrônico</SelectItem>
                    <SelectItem value="Ar Condicionado">Ar Condicionado</SelectItem>
                    <SelectItem value="Pneus">Troca de Pneus</SelectItem>
                    <SelectItem value="Bateria">Troca de Bateria</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="funcionario">Funcionário Responsável</Label>
                <Select
                  value={currentAgendamento.funcionario || ""}
                  onValueChange={(value) => setCurrentAgendamento({ ...currentAgendamento, funcionario: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Carlos Mecânico">Carlos Mecânico</SelectItem>
                    <SelectItem value="Ana Técnica">Ana Técnica</SelectItem>
                    <SelectItem value="José Alinhador">José Alinhador</SelectItem>
                    <SelectItem value="Roberto Eletricista">Roberto Eletricista</SelectItem>
                    <SelectItem value="Maria Atendente">Maria Atendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="servicoDescricao">Descrição do Serviço</Label>
              <Textarea
                id="servicoDescricao"
                value={currentAgendamento.servicoDescricao || ""}
                onChange={(e) => setCurrentAgendamento({ ...currentAgendamento, servicoDescricao: e.target.value })}
                placeholder="Descreva detalhes do serviço a ser realizado"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={currentAgendamento.data || ""}
                  onChange={(e) => setCurrentAgendamento({ ...currentAgendamento, data: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horario">Horário *</Label>
                <Input
                  id="horario"
                  type="time"
                  value={currentAgendamento.horario || ""}
                  onChange={(e) => setCurrentAgendamento({ ...currentAgendamento, horario: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duracao">Duração (minutos)</Label>
                <Input
                  id="duracao"
                  type="number"
                  min="15"
                  step="15"
                  value={currentAgendamento.duracao || 60}
                  onChange={(e) => setCurrentAgendamento({ ...currentAgendamento, duracao: Number(e.target.value) })}
                  placeholder="60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={currentAgendamento.status || "agendado"}
                  onValueChange={(value) => setCurrentAgendamento({ ...currentAgendamento, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor Estimado (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentAgendamento.valor || ""}
                  onChange={(e) => setCurrentAgendamento({ ...currentAgendamento, valor: Number(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={currentAgendamento.observacoes || ""}
                onChange={(e) => setCurrentAgendamento({ ...currentAgendamento, observacoes: e.target.value })}
                placeholder="Observações adicionais sobre o agendamento"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAgendamento}>{isEditing ? "Salvar Alterações" : "Criar Agendamento"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
