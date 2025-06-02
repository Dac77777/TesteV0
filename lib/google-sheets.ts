/**
 * @file lib/google-sheets.ts
 * @description Este serviço atua como um cliente HTTP para interagir com a API de backend
 *              dedicada ao Google Sheets. Ele é responsável por fazer chamadas para os endpoints
 *              do backend que, por sua vez, se comunicam com a API real do Google Sheets.
 *              Este serviço NÃO contém lógica de interação direta com a API do Google Sheets
 *              nem gerencia dados localmente (exceto o `configuredSpreadsheetId` para persistência da sessão).
 *              As operações e estruturas de dados esperadas são definidas em `docs/api_contracts.md`.
 */
"use client"

// Interface para a resposta da API ao inicializar a planilha
export interface InitializeSpreadsheetResponse {
  success: boolean;
  message?: string;
  verifiedSheets?: Array<{ title: string }>;
}

// Interface para a resposta da API ao ler dados de uma aba
export interface ReadSheetApiResponse {
  success: boolean;
  sheetName?: string;
  data?: any[][];
  message?: string;
}

// Interface para a resposta da API ao escrever dados em uma aba
export interface WriteSheetApiResponse {
  success: boolean;
  message?: string;
}

class GoogleSheetsService {
  private configuredSpreadsheetId: string | null = null;
  
  private sheetNameMap: { [key: string]: string } = {
    clients: "Clientes",
    vehicles: "Veiculos",
    services: "Servicos",
    stock: "Estoque",
    quotes: "Orcamentos",
    appointments: "Agendamentos",
    employees: "Funcionarios",
    admin: "Admin"
  };

  constructor() {
    if (typeof window !== "undefined") {
        const savedSpreadsheetId = localStorage.getItem("configuredSpreadsheetId");
        if (savedSpreadsheetId) {
            this.configuredSpreadsheetId = savedSpreadsheetId;
        }
    }
  }

  /**
   * Define o ID da planilha configurada e o persiste no localStorage do serviço.
   * @param {string | null} id - O ID da planilha a ser definido. Null para limpar.
   */
  public setSpreadsheetId(id: string | null): void {
    this.configuredSpreadsheetId = id;
    if (typeof window !== "undefined") {
        if (id === null) {
            localStorage.removeItem("configuredSpreadsheetId");
        } else {
            localStorage.setItem("configuredSpreadsheetId", id);
        }
    }
    console.log(`Spreadsheet ID set to: ${id}`);
  }

  /**
   * Obtém o ID da planilha configurada do localStorage do serviço.
   * @returns {string | null} O ID da planilha configurada ou null se não estiver definido.
   */
  public getSpreadsheetId(): string | null {
    // Garante que estamos lendo o valor mais recente do localStorage, 
    // especialmente se outro objeto GoogleSheetsService pudesse ter sido instanciado (embora seja um singleton).
    if (typeof window !== "undefined") {
        return localStorage.getItem("configuredSpreadsheetId");
    }
    return this.configuredSpreadsheetId; // Fallback para SSR ou se localStorage não estiver disponível no momento da chamada
  }
  
  /**
   * Verifica se o ID da planilha foi configurado.
   * @returns {boolean} True se o ID estiver configurado, false caso contrário.
   */
  public isConfigured(): boolean {
    return this.getSpreadsheetId() !== null;
  }

  /**
   * Inicia a configuração da planilha no backend, verificando/criando abas.
   * @param {string} id - O ID da planilha Google.
   * @returns {Promise<InitializeSpreadsheetResponse>} A resposta do backend.
   */
  async initializeSpreadsheet(id: string): Promise<InitializeSpreadsheetResponse> {
    this.setSpreadsheetId(id); 

    try {
      const response = await fetch("/api/google-sheets/initialize_spreadsheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ spreadsheetId: id }),
      });

      const jsonResponse: InitializeSpreadsheetResponse = await response.json();
      if (!response.ok || !jsonResponse.success) {
        console.error("Falha ao inicializar planilha no backend:", jsonResponse.message);
      } else {
        console.log("Planilha inicializada com sucesso no backend:", jsonResponse.message);
      }
      return jsonResponse;
    } catch (error) {
      console.error("Erro de rede ou ao parsear JSON ao inicializar planilha:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido na comunicação com o backend.",
      };
    }
  }

  /**
   * Retorna o nome real da aba baseado na chave lógica fornecida.
   * @param {string} key - A chave lógica da aba (ex: 'clients', 'employees').
   * @returns {string | undefined} O nome real da aba ou undefined se a chave não for encontrada.
   */
  public getWorksheetName(key: string): string | undefined {
    return this.sheetNameMap[key];
  }

  /**
   * Busca os dados de uma aba específica do backend.
   * @param {string} sheetNameKey - A chave lógica da aba (ex: 'clients', 'employees').
   * @returns {Promise<any[][] | null>} Um array de arrays com os dados da aba, ou null em caso de erro.
   */
  async readSheetData(sheetNameKey: string): Promise<any[][] | null> {
    if (!this.isConfigured()) {
      console.error("Spreadsheet ID não configurado. Chame initializeSpreadsheet primeiro.");
      return null;
    }

    const actualSheetName = this.getWorksheetName(sheetNameKey);
    if (!actualSheetName) {
        console.error(`Nome da aba para a chave "${sheetNameKey}" não encontrado no mapeamento.`);
        return null;
    }

    try {
      const response = await fetch(`/api/google-sheets/sheet/${encodeURIComponent(actualSheetName)}`);
      const jsonResponse: ReadSheetApiResponse = await response.json();

      if (response.ok && jsonResponse.success && jsonResponse.data) {
        return jsonResponse.data;
      } else {
        console.error(`Falha ao ler dados da aba "${actualSheetName}":`, jsonResponse.message);
        return null;
      }
    } catch (error) {
      console.error(`Erro de rede ou ao parsear JSON ao ler aba "${actualSheetName}":`, error);
      return null;
    }
  }

  /**
   * Envia dados para substituir uma aba específica no backend.
   * @param {string} sheetNameKey - A chave lógica da aba (ex: 'clients', 'employees').
   * @param {any[][]} data - Os dados a serem escritos, incluindo cabeçalhos.
   * @returns {Promise<WriteSheetApiResponse>} A resposta do backend.
   */
  async writeSheetData(sheetNameKey: string, data: any[][]): Promise<WriteSheetApiResponse> {
    if (!this.isConfigured()) {
      console.error("Spreadsheet ID não configurado. Chame initializeSpreadsheet primeiro.");
      return { success: false, message: "Spreadsheet ID não configurado." };
    }

    const actualSheetName = this.getWorksheetName(sheetNameKey);
     if (!actualSheetName) {
        console.error(`Nome da aba para a chave "${sheetNameKey}" não encontrado no mapeamento.`);
        return { success: false, message: `Nome da aba para a chave "${sheetNameKey}" não encontrado.` };
    }

    try {
      const response = await fetch(`/api/google-sheets/sheet/${encodeURIComponent(actualSheetName)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });

      const jsonResponse: WriteSheetApiResponse = await response.json();
       if (!response.ok || !jsonResponse.success) {
         console.error(`Falha ao escrever dados na aba "${actualSheetName}" no backend:`, jsonResponse.message);
       }
      return jsonResponse;
    } catch (error) {
      console.error(`Erro de rede ou ao parsear JSON ao escrever na aba "${actualSheetName}":`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido na comunicação com o backend.",
      };
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
// As interfaces de resposta da API são exportadas para uso em outros lugares, se necessário.
// export type { InitializeSpreadsheetResponse, ReadSheetApiResponse, WriteSheetApiResponse }; // Já exportadas acima
