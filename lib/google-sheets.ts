"use client"

interface SheetsConfig {
  spreadsheetId: string
  serviceAccountKey: string
  worksheetNames: {
    clients: string
    vehicles: string
    services: string
    stock: string
    quotes: string
    appointments: string
  }
}

interface SheetsData {
  clients?: any[]
  vehicles?: any[]
  services?: any[]
  stock?: any[]
  quotes?: any[]
  appointments?: any[]
}

class GoogleSheetsService {
  private config: SheetsConfig | null = null
  private accessToken: string | null = null

  constructor() {
    // Load config from localStorage
    if (typeof window !== "undefined") {
      const savedConfig = localStorage.getItem("sheetsConfig")
      if (savedConfig) {
        this.config = JSON.parse(savedConfig)
      }
    }
  }

  async authenticate(): Promise<boolean> {
    if (!this.config?.serviceAccountKey) {
      throw new Error("Service account key not configured")
    }

    try {
      // In a real implementation, you would use the Google Auth library
      // For this demo, we'll simulate the authentication
      const serviceAccount = JSON.parse(this.config.serviceAccountKey)

      // Simulate JWT token creation and exchange
      // In production, use: google-auth-library or similar
      this.accessToken = "simulated_access_token"

      return true
    } catch (error) {
      console.error("Authentication failed:", error)
      return false
    }
  }

  async readSheet(worksheetName: string): Promise<any[]> {
    if (!this.config?.spreadsheetId || !this.accessToken) {
      throw new Error("Not authenticated or configured")
    }

    try {
      // Simulate API call to Google Sheets
      // In production, use the Google Sheets API v4
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${worksheetName}`

      // For demo purposes, return mock data
      return this.getMockData(worksheetName)
    } catch (error) {
      console.error("Failed to read sheet:", error)
      throw error
    }
  }

  async writeSheet(worksheetName: string, data: any[]): Promise<boolean> {
    if (!this.config?.spreadsheetId || !this.accessToken) {
      throw new Error("Not authenticated or configured")
    }

    try {
      // Simulate API call to Google Sheets
      // In production, use the Google Sheets API v4
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${worksheetName}`

      // For demo purposes, just log the data
      console.log(`Writing to ${worksheetName}:`, data)

      return true
    } catch (error) {
      console.error("Failed to write sheet:", error)
      throw error
    }
  }

  async syncData(localData: SheetsData): Promise<boolean> {
    if (!this.config) {
      throw new Error("Google Sheets not configured")
    }

    try {
      await this.authenticate()

      // Sync each data type
      const syncPromises = []

      if (localData.clients) {
        syncPromises.push(this.writeSheet(this.config.worksheetNames.clients, localData.clients))
      }

      if (localData.vehicles) {
        syncPromises.push(this.writeSheet(this.config.worksheetNames.vehicles, localData.vehicles))
      }

      if (localData.services) {
        syncPromises.push(this.writeSheet(this.config.worksheetNames.services, localData.services))
      }

      if (localData.stock) {
        syncPromises.push(this.writeSheet(this.config.worksheetNames.stock, localData.stock))
      }

      if (localData.quotes) {
        syncPromises.push(this.writeSheet(this.config.worksheetNames.quotes, localData.quotes))
      }

      if (localData.appointments) {
        syncPromises.push(this.writeSheet(this.config.worksheetNames.appointments, localData.appointments))
      }

      await Promise.all(syncPromises)

      // Update last sync time
      localStorage.setItem("lastSync", new Date().toISOString())

      return true
    } catch (error) {
      console.error("Sync failed:", error)
      throw error
    }
  }

  async pullData(): Promise<SheetsData> {
    if (!this.config) {
      throw new Error("Google Sheets not configured")
    }

    try {
      await this.authenticate()

      const data: SheetsData = {}

      // Pull data from each worksheet
      data.clients = await this.readSheet(this.config.worksheetNames.clients)
      data.vehicles = await this.readSheet(this.config.worksheetNames.vehicles)
      data.services = await this.readSheet(this.config.worksheetNames.services)
      data.stock = await this.readSheet(this.config.worksheetNames.stock)
      data.quotes = await this.readSheet(this.config.worksheetNames.quotes)
      data.appointments = await this.readSheet(this.config.worksheetNames.appointments)

      return data
    } catch (error) {
      console.error("Failed to pull data:", error)
      throw error
    }
  }

  private getMockData(worksheetName: string): any[] {
    // Return mock data for demo purposes
    switch (worksheetName) {
      case "Clientes":
        return [
          ["ID", "Nome", "Email", "Telefone", "Endereço"],
          [1, "João Silva", "joao@example.com", "(11) 98765-4321", "Rua A, 123"],
          [2, "Maria Oliveira", "maria@example.com", "(11) 91234-5678", "Av. B, 456"],
        ]
      case "Veículos":
        return [
          ["ID", "Placa", "Marca", "Modelo", "Ano", "Cor", "Cliente"],
          [1, "ABC-1234", "Fiat", "Uno", "2018", "Branco", "João Silva"],
          [2, "DEF-5678", "Honda", "Civic", "2020", "Preto", "Maria Oliveira"],
        ]
      default:
        return []
    }
  }

  isConfigured(): boolean {
    return !!(this.config?.spreadsheetId && this.config?.serviceAccountKey)
  }

  updateConfig(config: SheetsConfig): void {
    this.config = config
    localStorage.setItem("sheetsConfig", JSON.stringify(config))
  }
}

export const googleSheetsService = new GoogleSheetsService()
export type { SheetsConfig, SheetsData }
