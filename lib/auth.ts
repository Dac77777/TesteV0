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
    try {
      // Tentar buscar no Google Sheets primeiro
      const { googleSheetsService } = await import("./google-sheets")
      if (googleSheetsService.isConfigured()) {
        const data = await googleSheetsService.pullData()
        if (data.clients && data.clients.length > 1) {
          // Procurar cliente pelo CPF no Google Sheets
          const clientRow = data.clients.slice(1).find((row: any[]) => row[5] === cpf) // CPF está na coluna 5
          if (clientRow) {
            const user: User = {
              id: clientRow[0].toString(),
              name: clientRow[1],
              cpf: clientRow[5],
              email: clientRow[2],
              role: "cliente",
              createdAt: new Date().toISOString(),
              isActive: true,
            }

            this.currentUser = user
            localStorage.setItem("currentUser", JSON.stringify(user))
            return user
          }
        }
      }
    } catch (error) {
      console.log("Erro ao buscar cliente no Google Sheets, usando dados locais")
    }

    // Fallback para dados locais
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
    try {
      // Tentar buscar no Google Sheets primeiro
      const { googleSheetsService } = await import("./google-sheets")
      if (googleSheetsService.isConfigured()) {
        const data = await googleSheetsService.pullData()
        if (data.employees && data.employees.length > 1) {
          // Procurar funcionário pelo usuário e senha no Google Sheets
          const employeeRow = data.employees.slice(1).find(
            (row: any[]) => row[3] === username && row[4] === password && row[5] === "true", // usuario, senha, ativo
          )
          if (employeeRow) {
            const user: User = {
              id: employeeRow[0],
              name: employeeRow[1],
              email: employeeRow[2],
              username: employeeRow[3],
              role: "funcionario",
              password: employeeRow[4],
              isActive: employeeRow[5] === "true",
              createdAt: employeeRow[6] || new Date().toISOString(),
            }

            this.currentUser = user
            localStorage.setItem("currentUser", JSON.stringify(user))
            return user
          }
        }
      }
    } catch (error) {
      console.log("Erro ao buscar funcionário no Google Sheets, usando dados locais")
    }

    // Fallback para dados locais
    const employees = await this.getEmployees()
    const employee = employees.find(
      (e) =>
        (e.username === username || e.name.toLowerCase() === username.toLowerCase() || e.email === username) &&
        e.password === password &&
        e.isActive,
    )

    if (employee) {
      this.currentUser = employee
      localStorage.setItem("currentUser", JSON.stringify(employee))
      return employee
    }

    return null
  }

  async loginAdmin(username: string, password: string): Promise<User | null> {
    try {
      // Tentar buscar no Google Sheets primeiro
      const { googleSheetsService } = await import("./google-sheets")
      if (googleSheetsService.isConfigured()) {
        const data = await googleSheetsService.pullData()
        if (data.admin && data.admin.length > 1) {
          // Procurar admin pelo usuário e senha no Google Sheets
          const adminRow = data.admin.slice(1).find((row: any[]) => row[0] === username && row[1] === password)
          if (adminRow) {
            const user: User = {
              id: "admin",
              name: adminRow[2] || "Administrador",
              email: adminRow[3] || "admin@oficina.com",
              username: adminRow[0],
              role: "admin",
              createdAt: new Date().toISOString(),
              isActive: true,
            }

            this.currentUser = user
            localStorage.setItem("currentUser", JSON.stringify(user))
            return user
          }
        }
      }
    } catch (error) {
      console.log("Erro ao buscar admin no Google Sheets, usando dados locais")
    }

    // Fallback para credenciais locais
    const credentials = this.getAdminCredentials()
    if (username === credentials.username && password === credentials.password) {
      const user: User = {
        id: "admin",
        name: "Administrador",
        email: "admin@oficina.com",
        username: credentials.username,
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

  private async getEmployees(): Promise<User[]> {
    // Tentar carregar do Google Sheets primeiro
    try {
      const { googleSheetsService } = await import("./google-sheets")
      if (googleSheetsService.isConfigured()) {
        const data = await googleSheetsService.pullData()
        if (data.employees && data.employees.length > 1) {
          // Converter dados do sheets para formato User
          const employees = data.employees.slice(1).map((row: any[]) => ({
            id: row[0],
            name: row[1],
            email: row[2],
            username: row[3],
            password: row[4],
            role: "funcionario" as const,
            isActive: row[5] === "true",
            createdAt: row[6] || new Date().toISOString(),
          }))

          // Salvar localmente como backup
          localStorage.setItem("employees", JSON.stringify(employees))
          return employees
        }
      }
    } catch (error) {
      console.log("Erro ao carregar funcionários do Google Sheets, usando dados locais")
    }

    // Fallback para localStorage
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
        username: "jose",
        role: "funcionario",
        password: "123456",
        createdAt: new Date().toISOString(),
        isActive: true,
      },
      {
        id: "func2",
        name: "Ana Atendente",
        email: "ana@oficina.com",
        username: "ana",
        role: "funcionario",
        password: "123456",
        createdAt: new Date().toISOString(),
        isActive: true,
      },
    ]

    localStorage.setItem("employees", JSON.stringify(defaultEmployees))
    return defaultEmployees
  }

  async getEmployeesList(): Promise<User[]> {
    return await this.getEmployees()
  }

  async addEmployee(employee: Omit<User, "id" | "createdAt">): Promise<void> {
    const employees = await this.getEmployees()
    const newEmployee: User = {
      ...employee,
      id: `func_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    employees.push(newEmployee)
    localStorage.setItem("employees", JSON.stringify(employees))

    // Sincronizar com Google Sheets
    await this.syncEmployeesToSheets(employees)
  }

  async updateEmployee(id: string, updates: Partial<User>): Promise<void> {
    const employees = await this.getEmployees()
    const index = employees.findIndex((e) => e.id === id)

    if (index !== -1) {
      employees[index] = { ...employees[index], ...updates }
      localStorage.setItem("employees", JSON.stringify(employees))

      // Sincronizar com Google Sheets
      await this.syncEmployeesToSheets(employees)
    }
  }

  async deleteEmployee(id: string): Promise<void> {
    const employees = await this.getEmployees()
    const filtered = employees.filter((e) => e.id !== id)
    localStorage.setItem("employees", JSON.stringify(filtered))

    // Sincronizar com Google Sheets
    await this.syncEmployeesToSheets(filtered)
  }

  private async syncEmployeesToSheets(employees: User[]): Promise<void> {
    try {
      const { googleSheetsService } = await import("./google-sheets")
      if (googleSheetsService.isConfigured()) {
        const sheetsData = [
          ["ID", "Nome", "Email", "Usuario", "Senha", "Ativo", "Data Criação"],
          ...employees.map((emp) => [
            emp.id,
            emp.name,
            emp.email || "",
            emp.username || emp.name.toLowerCase().replace(/\s+/g, ""),
            emp.password || "",
            emp.isActive.toString(),
            emp.createdAt,
          ]),
        ]

        await googleSheetsService.writeSheet("Funcionários", sheetsData)
      }
    } catch (error) {
      console.error("Erro ao sincronizar funcionários com Google Sheets:", error)
    }
  }

  async updateAdminCredentials(newUsername: string, newPassword: string): Promise<boolean> {
    try {
      // Salvar novas credenciais do admin localmente
      const adminCredentials = { username: newUsername, password: newPassword }
      localStorage.setItem("adminCredentials", JSON.stringify(adminCredentials))

      // Sincronizar com Google Sheets
      await this.syncAdminToSheets(newUsername, newPassword)

      return true
    } catch (error) {
      return false
    }
  }

  private async syncAdminToSheets(username: string, password: string): Promise<void> {
    try {
      const { googleSheetsService } = await import("./google-sheets")
      if (googleSheetsService.isConfigured()) {
        const sheetsData = [
          ["Usuario", "Senha", "Nome", "Email"],
          [username, password, "Administrador", "admin@oficina.com"],
        ]

        await googleSheetsService.writeSheet("Admin", sheetsData)
      }
    } catch (error) {
      console.error("Erro ao sincronizar admin com Google Sheets:", error)
    }
  }

  private getAdminCredentials() {
    const saved = localStorage.getItem("adminCredentials")
    if (saved) {
      return JSON.parse(saved)
    }
    return { username: "admin", password: "admin123" }
  }
}

export const authService = new AuthService()
