"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Users, Car, Wrench, LogOut, User } from "lucide-react"
import { authService } from "@/lib/auth"

export default function FuncionarioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState(authService.getCurrentUser())
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)

    // Check if user is logged in and has funcionario role
    const currentUser = authService.getCurrentUser()
    if (!currentUser || currentUser.role !== "funcionario") {
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

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center px-4 py-2">
              <User className="mr-2 h-6 w-6" />
              <div>
                <h1 className="text-lg font-bold">Funcionário</h1>
                <p className="text-sm text-muted-foreground">{user.name}</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild isActive={pathname === item.path} tooltip={item.label}>
                        <a href={item.path}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="border-b bg-background p-4">
            <div className="flex items-center justify-between">
              <SidebarTrigger />
              <h2 className="text-lg font-medium">Área do Funcionário</h2>
              <div></div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
