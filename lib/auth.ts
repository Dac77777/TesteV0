"use client"

import type { User } from "@/types/user"

class AuthService {
  private currentUser: User | null = null

  constructor() {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("currentUser")
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser)
      }
    }
  }

  async loginCliente(cpf: string): Promise<User | null> {
    // Buscar cliente pelo CPF
    const clients = this.getClients()
    const client = clients.find((c) => c.cpf === cpf)

    if (client) {
      const user: User = {
        id: client.id.toString(),
        name: client.name,
        cpf: client.cpf,
        role: "cliente",
        createdAt: new Date().toISOString(),
        isActive: true,
      }

      this.currentUser = user
      localStorage.setItem("currentUser", JSON.stringify(user))
      return user
    }

    return null
  }

  async loginEmployee(username: string, password: string): Promise<User | null> {
    const employees = this.getEmployees()
    const employee = employees.find(
      (e) => e.name.toLowerCase() === username.toLowerCase() && e.password === password && e.isActive,
    )

    if (employee) {
      this.currentUser = employee
      localStorage.setItem("currentUser", JSON.stringify(employee))
      return employee
    }

    return null
  }

  async loginAdmin(username: string, password: string): Promise<User | null> {
    // Admin padrão
    if (username === "admin" && password === "admin123") {
      const user: User = {
        id: "admin",
        name: "Administrador",
        email: "admin@oficina.com",
        role: "admin",
        createdAt: new Date().toISOString(),
        isActive: true,
      }

      this.currentUser = user
      localStorage.setItem("currentUser", JSON.stringify(user))
      return user
    }

    return null
  }

  logout(): void {
    this.currentUser = null
    localStorage.removeItem("currentUser")
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  hasPermission(permission: string): boolean {
    if (!this.currentUser) return false

    const permissions = {
      cliente: ["view_own_services", "view_own_history"],
      funcionario: [
        "view_services",
        "create_services",
        "edit_services",
        "view_clients",
        "create_clients",
        "edit_clients",
        "view_vehicles",
        "create_vehicles",
        "edit_vehicles",
      ],
      admin: ["*"], // Acesso total
    }

    const userPermissions = permissions[this.currentUser.role] || []
    return userPermissions.includes("*") || userPermissions.includes(permission)
  }

  private getClients() {
    // Mock data - em produção viria do banco de dados
    return [
      { id: 1, name: "João Silva", cpf: "123.456.789-00", email: "joao@example.com", phone: "(11) 98765-4321" },
      { id: 2, name: "Maria Oliveira", cpf: "987.654.321-00", email: "maria@example.com", phone: "(11) 91234-5678" },
      { id: 3, name: "Carlos Santos", cpf: "456.789.123-00", email: "carlos@example.com", phone: "(11) 99876-5432" },
    ]
  }

  private getEmployees(): User[] {
    const saved = localStorage.getItem("employees")
    if (saved) {
      return JSON.parse(saved)
    }

    // Funcionários padrão
    const defaultEmployees: User[] = [
      {
        id: "func1",
        name: "José Mecânico",
        email: "jose@oficina.com",
        role: "funcionario",
        password: "123456",
        createdAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: "func2",
        name: "Ana Atendente",
        email: "ana@oficina.com",
        role: "funcionario",
        password: "123456",
        createdAt: new Date().toISOString(),
        isActive: true,
      },
    ]

    localStorage.setItem("employees", JSON.stringify(defaultEmployees))
    return defaultEmployees
  }

  getEmployeesList(): User[] {
    return this.getEmployees()
  }

  addEmployee(employee: Omit<User, "id" | "createdAt">): void {
    const employees = this.getEmployees()
    const newEmployee: User = {
      ...employee,
      id: `func_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    employees.push(newEmployee)
    localStorage.setItem("employees", JSON.stringify(employees))
  }

  updateEmployee(id: string, updates: Partial<User>): void {
    const employees = this.getEmployees()
    const index = employees.findIndex((e) => e.id === id)

    if (index !== -1) {
      employees[index] = { ...employees[index], ...updates }
      localStorage.setItem("employees", JSON.stringify(employees))
    }
  }

  deleteEmployee(id: string): void {
    const employees = this.getEmployees()
    const filtered = employees.filter((e) => e.id !== id)
    localStorage.setItem("employees", JSON.stringify(filtered))
  }
}

export const authService = new AuthService()
