"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Home, Users, Car, Wrench, Package, FileText, Calendar, BarChart, Settings, LogOut, Menu } from "lucide-react"
import { authService } from "@/lib/auth"
import { useAppContext } from "@/contexts/app-context"
import { GoogleSheetsSettingsProvider } from '@/contexts/google-sheets-settings-context'; // Importação adicionada

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState(authService.getCurrentUser())
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Usar o contexto para obter as configurações da empresa
  const { companySettings } = useAppContext() // AppContext ainda é usado aqui

  useEffect(() => {
    setMounted(true)

    const currentUser = authService.getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") { // Ajuste aqui: apenas admin pode acessar /dashboard
      authService.logout()
      router.push("/login")
      return
    }

    setUser(currentUser)
  }, [router])

  const handleLogout = () => {
    authService.logout()
    router.push("/login")
  }

  if (!mounted || !user) { // Removida a verificação user.role !== "admin" pois já é feita acima
    return null
  }

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Clientes", path: "/dashboard/clientes" },
    { icon: Car, label: "Veículos", path: "/dashboard/veiculos" },
    { icon: Wrench, label: "Serviços", path: "/dashboard/servicos" },
    { icon: Package, label: "Estoque", path: "/dashboard/estoque" },
    { icon: FileText, label: "Orçamentos", path: "/dashboard/orcamentos" },
    { icon: Calendar, label: "Agendamentos", path: "/dashboard/agendamentos" },
    { icon: Users, label: "Funcionários", path: "/dashboard/funcionarios" },
    { icon: BarChart, label: "Relatórios", path: "/dashboard/relatorios" },
    { icon: Settings, label: "Configurações", path: "/dashboard/configuracoes" },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-4 py-6 border-b">
        <Wrench className="mr-2 h-6 w-6" />
        <h1 className="text-xl font-bold">{companySettings.name}</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === item.path
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <item.icon className="mr-3 h-4 w-4" />
            {item.label}
          </a>
        ))}
      </nav>

      <div className="px-4 py-4 border-t">
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  )

  return (
    // Envolvendo com GoogleSheetsSettingsProvider e AppContext (se AppContext for necessário aqui)
    // Se AppContext já estiver em um layout superior (como app/layout.tsx), pode não ser necessário aqui.
    // Assumindo que AppContext é específico para o dashboard ou precisa ser re-instanciado.
    <AppContextProvider> 
      <GoogleSheetsSettingsProvider>
        <div className="flex h-screen bg-background">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r">
            <SidebarContent />
          </aside>

          {/* Mobile Sidebar */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          {/* Main Content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 border-b bg-background lg:px-6">
              <div className="flex items-center">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                </Sheet>
                <h2 className="ml-2 text-lg font-semibold lg:ml-0">{companySettings.name}</h2>
              </div>

              <div className="flex items-center space-x-2">
                <span className="hidden text-sm text-muted-foreground sm:block">Olá, {user.name}</span>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
          </div>
        </div>
      </GoogleSheetsSettingsProvider>
    </AppContextProvider>
  )
}
