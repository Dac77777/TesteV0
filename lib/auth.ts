// VISÃO GERAL DESTE ARQUIVO (lib/auth.ts):
// Este arquivo gerencia a autenticação e o gerenciamento básico de usuários (clientes, funcionários, admin).
//
// Principais Modificações Recentes:
// - Dependência do `googleSheetsService`: Para leitura e escrita de dados de usuários, este serviço
//   agora depende do `googleSheetsService` (que foi refatorado para usar o `localStorage` do navegador
//   como um mock persistente, em vez de simular chamadas diretas ao Google Sheets).
// - Centralização de Dados: Mocks de dados internos e acesso direto ao `localStorage` para
//   credenciais ou listas de usuários foram removidos deste arquivo e centralizados no `googleSheetsService`.
// - Geração de Token: A função `generateToken` foi modificada para simular uma estrutura JWT,
//   mas permanece insegura para produção (veja comentários específicos nessa função).
// - Credenciais de Admin Padrão: As credenciais de admin de fallback foram alteradas para valores
//   menos óbvios e com avisos.
//
// Para limitações sobre o uso do localStorage, veja o comentário "NOTA SOBRE PERSISTÊNCIA DE DADOS COM LOCALSTORAGE" abaixo.
// Para recomendações críticas sobre senhas, veja "RECOMENDAÇÃO CRÍTICA DE SEGURANÇA PARA PRODUÇÃO" abaixo.
"use client"

import type { User } from "@/types/user"
import { googleSheetsService } from "./google-sheets" // Import directly

// RECOMENDAÇÃO CRÍTICA DE SEGURANÇA PARA PRODUÇÃO:
// As senhas NUNCA devem ser armazenadas ou comparadas em texto plano, como ocorre
// neste exemplo de demonstração/desenvolvimento (onde os dados vêm do `localStorage`
// que foi inicializado com mocks, incluindo senhas em texto).
//
// Em um ambiente de produção real:
// 1. As senhas devem ser SEMPRE HASHEADAS usando um algoritmo criptográfico forte
//    (ex: bcrypt, Argon2) antes de serem armazenadas em qualquer banco de dados ou sistema.
// 2. Durante o login, a senha fornecida pelo usuário deve ser hasheada da mesma forma,
//    e então o HASH resultante deve ser comparado com o HASH armazenado.
// 3. A ausência de hashing de senhas é uma VULNERABILIDADE DE SEGURANÇA GRAVE.
//    Mesmo que o usuário tenha indicado que "senhas não são problema agora", para qualquer
//    aplicação real, esta é uma prioridade máxima.
class AuthService {
  private currentUser: User | null = null
  private tokenExpiryTime: number = 8 * 60 * 60 * 1000 // 8 horas em milissegundos

  constructor() {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("currentUser")
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser)

        // Verificar se o token expirou
        const tokenTimestamp = localStorage.getItem("tokenTimestamp")
        if (tokenTimestamp) {
          const timestamp = Number.parseInt(tokenTimestamp, 10)
          if (Date.now() - timestamp > this.tokenExpiryTime) {
            this.logout() // Token expirado, fazer logout
          }
        }
      }
    }
  }

  async loginCliente(cpf: string): Promise<User | null> {
    try {
      const data = await googleSheetsService.pullData()
      if (data.clients && data.clients.length > 1) {
        const clientRow = data.clients.slice(1).find((row: any[]) => row[5] === cpf)
        if (clientRow) {
          const user: User = {
            id: clientRow[0]?.toString() || `client_${Date.now()}`,
            name: clientRow[1],
            cpf: clientRow[5],
            email: clientRow[2],
            role: "cliente",
            createdAt: new Date().toISOString(),
            isActive: true,
          }
          this.setCurrentUser(user)
          return user
        }
      }
    } catch (error) {
      console.error("Erro ao buscar cliente via googleSheetsService:", error)
    }
    return null
  }

  async loginEmployee(username: string, password: string): Promise<User | null> {
    try {
      const data = await googleSheetsService.pullData()
      if (data.employees && data.employees.length > 1) {
        const employeeRow = data.employees.slice(1).find(
          (row: any[]) => row[3] === username && row[4] === password && row[5] === "true",
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
          this.setCurrentUser(user)
          return user
        }
      }
    } catch (error) {
      console.error("Erro ao buscar funcionário via googleSheetsService:", error)
    }
    return null
  }

  async loginAdmin(username: string, password: string): Promise<User | null> {
    try {
      const data = await googleSheetsService.pullData()
      if (data.admin && data.admin.length > 1) {
        const adminRow = data.admin.slice(1).find((row: any[]) => row[0] === username && row[1] === password)
        if (adminRow) {
          const user: User = {
            id: "admin_" + (adminRow[0] || Date.now().toString()),
            name: adminRow[2] || "Administrador",
            email: adminRow[3] || "admin@oficina.com",
            username: adminRow[0],
            role: "admin",
            createdAt: new Date().toISOString(),
            isActive: true,
          }
          this.setCurrentUser(user)
          return user
        }
      }
    } catch (error) {
      console.error("Erro ao buscar admin via googleSheetsService:", error)
    }
    return null
  }

  async login(usernameOrCpf: string, password?: string): Promise<User | null> {
    if (!password) {
      return await this.loginCliente(usernameOrCpf)
    }
    const adminUser = await this.loginAdmin(usernameOrCpf, password)
    if (adminUser) {
      return adminUser
    }
    const employeeUser = await this.loginEmployee(usernameOrCpf, password)
    if (employeeUser) {
      return employeeUser
    }
    return null
  }

  private setCurrentUser(user: User): void {
    this.currentUser = user
    if (typeof window !== "undefined") {
      localStorage.setItem("currentUser", JSON.stringify(user))
      localStorage.setItem("tokenTimestamp", Date.now().toString())
      this.setCookie("auth_token", this.generateToken(user), this.tokenExpiryTime / 1000)
      this.setCookie("user_role", user.role, this.tokenExpiryTime / 1000)
    }
  }

  /**
   * Simula a geração de um token no estilo JWT para fins de demonstração.
   *
   * IMPORTANTE: Este token NÃO É SEGURO para produção. Ele é gerado no lado do cliente
   * e a 'assinatura' é mockada e não verificável.
   *
   * Em um sistema de produção, os JWTs devem ser gerados e assinados no SERVIDOR
   * usando um segredo forte (para algoritmos simétricos como HS256) ou uma chave
   * privada (para algoritmos assimétricos como RS256).
   *
   * A validação do token também deve ocorrer no servidor, verificando a assinatura
   * e o tempo de expiração.
   *
   * Esta implementação usa `btoa` para codificação Base64. JWTs padrão usam
   * Base64URL encoding, que lida com os caracteres '+', '/', e '=' de forma
   * diferente para ser seguro em URLs. (Esta simulação não implementa Base64URL encoding completo).
   */
  private generateToken(user: User): string {
    const header = {
      alg: "HS256_MOCK",
      typ: "JWT_MOCK",
    }
    const payload = {
      id: user.id,
      role: user.role,
      name: user.name || user.username,
      iat: Date.now(),
      exp: Date.now() + this.tokenExpiryTime,
    }
    const encodedHeader = btoa(JSON.stringify(header))
    const encodedPayload = btoa(JSON.stringify(payload))
    const mockSignature = "mock_signature_generated_client_side_not_secure"
    return `${encodedHeader}.${encodedPayload}.${mockSignature}`
  }

  private setCookie(name: string, value: string, maxAge: number): void {
    if (typeof document !== "undefined") {
      document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Strict; Secure`
    }
  }

  private deleteCookie(name: string): void {
    if (typeof document !== "undefined") {
      document.cookie = `${name}=; path=/; max-age=0; SameSite=Strict; Secure`
    }
  }

  logout(): void {
    this.currentUser = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser")
      localStorage.removeItem("tokenTimestamp")
      this.deleteCookie("auth_token")
      this.deleteCookie("user_role")
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  hasPermission(permission: string): boolean {
    if (!this.currentUser) return false
    const permissions = {
      cliente: ["view_own_services", "view_own_history"],
      funcionario: [
        "view_services", "create_services", "edit_services",
        "view_clients", "create_clients", "edit_clients",
        "view_vehicles", "create_vehicles", "edit_vehicles",
      ],
      admin: ["*"],
    }
    const userPermissions = permissions[this.currentUser.role] || []
    return userPermissions.includes("*") || userPermissions.includes(permission)
  }

  private async getEmployees(): Promise<User[]> {
    try {
      const data = await googleSheetsService.pullData()
      if (data.employees && data.employees.length > 1) {
        return data.employees.slice(1).map((row: any[]) => ({
          id: row[0],
          name: row[1],
          email: row[2],
          username: row[3],
          password: row[4],
          role: "funcionario" as const,
          isActive: row[5] === "true",
          createdAt: row[6] || new Date().toISOString(),
        }))
      }
      return []
    } catch (error) {
      console.error("Erro ao carregar funcionários via googleSheetsService:", error)
      return []
    }
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
    await this.syncEmployeesToSheets(employees)
  }

  async updateEmployee(id: string, updates: Partial<User>): Promise<void> {
    let employees = await this.getEmployees()
    const index = employees.findIndex((e) => e.id === id)
    if (index !== -1) {
      employees[index] = { ...employees[index], ...updates }
      await this.syncEmployeesToSheets(employees)
    }
  }

  async deleteEmployee(id: string): Promise<void> {
    let employees = await this.getEmployees()
    const filteredEmployees = employees.filter((e) => e.id !== id)
    await this.syncEmployeesToSheets(filteredEmployees)
  }

  private async syncEmployeesToSheets(employees: User[]): Promise<void> {
    try {
      if (googleSheetsService.isConfigured() && googleSheetsService.config?.worksheetNames.employees) {
        const employeeSheetName = googleSheetsService.config.worksheetNames.employees;
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
        await googleSheetsService.writeSheet(employeeSheetName, sheetsData)
      } else {
        console.warn("Google Sheets service not configured or employee worksheet name missing for sync.")
      }
    } catch (error) {
      console.error("Erro ao sincronizar funcionários com Google Sheets:", error)
    }
  }

  async updateAdminCredentials(newUsername: string, newPassword: string): Promise<boolean> {
    try {
      if (this.currentUser && this.currentUser.role === "admin") {
        this.currentUser.username = newUsername
        this.setCurrentUser(this.currentUser)
      }
      await this.syncAdminToSheets(newUsername, newPassword)
      console.log("Credenciais de admin atualizadas no Google Sheets.")
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("adminCredentialsChanged", {
            detail: { username: newUsername }, // Only pass username, not password
          }),
        )
      }
      return true
    } catch (error) {
      console.error("Erro ao atualizar credenciais de admin:", error)
      return false
    }
  }

  private async syncAdminToSheets(newUsername: string, newPassword?: string): Promise<void> {
    try {
      if (googleSheetsService.isConfigured() && googleSheetsService.config?.worksheetNames.admin) {
        const adminSheetName = googleSheetsService.config.worksheetNames.admin;
        const adminData = await googleSheetsService.readSheet(adminSheetName);
        let adminRowToUpdate: any[];
        const headerRow = ["Usuario", "Senha", "Nome", "Email"];

        if (adminData && adminData.length > 1 && adminData[1] && adminData[1].length > 0) {
          adminRowToUpdate = [...adminData[1]]; // Create a copy to avoid modifying the read-only data directly
        } else {
          adminRowToUpdate = ["", "", "Administrador", "admin@oficina.com"];
        }

        let currentSheetData = adminData && adminData.length > 0 ? adminData : [headerRow];
        if(currentSheetData.length === 1 && currentSheetData[0].join('') !== headerRow.join('')) { // only bad header
            currentSheetData = [headerRow, adminRowToUpdate];
        } else if (currentSheetData.length === 1) { // only good header
             currentSheetData.push(adminRowToUpdate);
        } else if (currentSheetData.length > 1) { // header and data
            currentSheetData[1] = adminRowToUpdate;
        }


        adminRowToUpdate[0] = newUsername;
        if (newPassword) {
          adminRowToUpdate[1] = newPassword;
        }

        currentSheetData[1] = adminRowToUpdate; // Ensure the updated row is in the sheet data

        await googleSheetsService.writeSheet(adminSheetName, currentSheetData);
      } else {
         console.warn("Google Sheets service not configured or admin worksheet name missing for sync.")
      }
    } catch (error) {
      console.error("Erro ao sincronizar admin com Google Sheets:", error)
    }
  }

  async getAdminCredentials(): Promise<{ username?: string; password?: string; name?: string; email?: string } | null> {
    try {
      if (googleSheetsService.isConfigured() && googleSheetsService.config?.worksheetNames.admin) {
        const adminSheetName = googleSheetsService.config.worksheetNames.admin;
        const data = await googleSheetsService.readSheet(adminSheetName);
        if (data && data.length > 1 && data[1] && data[1][0]) {
          const adminRow = data[1];
          return {
            username: adminRow[0],
            password: adminRow[1],
            name: adminRow[2],
            email: adminRow[3],
          };
        } else {
          console.warn(`Nenhum usuário admin encontrado na planilha "${adminSheetName}". Usando credenciais de placeholder.`);
          // ATENÇÃO: Estas são credenciais de fallback apenas para desenvolvimento inicial.
          // Elas DEVEM ser alteradas através da interface de administração assim que o sistema for configurado.
          return { username: "admin_user_placeholder", password: "ChangeThisDefaultP@$$wOrd!" };
        }
      } else {
        console.warn("Google Sheets service not configured or admin worksheet name missing for getAdminCredentials. Using placeholder credentials.");
        // ATENÇÃO: Estas são credenciais de fallback apenas para desenvolvimento inicial.
        // Elas DEVEM ser alteradas através da interface de administração assim que o sistema for configurado.
        return { username: "admin_user_placeholder", password: "ChangeThisDefaultP@$$wOrd!" };
      }
    } catch (error) {
      console.error("Erro ao buscar credenciais de admin via googleSheetsService. Usando placeholder credentials:", error);
      // ATENÇÃO: Estas são credenciais de fallback apenas para desenvolvimento inicial.
      // Elas DEVEM ser alteradas através da interface de administração assim que o sistema for configurado.
      return { username: "admin_user_placeholder", password: "ChangeThisDefaultP@$$wOrd!" };
    }
  }

  verifyAccess(requiredRole?: string): boolean {
    if (!this.currentUser) return false
    if (requiredRole && this.currentUser.role !== requiredRole) {
      return false
    }
    return true
  }

  async getCompanySettings() {
    if (typeof window === "undefined") {
      return { name: "Workshop Manager", address: "Rua das Flores, 123", phone: "(11) 99999-9999", email: "contato@oficina.com", cnpj: "12.345.678/0001-90", logo: "", primaryColor: "#3b82f6", secondaryColor: "#64748b" }
    }
    const saved = localStorage.getItem("companySettings")
    if (saved) {
      try { return JSON.parse(saved) } catch (e) { console.error("Erro ao analisar configurações da empresa:", e) }
    }
    return { name: "Workshop Manager", address: "Rua das Flores, 123", phone: "(11) 99999-9999", email: "contato@oficina.com", cnpj: "12.345.678/0001-90", logo: "", primaryColor: "#3b82f6", secondaryColor: "#64748b" }
  }

  async saveCompanySettings(settings: any) {
    try {
      localStorage.setItem("companySettings", JSON.stringify(settings))
      console.log("Configurações da empresa salvas:", settings)
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("companySettingsChanged", { detail: settings }))
      }
      return true
    } catch (e) { console.error("Erro ao salvar configurações da empresa:", e); return false }
  }
}

export const authService = new AuthService()

// NOTA SOBRE PERSISTÊNCIA DE DADOS COM LOCALSTORAGE:
// Através do `googleSheetsService`, este sistema agora usa o `localStorage` do navegador
// para persistir dados da aplicação (simulando o que viria do Google Sheets).
//
// É importante estar ciente das seguintes limitações do `localStorage`:
// 1. Dados Específicos do Navegador/Dispositivo: Os dados são armazenados localmente no navegador
//    do usuário e não são compartilhados entre diferentes navegadores, dispositivos ou usuários.
// 2. Limite de Armazenamento: Existe um limite de tamanho para o `localStorage` (geralmente 5-10MB),
//    o que pode ser insuficiente para grandes volumes de dados.
// 3. Acesso e Modificação pelo Cliente: Os dados no `localStorage` podem ser facilmente
//    inspecionados e modificados pelo usuário através das ferramentas de desenvolvedor do navegador.
//    Portanto, não é adequado para armazenar dados altamente sensíveis ou que não devam ser alterados pelo cliente.
// 4. Sincronização: Não há sincronização automática de dados entre diferentes sessões ou dispositivos.
//
// Para aplicações que requerem compartilhamento de dados, maior capacidade, segurança robusta de dados
// ou funcionalidades offline mais complexas, uma solução de backend com um banco de dados dedicado
// é a abordagem recomendada.
