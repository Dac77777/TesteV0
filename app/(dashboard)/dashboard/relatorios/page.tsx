"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, TrendingUp, DollarSign, Wrench, Download } from "lucide-react"

export default function RelatoriosPage() {
  const [reportType, setReportType] = useState("financeiro")
  const [startDate, setStartDate] = useState("2023-05-01")
  const [endDate, setEndDate] = useState("2023-06-01")

  // Mock data for reports
  const financialData = {
    totalRevenue: 15750.0,
    totalServices: 45,
    averageTicket: 350.0,
    growth: 12.5,
  }

  const serviceData = [
    { service: "Troca de Óleo", quantity: 15, revenue: 2250.0 },
    { service: "Revisão Completa", quantity: 8, revenue: 6800.0 },
    { service: "Alinhamento", quantity: 12, revenue: 1440.0 },
    { service: "Troca de Pastilhas", quantity: 6, revenue: 1800.0 },
    { service: "Diagnóstico", quantity: 4, revenue: 800.0 },
  ]

  const clientData = [
    { client: "João Silva", services: 3, totalSpent: 850.0, lastVisit: "2023-05-28" },
    { client: "Maria Oliveira", services: 2, totalSpent: 1200.0, lastVisit: "2023-05-25" },
    { client: "Carlos Santos", services: 4, totalSpent: 650.0, lastVisit: "2023-05-30" },
    { client: "Ana Souza", services: 1, totalSpent: 450.0, lastVisit: "2023-05-20" },
    { client: "Paulo Lima", services: 2, totalSpent: 750.0, lastVisit: "2023-05-22" },
  ]

  const stockData = [
    { item: "Óleo Motor 5W30", category: "Lubrificantes", sold: 15, revenue: 688.5 },
    { item: "Filtro de Ar", category: "Filtros", sold: 8, revenue: 260.0 },
    { item: "Pastilha de Freio", category: "Freios", sold: 6, revenue: 539.4 },
    { item: "Vela de Ignição", category: "Motor", sold: 12, revenue: 189.6 },
  ]

  const handleGenerateReport = () => {
    alert(`Relatório ${reportType} gerado para o período de ${startDate} a ${endDate}`)
  }

  const handleExportReport = () => {
    alert(`Exportando relatório ${reportType} em PDF...`)
  }

  const renderFinancialReport = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="mr-4 rounded-full p-2 bg-green-100 text-green-700">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
              <h3 className="text-2xl font-bold">R$ {financialData.totalRevenue.toFixed(2)}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="mr-4 rounded-full p-2 bg-blue-100 text-blue-700">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Serviços</p>
              <h3 className="text-2xl font-bold">{financialData.totalServices}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="mr-4 rounded-full p-2 bg-purple-100 text-purple-700">
              <BarChart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
              <h3 className="text-2xl font-bold">R$ {financialData.averageTicket.toFixed(2)}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="mr-4 rounded-full p-2 bg-amber-100 text-amber-700">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Crescimento</p>
              <h3 className="text-2xl font-bold">+{financialData.growth}%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receita por Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Receita</TableHead>
                <TableHead>% do Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.service}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>R$ {item.revenue.toFixed(2)}</TableCell>
                  <TableCell>{((item.revenue / financialData.totalRevenue) * 100).toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )

  const renderClientReport = () => (
    <Card>
      <CardHeader>
        <CardTitle>Relatório de Clientes</CardTitle>
        <CardDescription>Análise do comportamento dos clientes</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Serviços</TableHead>
              <TableHead>Total Gasto</TableHead>
              <TableHead>Última Visita</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientData.map((client, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{client.client}</TableCell>
                <TableCell>{client.services}</TableCell>
                <TableCell>R$ {client.totalSpent.toFixed(2)}</TableCell>
                <TableCell>{client.lastVisit}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  const renderStockReport = () => (
    <Card>
      <CardHeader>
        <CardTitle>Relatório de Estoque</CardTitle>
        <CardDescription>Análise de vendas de produtos</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Vendidos</TableHead>
              <TableHead>Receita</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockData.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.item}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.sold}</TableCell>
                <TableCell>R$ {item.revenue.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )

  const renderReport = () => {
    switch (reportType) {
      case "financeiro":
        return renderFinancialReport()
      case "clientes":
        return renderClientReport()
      case "estoque":
        return renderStockReport()
      default:
        return renderFinancialReport()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerador de Relatórios</CardTitle>
          <CardDescription>Configure e gere relatórios personalizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="grid gap-2">
              <Label htmlFor="reportType">Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="clientes">Clientes</SelectItem>
                  <SelectItem value="estoque">Estoque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">Data Final</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleGenerateReport} className="flex-1">
                <BarChart className="mr-2 h-4 w-4" />
                Gerar
              </Button>
              <Button variant="outline" onClick={handleExportReport}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {renderReport()}
    </div>
  )
}
