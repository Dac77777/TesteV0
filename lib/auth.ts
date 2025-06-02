// VISÃO GERAL DESTE ARQUIVO (lib/auth.ts):
// Este arquivo gerencia a autenticação e o gerenciamento básico de usuários (clientes, funcionários, admin).
//
// Principais Modificações Recentes:
// - Dependência do `googleSheetsService`: Para leitura e escrita de dados de usuários, este serviço
//   agora depende do `googleSheetsService` (que foi refatorado para interagir com um backend).
// - Geração de Token: A função `generateToken` foi modificada para simular uma estrutura JWT,
//   mas permanece insegura para produção.
// - Credenciais de Admin Padrão: As credenciais de admin de fallback foram alteradas para valores
//   menos óbvios e com avisos.
//
// Para limitações sobre o uso do localStorage (para currentUser, tokenTimestamp), veja o comentário no final.
// Para recomendações críticas sobre senhas, veja o comentário abaixo.
"use client"

import type { User } from "@/types/user"
import { googleSheetsService } from "./google-sheets" // Importa o serviço refatorado

// RECOMENDAÇÃO CRÍTICA DE SEGURANÇA PARA PRODUÇÃO:
// As senhas NUNCA devem ser armazenadas ou comparadas em texto plano.
// Em produção:
// 1. HASHEAR senhas com algoritmos fortes (bcrypt, Argon2).
// 2. Comparar hashes, não senhas em texto.
class AuthService {
  private currentUser: User | null = null
  private tokenExpiryTime: number = 8 * 60 * 60 * 1000 // 8 horas

  // Cabeçalhos padrão para as planilhas (usados ao recriar dados para escrita)
  private employeeSheetHeaders = ["ID", "Nome", "Email", "Usuario", "Senha", "Ativo", "Data Criação"];
  private adminSheetHeaders = ["Usuario", "Senha", "Nome", "Email"];
  private clientSheetHeaders = ["ID", "Nome", "Email", "Telefone", "Endereço", "CPF"];


  constructor() {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("currentUser")
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser)
        const tokenTimestamp = localStorage.getItem("tokenTimestamp")
        if (tokenTimestamp && (Date.now() - Number.parseInt(tokenTimestamp, 10) > this.tokenExpiryTime)) {
          this.logout()
        }
      }
    }
  }

  async loginCliente(cpf: string): Promise<User | null> {
    if (!googleSheetsService.isConfigured()) {
      console.warn("Serviço Google Sheets não configurado para login de cliente.");
      return null;
    }
    try {
      const clientData = await googleSheetsService.readSheetData('clients');
      if (clientData && clientData.length > 1) { // Linha 0 é cabeçalho
        // Assumindo que CPF está na coluna de índice 5 (sexta coluna)
        const clientRow = clientData.slice(1).find((row: any[]) => row[5] === cpf);
        if (clientRow) {
          const user: User = {
            id: clientRow[0]?.toString() || `client_${Date.now()}`,
            name: clientRow[1],
            cpf: clientRow[5],
            email: clientRow[2],
            role: "cliente",
            createdAt: new Date().toISOString(), // Pode vir da planilha se existir
            isActive: true, // Pode vir da planilha se existir
          };
          this.setCurrentUser(user);
          return user;
        }
      }
    } catch (error) {
      console.error("Erro ao buscar cliente via googleSheetsService:", error);
    }
    return null;
  }

  async loginEmployee(username: string, password: string): Promise<User | null> {
    if (!googleSheetsService.isConfigured()) {
      console.warn("Serviço Google Sheets não configurado para login de funcionário.");
      return null;
    }
    try {
      const employeeData = await googleSheetsService.readSheetData('employees');
      if (employeeData && employeeData.length > 1) {
        // Colunas: ID, Nome, Email, Usuario, Senha, Ativo, Data Criação
        const employeeRow = employeeData.slice(1).find(
          (row: any[]) => row[3] === username && row[4] === password && row[5] === "true",
        );
        if (employeeRow) {
          const user: User = {
            id: employeeRow[0],
            name: employeeRow[1],
            email: employeeRow[2],
            username: employeeRow[3],
            role: "funcionario",
            password: employeeRow[4], // Apenas para o objeto User, não para re-armazenar em texto claro
            isActive: employeeRow[5] === "true",
            createdAt: employeeRow[6] || new Date().toISOString(),
          };
          this.setCurrentUser(user);
          return user;
        }
      }
    } catch (error) {
      console.error("Erro ao buscar funcionário via googleSheetsService:", error);
    }
    return null;
  }

  async loginAdmin(username: string, password: string): Promise<User | null> {
     if (!googleSheetsService.isConfigured()) {
      console.warn("Serviço Google Sheets não configurado para login de admin.");
      return null;
    }
    try {
      const adminSheetData = await googleSheetsService.readSheetData('admin');
      if (adminSheetData && adminSheetData.length > 1) {
        // Colunas: Usuario, Senha, Nome, Email
        const adminRow = adminSheetData.slice(1).find((row: any[]) => row[0] === username && row[1] === password);
        if (adminRow) {
          const user: User = {
            id: "admin_" + (adminRow[0] || Date.now().toString()),
            name: adminRow[2] || "Administrador",
            email: adminRow[3] || "admin@oficina.com",
            username: adminRow[0],
            role: "admin",
            createdAt: new Date().toISOString(),
            isActive: true,
          };
          this.setCurrentUser(user);
          return user;
        }
      }
    } catch (error) {
      console.error("Erro ao buscar admin via googleSheetsService:", error);
    }
    return null;
  }

  async login(usernameOrCpf: string, password?: string): Promise<User | null> {
    if (!googleSheetsService.isConfigured()){
        const spreadsheetId = googleSheetsService.getSpreadsheetId();
        if(!spreadsheetId) {
            console.error("ID da Planilha não configurado no googleSheetsService.");
            // Tentar carregar do localStorage do googleSheetsService, se existir
            // Esta é uma tentativa de recuperação, idealmente o ID é configurado na inicialização do app.
            const storedId = typeof window !== "undefined" ? localStorage.getItem("configuredSpreadsheetId") : null;
            if (storedId) {
                await googleSheetsService.initializeSpreadsheet(storedId);
                 if (!googleSheetsService.isConfigured()){ // Verifica novamente após tentativa de inicialização
                    return null;
                 }
            } else {
                 return null;
            }
        }
    }

    if (!password) {
      return await this.loginCliente(usernameOrCpf);
    }
    const adminUser = await this.loginAdmin(usernameOrCpf, password);
    if (adminUser) return adminUser;
    
    const employeeUser = await this.loginEmployee(usernameOrCpf, password);
    if (employeeUser) return employeeUser;
    
    return null;
  }

  private setCurrentUser(user: User): void {
    this.currentUser = user;
    if (typeof window !== "undefined") {
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("tokenTimestamp", Date.now().toString());
      this.setCookie("auth_token", this.generateToken(user), this.tokenExpiryTime / 1000);
      this.setCookie("user_role", user.role, this.tokenExpiryTime / 1000);
    }
  }
  
  private generateToken(user: User): string {
    const header = { alg: "HS256_MOCK", typ: "JWT_MOCK" };
    const payload = {
      id: user.id, role: user.role, name: user.name || user.username,
      iat: Date.now(), exp: Date.now() + this.tokenExpiryTime,
    };
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const mockSignature = "mock_signature_generated_client_side_not_secure";
    return `${encodedHeader}.${encodedPayload}.${mockSignature}`;
  }

  private setCookie(name: string, value: string, maxAge: number): void {
    if (typeof document !== "undefined") {
      document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Strict; Secure`;
    }
  }

  private deleteCookie(name: string): void {
    if (typeof document !== "undefined") {
      document.cookie = `${name}=; path=/; max-age=0; SameSite=Strict; Secure`;
    }
  }

  logout(): void {
    this.currentUser = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("tokenTimestamp");
      this.deleteCookie("auth_token");
      this.deleteCookie("user_role");
    }
  }

  getCurrentUser(): User | null { return this.currentUser; }

  hasPermission(permission: string): boolean {
    if (!this.currentUser) return false;
    const permissions: { [key: string]: string[] } = {
      cliente: ["view_own_services", "view_own_history"],
      funcionario: [
        "view_services", "create_services", "edit_services",
        "view_clients", "create_clients", "edit_clients",
        "view_vehicles", "create_vehicles", "edit_vehicles",
      ],
      admin: ["*"],
    };
    const userPermissions = permissions[this.currentUser.role] || [];
    return userPermissions.includes("*") || userPermissions.includes(permission);
  }

  private async getEmployees(): Promise<User[]> {
    if (!googleSheetsService.isConfigured()) return [];
    const employeeRows = await googleSheetsService.readSheetData('employees');
    if (employeeRows && employeeRows.length > 1) {
      return employeeRows.slice(1).map((row: any[]) => ({
        id: row[0], name: row[1], email: row[2], username: row[3],
        password: row[4], role: "funcionario" as const,
        isActive: row[5] === "true", createdAt: row[6] || new Date().toISOString(),
      }));
    }
    return [];
  }

  async getEmployeesList(): Promise<User[]> {
    return await this.getEmployees();
  }

  async addEmployee(employee: Omit<User, "id" | "createdAt" | "role">): Promise<void> {
    if (!googleSheetsService.isConfigured()) {
        console.error("Serviço Google Sheets não configurado para adicionar funcionário.");
        return;
    }
    const employees = await this.getEmployees();
    const newEmployee: User = {
      ...employee,
      id: `func_${Date.now()}`,
      role: "funcionario",
      createdAt: new Date().toISOString(),
    };
    employees.push(newEmployee);
    const dataToWrite = [
      this.employeeSheetHeaders,
      ...employees.map(emp => [
        emp.id, emp.name, emp.email || "", emp.username || emp.name.toLowerCase().replace(/\s+/g, ""),
        emp.password || "", emp.isActive?.toString() || "false", emp.createdAt
      ])
    ];
    await googleSheetsService.writeSheetData('employees', dataToWrite);
  }

  async updateEmployee(id: string, updates: Partial<User>): Promise<void> {
    if (!googleSheetsService.isConfigured()) {
        console.error("Serviço Google Sheets não configurado para atualizar funcionário.");
        return;
    }
    let employees = await this.getEmployees();
    const index = employees.findIndex((e) => e.id === id);
    if (index !== -1) {
      employees[index] = { ...employees[index], ...updates };
      const dataToWrite = [
        this.employeeSheetHeaders,
        ...employees.map(emp => [
          emp.id, emp.name, emp.email || "", emp.username || emp.name.toLowerCase().replace(/\s+/g, ""),
          emp.password || "", emp.isActive?.toString() || "false", emp.createdAt
        ])
      ];
      await googleSheetsService.writeSheetData('employees', dataToWrite);
    }
  }

  async deleteEmployee(id: string): Promise<void> {
    if (!googleSheetsService.isConfigured()) {
        console.error("Serviço Google Sheets não configurado para deletar funcionário.");
        return;
    }
    let employees = await this.getEmployees();
    const filteredEmployees = employees.filter((e) => e.id !== id);
    const dataToWrite = [
      this.employeeSheetHeaders,
      ...filteredEmployees.map(emp => [
        emp.id, emp.name, emp.email || "", emp.username || emp.name.toLowerCase().replace(/\s+/g, ""),
        emp.password || "", emp.isActive?.toString() || "false", emp.createdAt
      ])
    ];
    await googleSheetsService.writeSheetData('employees', dataToWrite);
  }

  async updateAdminCredentials(newUsername: string, newPassword: string): Promise<boolean> {
    if (!googleSheetsService.isConfigured()) {
      console.error("Serviço Google Sheets não configurado para atualizar credenciais de admin.");
      return false;
    }
    try {
      const adminSheetData = await googleSheetsService.readSheetData('admin');
      let adminRowToUpdate: any[];
      let currentData: any[][] = [];

      if (adminSheetData && adminSheetData.length > 1 && adminSheetData[1] && adminSheetData[1].length > 0) {
        // Se existe linha de admin, usa ela. Preserva outros campos se houver.
        adminRowToUpdate = [...adminSheetData[1]]; 
        currentData = [this.adminSheetHeaders, ...adminSheetData.slice(1)]; // Mantém outros admins se houver
        const adminIndex = currentData.slice(1).findIndex(row => row[0] === (this.currentUser?.username || adminRowToUpdate[0])); // Tenta encontrar pelo user logado ou pelo user da linha lida
        if (adminIndex !== -1) {
            currentData[adminIndex + 1][0] = newUsername;
            currentData[adminIndex + 1][1] = newPassword;
        } else { // Se não encontrar (improvável se só tem 1 admin), atualiza a primeira linha de dados
            currentData[1][0] = newUsername;
            currentData[1][1] = newPassword;
        }

      } else {
        // Se não há dados de admin (só cabeçalho ou vazia), cria uma nova linha
        adminRowToUpdate = [newUsername, newPassword, "Administrador", "admin@oficina.com"];
        currentData = [this.adminSheetHeaders, adminRowToUpdate];
      }
      
      await googleSheetsService.writeSheetData('admin', currentData);
      
      if (this.currentUser && this.currentUser.role === "admin") {
        this.currentUser.username = newUsername;
        this.setCurrentUser(this.currentUser);
      }
      console.log("Credenciais de admin atualizadas via backend.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("adminCredentialsChanged", { detail: { username: newUsername } }));
      }
      return true;
    } catch (error) {
      console.error("Erro ao atualizar credenciais de admin:", error);
      return false;
    }
  }

  async getAdminCredentials(): Promise<{ username?: string; password?: string; name?: string; email?: string } | null> {
    if (!googleSheetsService.isConfigured()) {
       console.warn("Serviço Google Sheets não configurado para obter credenciais de admin.");
       // ATENÇÃO: Credenciais de fallback. Mudar em produção.
       return { username: "admin_user_placeholder", password: "ChangeThisDefaultP@$$wOrd!" };
    }
    try {
      const adminSheetData = await googleSheetsService.readSheetData('admin');
      if (adminSheetData && adminSheetData.length > 1 && adminSheetData[1] && adminSheetData[1][0]) {
        const adminRow = adminSheetData[1]; // Assume a primeira linha de dados é o admin principal
        return {
          username: adminRow[0], password: adminRow[1],
          name: adminRow[2], email: adminRow[3],
        };
      } else {
        console.warn("Nenhum usuário admin encontrado na planilha. Usando credenciais de placeholder.");
        // ATENÇÃO: Estas são credenciais de fallback apenas para desenvolvimento inicial.
        // Elas DEVEM ser alteradas através da interface de administração assim que o sistema for configurado.
        return { username: "admin_user_placeholder", password: "ChangeThisDefaultP@$$wOrd!" };
      }
    } catch (error) {
      console.error("Erro ao buscar credenciais de admin. Usando placeholder credentials:", error);
      // ATENÇÃO: Estas são credenciais de fallback apenas para desenvolvimento inicial.
      // Elas DEVEM ser alteradas através da interface de administração assim que o sistema for configurado.
      return { username: "admin_user_placeholder", password: "ChangeThisDefaultP@$$wOrd!" };
    }
  }

  verifyAccess(requiredRole?: string): boolean {
    if (!this.currentUser) return false;
    if (requiredRole && this.currentUser.role !== requiredRole) return false;
    return true;
  }

  async getCompanySettings() {
    if (typeof window === "undefined") {
      return { name: "Workshop Manager", address: "Rua das Flores, 123", phone: "(11) 99999-9999", email: "contato@oficina.com", cnpj: "12.345.678/0001-90", logo: "", primaryColor: "#3b82f6", secondaryColor: "#64748b" };
    }
    const saved = localStorage.getItem("companySettings");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error("Erro ao analisar configurações da empresa:", e); }
    }
    return { name: "Workshop Manager", address: "Rua das Flores, 123", phone: "(11) 99999-9999", email: "contato@oficina.com", cnpj: "12.345.678/0001-90", logo: "", primaryColor: "#3b82f6", secondaryColor: "#64748b" };
  }

  async saveCompanySettings(settings: any) {
    try {
      localStorage.setItem("companySettings", JSON.stringify(settings));
      console.log("Configurações da empresa salvas:", settings);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("companySettingsChanged", { detail: settings }));
      }
      return true;
    } catch (e) { console.error("Erro ao salvar configurações da empresa:", e); return false; }
  }
}

export const authService = new AuthService();

// NOTA SOBRE PERSISTÊNCIA DE DADOS COM LOCALSTORAGE:
// Este arquivo ainda usa localStorage para `currentUser`, `tokenTimestamp` e `companySettings`.
// O `googleSheetsService` foi modificado para interagir com um backend, mas o AuthService
// mantém alguns estados/configurações no localStorage do navegador.
//
// Limitações do `localStorage`:
// 1. Específico do Navegador/Dispositivo.
// 2. Limite de Armazenamento (5-10MB).
// 3. Acesso e Modificação pelo Cliente (não seguro para dados sensíveis não criptografados).
// 4. Sem sincronização automática.
//
// Para aplicações mais robustas, considere gerenciar o estado da sessão e configurações
// de forma mais segura, possivelmente com tokens de sessão gerenciados por HTTP-only cookies
// e configurações de usuário/empresa obtidas de um backend após o login.
