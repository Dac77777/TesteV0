// Este serviço foi modificado para usar o `localStorage` do navegador como um mock
// para persistir dados, simulando o comportamento de uma planilha Google Sheets.
//
// Principais Características Atuais:
// - Persistência Local: Todos os dados são armazenados e lidos do `localStorage`.
// - Sem Comunicação Externa: Não há chamadas reais para as APIs do Google Sheets.
// - Configuração Simplificada: A interface `SheetsConfig` requer apenas `worksheetNames`.
//   `spreadsheetId` e `serviceAccountKey` foram removidos, pois não são mais utilizados.
//   A `serviceAccountKey`, em particular, foi removida para evitar a exposição de
//   credenciais sensíveis no lado do cliente, o que representaria um risco de segurança.
// - Mock de Dados Iniciais: Se nenhuma configuração ou dados forem encontrados no `localStorage`
//   para uma determinada planilha, dados de mock são usados para inicialização.
//
// IMPORTANTE PARA PRODUÇÃO:
// Para uma integração real e segura com o Google Sheets em um ambiente de produção:
// 1. Backend Obrigatório: Todas as interações com a API do Google Sheets (leitura, escrita,
//    autenticação) DEVEM ocorrer em um servidor backend seguro.
// 2. Autenticação Segura: Utilize OAuth 2.0 ou Contas de Serviço de forma segura no backend.
//    NUNCA exponha chaves de API, credenciais de conta de serviço ou tokens de acesso
//    no código do lado do cliente.
// 3. Validação e Sanitização: Todos os dados trocados com o Google Sheets devem ser
//    validados e sanitizados no backend.
//
// Esta implementação é estritamente para fins de desenvolvimento e demonstração,
// permitindo que a aplicação funcione offline e sem configuração complexa do Google Cloud.
"use client"

interface SheetsConfig {
  // spreadsheetId e serviceAccountKey não são mais usados, pois os dados são armazenados no localStorage.
  // A serviceAccountKey, em particular, foi removida para evitar riscos de segurança.
  worksheetNames: {
    clients: string
    vehicles: string
    services: string
    stock: string
    quotes: string
    appointments: string
    employees: string
    admin: string
  }
}

interface SheetsData {
  clients?: any[]
  vehicles?: any[]
  services?: any[]
  stock?: any[]
  quotes?: any[]
  appointments?: any[]
  employees?: any[]
  admin?: any[]
}

class GoogleSheetsService {
  private config: SheetsConfig | null = null
  // accessToken is no longer used.

  constructor() {
    // Load config from localStorage and initialize data if needed
    if (typeof window !== "undefined") {
      const savedConfig = localStorage.getItem("sheetsConfig")
      if (savedConfig) {
        try {
          const parsedConfig = JSON.parse(savedConfig)
          // Ensure only worksheetNames is kept if old config structure is found
          if (parsedConfig.worksheetNames) {
            this.config = { worksheetNames: parsedConfig.worksheetNames };
          } else {
            this.config = parsedConfig; // Assume it's already the new structure
          }

          // Save the potentially cleaned config back to localStorage
          localStorage.setItem("sheetsConfig", JSON.stringify(this.config));

          // Initialize localStorage for each worksheet if not already present
          if (this.config?.worksheetNames) {
            Object.values(this.config.worksheetNames).forEach(worksheetName => {
              if(typeof worksheetName === 'string') { // Ensure worksheetName is a string
                const storageKey = `google_sheets_mock_${worksheetName}`
                if (!localStorage.getItem(storageKey)) {
                  const mockData = this.getMockData(worksheetName)
                  localStorage.setItem(storageKey, JSON.stringify(mockData))
                }
              }
            })
          }
        } catch (error) {
          console.error("Failed to parse sheetsConfig from localStorage or initialize data:", error);
          localStorage.removeItem("sheetsConfig"); // Clear corrupted or old config
          this.config = null;
        }
      }
    }
  }

  // Removed authenticate() method as it's no longer needed for localStorage operations.

  async readSheet(worksheetName: string): Promise<any[]> {
    // Now reads directly from localStorage.
    if (typeof window === "undefined") {
      console.warn(`localStorage not available, returning mock data for ${worksheetName}.`)
      return this.getMockData(worksheetName)
    }
    try {
      const storageKey = `google_sheets_mock_${worksheetName}`
      const jsonData = localStorage.getItem(storageKey)
      if (jsonData) {
        return JSON.parse(jsonData)
      }
      console.warn(`No data found in localStorage for ${worksheetName}, returning mock data.`)
      return this.getMockData(worksheetName) // Should have been seeded by constructor
    } catch (error) {
      console.error(`Failed to read or parse sheet "${worksheetName}" from localStorage:`, error)
      return this.getMockData(worksheetName) // Fallback
    }
  }

  async writeSheet(worksheetName: string, data: any[]): Promise<boolean> {
    // Now writes directly to localStorage.
    if (typeof window === "undefined") {
      console.warn(`localStorage not available, cannot write sheet ${worksheetName}.`)
      return false
    }
    try {
      const storageKey = `google_sheets_mock_${worksheetName}`
      localStorage.setItem(storageKey, JSON.stringify(data))
      return true
    } catch (error) {
      console.error(`Failed to write sheet "${worksheetName}" to localStorage:`, error)
      return false
    }
  }

  async syncData(localData: SheetsData): Promise<boolean> {
    // Syncs data by writing each sheet to localStorage. No authentication needed.
    if (!this.config || !this.config.worksheetNames) {
      if (typeof window !== "undefined" && !this.config) {
        const savedConfig = localStorage.getItem("sheetsConfig");
        if (savedConfig) {
          try {
            const parsedConfig = JSON.parse(savedConfig);
             if (parsedConfig.worksheetNames) {
               this.config = { worksheetNames: parsedConfig.worksheetNames };
             } else {
               this.config = parsedConfig;
             }
          } catch (e) { this.config = null; }
        }
      }
      if (!this.config || !this.config.worksheetNames) {
        console.error("Sheet names not configured for syncData.")
        return false;
      }
    }

    try {
      const syncPromises = []
      const worksheetKeys = Object.keys(this.config.worksheetNames) as Array<keyof SheetsConfig["worksheetNames"]>;

      for (const key of worksheetKeys) {
        const sheetKey = key as keyof SheetsData; // e.g. "clients"
        const worksheetName = this.config.worksheetNames[key]; // e.g. "Clientes"

        if (localData[sheetKey] && typeof worksheetName === 'string') {
          // @ts-ignore
          syncPromises.push(this.writeSheet(worksheetName, localData[sheetKey]));
        }
      }

      const results = await Promise.all(syncPromises)
      const allSucceeded = results.every(result => result)

      if (allSucceeded && typeof window !== "undefined") {
        localStorage.setItem("lastSync", new Date().toISOString())
      }
      return allSucceeded;
    } catch (error) {
      console.error("Sync failed:", error)
      return false
    }
  }

  async pullData(): Promise<SheetsData> {
    // Pulls all data by reading each sheet from localStorage. No authentication needed.
     if (!this.config || !this.config.worksheetNames) {
      if (typeof window !== "undefined" && !this.config) {
        const savedConfig = localStorage.getItem("sheetsConfig");
        if (savedConfig) {
          try {
            const parsedConfig = JSON.parse(savedConfig);
            if (parsedConfig.worksheetNames) {
              this.config = { worksheetNames: parsedConfig.worksheetNames };
            } else {
              this.config = parsedConfig;
            }
          } catch (e) { this.config = null; }
        }
      }
      if (!this.config || !this.config.worksheetNames) {
        console.error("Sheet names not configured for pullData.")
        return {};
      }
    }

    try {
      const data: SheetsData = {}
      const worksheetKeys = Object.keys(this.config.worksheetNames) as Array<keyof SheetsConfig["worksheetNames"]>

      for (const key of worksheetKeys) {
        const worksheetName = this.config.worksheetNames[key]
        if (typeof worksheetName === 'string') { // Ensure worksheetName is a string
          // @ts-ignore
          data[key as keyof SheetsData] = await this.readSheet(worksheetName)
        }
      }
      return data
    } catch (error) {
      console.error("Failed to pull data from localStorage:", error)
      throw error
    }
  }

  private getMockData(worksheetName: string): any[] {
    // This data is used to initially populate localStorage if it's empty.
    // Return mock data for demo purposes
    switch (worksheetName) {
      case "Clientes":
        return [
          ["ID", "Nome", "Email", "Telefone", "Endereço", "CPF"],
          [1, "João Silva", "joao@example.com", "(11) 98765-4321", "Rua A, 123", "123.456.789-00"],
          [2, "Maria Oliveira", "maria@example.com", "(11) 91234-5678", "Av. B, 456", "987.654.321-00"],
          [3, "Carlos Santos", "carlos@example.com", "(11) 99876-5432", "Rua C, 789", "456.789.123-00"],
        ]
      case "Veículos":
        return [
          ["ID", "Placa", "Marca", "Modelo", "Ano", "Cor", "Cliente"],
          [1, "ABC-1234", "Fiat", "Uno", "2018", "Branco", "João Silva"],
          [2, "DEF-5678", "Honda", "Civic", "2020", "Preto", "Maria Oliveira"],
        ]
      case "Funcionários":
        return [
          ["ID", "Nome", "Email", "Usuario", "Senha", "Ativo", "Data Criação"],
          ["func1", "José Mecânico", "jose@oficina.com", "jose", "123456", "true", "2023-01-01"],
          ["func2", "Ana Atendente", "ana@oficina.com", "ana", "123456", "true", "2023-01-01"],
        ]
      case "Admin":
        return [
          ["Usuario", "Senha", "Nome", "Email"],
          ["admin", "admin123", "Administrador", "admin@oficina.com"],
        ]
      default:
        return []
    }
  }

    // Return mock data for demo purposes
    // This data is used to initially populate localStorage if it's empty.
    switch (worksheetName) {
      case "Clientes":
        return [
          ["ID", "Nome", "Email", "Telefone", "Endereço", "CPF"],
          [1, "João Silva", "joao@example.com", "(11) 98765-4321", "Rua A, 123", "123.456.789-00"],
          [2, "Maria Oliveira", "maria@example.com", "(11) 91234-5678", "Av. B, 456", "987.654.321-00"],
          [3, "Carlos Santos", "carlos@example.com", "(11) 99876-5432", "Rua C, 789", "456.789.123-00"],
        ]
      case "Veículos":
        return [
          ["ID", "Placa", "Marca", "Modelo", "Ano", "Cor", "Cliente"],
          [1, "ABC-1234", "Fiat", "Uno", "2018", "Branco", "João Silva"],
          [2, "DEF-5678", "Honda", "Civic", "2020", "Preto", "Maria Oliveira"],
        ]
      case "Funcionários":
        return [
          ["ID", "Nome", "Email", "Usuario", "Senha", "Ativo", "Data Criação"],
          ["func1", "José Mecânico", "jose@oficina.com", "jose", "123456", "true", "2023-01-01"],
          ["func2", "Ana Atendente", "ana@oficina.com", "ana", "123456", "true", "2023-01-01"],
        ]
      case "Admin":
        return [
          ["Usuario", "Senha", "Nome", "Email"],
          ["admin", "admin123", "Administrador", "admin@oficina.com"],
        ]
      default:
        return [[`Mock Data for ${worksheetName}`]];
    }
  }

  isConfigured(): boolean {
    // Configuration now means that worksheetNames are defined.
    return !!(this.config && this.config.worksheetNames && Object.keys(this.config.worksheetNames).length > 0);
  }

  updateConfig(newConfig: SheetsConfig): void {
    // Updates only worksheetNames.
    const configToSave: SheetsConfig = {
      worksheetNames: newConfig.worksheetNames
    };

    this.config = configToSave;
    if (typeof window !== "undefined") {
      localStorage.setItem("sheetsConfig", JSON.stringify(configToSave));
      // Initialize localStorage for new worksheetNames if they don't exist.
      if (this.config?.worksheetNames) {
        Object.values(this.config.worksheetNames).forEach(worksheetName => {
          if (typeof worksheetName === 'string') { // Ensure worksheetName is a string
            const storageKey = `google_sheets_mock_${worksheetName}`;
            if (!localStorage.getItem(storageKey)) {
              const mockData = this.getMockData(worksheetName);
              localStorage.setItem(storageKey, JSON.stringify(mockData));
            }
          }
        });
      }
    }
  }
}

export const googleSheetsService = new GoogleSheetsService()
// Ensure SheetsConfig export reflects that it only contains worksheetNames
export type { SheetsConfig, SheetsData }
