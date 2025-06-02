# Contratos da API Frontend-Backend para Integração com Google Sheets

**IMPORTANTE:** A implementação do frontend descrita em outras partes deste projeto (ex: em `lib/google-sheets.ts` e componentes relacionados) depende da existência de um servidor backend que implemente fielmente estes contratos de API. Sem o backend correspondente, as funcionalidades de integração com Google Sheets não operarão.

Este documento define os contratos da API que o frontend espera que o backend implemente para a integração com o Google Sheets.

## Endpoints

### 1. Configurar ID da Planilha e Inicializar Abas

*   **Rota:** `POST /api/google-sheets/initialize_spreadsheet`
*   **Método:** `POST`
*   **Descrição:** Envia o ID da planilha Google para o backend. O backend deve salvar este ID (associado ao tenant/usuário, se aplicável, embora não especificado aqui) e então verificar a planilha no Google Sheets. Ele deve criar as abas necessárias (ex: "Clientes", "Funcionarios", "Veiculos", "Servicos", "Estoque", "Orcamentos", "Agendamentos", "Admin") se elas não existirem. Os nomes exatos das abas a serem criadas/verificadas devem ser pré-definidos no backend ou passados na configuração.
*   **Corpo da Requisição (JSON):**
    ```json
    {
      "spreadsheetId": "string_com_o_id_da_planilha"
    }
    ```
*   **Resposta de Sucesso (200 OK - JSON):**
    ```json
    {
      "success": true,
      "message": "Planilha configurada e abas inicializadas com sucesso.",
      "verifiedSheets": [ // Lista de abas que foram verificadas/criadas
        { "title": "Clientes" },
        { "title": "Funcionarios" },
        // ... outras abas
      ]
    }
    ```
*   **Resposta de Erro (ex: 400, 500 - JSON):**
    ```json
    {
      "success": false,
      "message": "Mensagem de erro detalhada."
    }
    ```

### 2. Ler Dados de uma Aba Específica

*   **Rota:** `GET /api/google-sheets/sheet/{sheetName}`
    *   `{sheetName}`: O nome exato da aba (ex: "Clientes", "Funcionarios"). O nome deve ser URL-encoded pelo frontend.
*   **Método:** `GET`
*   **Descrição:** Solicita todos os dados de uma aba específica da planilha configurada. O backend deve garantir que o `spreadsheetId` já foi configurado.
*   **Corpo da Requisição:** N/A
*   **Resposta de Sucesso (200 OK - JSON):**
    ```json
    {
      "success": true,
      "sheetName": "NomeDaAbaRetornada",
      "data": [ // Array de arrays representando as linhas e colunas
        ["Cabecalho1", "Cabecalho2", "Cabecalho3"],
        ["DadoLinha1Col1", "DadoLinha1Col2", "DadoLinha1Col3"],
        ["DadoLinha2Col1", "DadoLinha2Col2", "DadoLinha2Col3"]
        // ... mais linhas
      ]
    }
    ```
*   **Resposta de Erro (ex: 400, 404, 500 - JSON):**
    ```json
    {
      "success": false,
      "message": "Mensagem de erro detalhada (ex: Aba não encontrada, Planilha não configurada)."
    }
    ```

### 3. Escrever Dados em uma Aba Específica

*   **Rota:** `POST /api/google-sheets/sheet/{sheetName}`
    *   `{sheetName}`: O nome exato da aba (ex: "Clientes", "Funcionarios"). O nome deve ser URL-encoded pelo frontend.
*   **Método:** `POST`
*   **Descrição:** Substitui todos os dados de uma aba específica pelos dados fornecidos. O backend deve garantir que o `spreadsheetId` já foi configurado. (Alternativamente, o backend pode implementar uma lógica de append ou update mais granular, mas para este contrato inicial, a substituição total é mais simples).
*   **Corpo da Requisição (JSON):**
    ```json
    {
      "data": [ // Array de arrays representando as linhas e colunas a serem escritas
        ["NovoCabecalho1", "NovoCabecalho2"],
        ["NovaLinha1Col1", "NovaLinha1Col2"]
        // ...
      ]
    }
    ```
*   **Resposta de Sucesso (200 OK - JSON):**
    ```json
    {
      "success": true,
      "message": "Dados escritos na aba '{sheetName}' com sucesso."
    }
    ```
*   **Resposta de Erro (ex: 400, 500 - JSON):**
    ```json
    {
      "success": false,
      "message": "Mensagem de erro detalhada."
    }
    ```

## Considerações Gerais

*   **Autenticação do Backend:** Estes contratos não especificam como o frontend se autentica com o backend. Assume-se que, se necessário, um mecanismo de autenticação (ex: tokens JWT enviados em headers `Authorization`) será implementado separadamente.
*   **Tratamento de Erros:** O backend deve fornecer mensagens de erro claras e códigos de status HTTP apropriados.
*   **Nomes das Abas:** Os nomes das abas usados nas rotas (`{sheetName}`) devem corresponder exatamente aos nomes das abas na Planilha Google. O frontend é responsável por fornecer os nomes corretos (possivelmente obtidos da configuração inicial ou de uma lista de nomes padrão).
*   **Codificação de URL:** Parâmetros de rota como `{sheetName}` devem ser URL-encoded pelo cliente (frontend) se contiverem caracteres especiais.
