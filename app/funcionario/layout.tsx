"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Users, Car, Wrench, LogOut, User, Menu } from "lucide-react"
import { authService } from "@/lib/auth"

export default function FuncionarioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState(authService.getCurrentUser())
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)

    const currentUser = authService.getCurrentUser()
    if (!currentUser || currentUser.role !== "funcionario") {
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

  if (!mounted || !user || user.role !== "funcionario") {
    return null
  }

  const menuItems = [
    { icon: Users, label: "Clientes", path: "/funcionario/clientes" },
    { icon: Car, label: "Veículos", path: "/funcionario/veiculos" },
    { icon: Wrench, label: "Serviços", path: "/funcionario/servicos" },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-4 py-6 border-b">
        <User className="mr-2 h-6 w-6" />
        <div>
          <h1 className="text-lg font-bold">Funcionário</h1>
          <p className="text-sm text-muted-foreground">{user.name}</p>
        </div>
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
            <h2 className="ml-2 text-lg font-semibold lg:ml-0">Área do Funcionário</h2>
          </div>

          <div className="flex items-center space-x-2">
            <span className="hidden text-sm text-muted-foreground sm:block">{user.name}</span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
