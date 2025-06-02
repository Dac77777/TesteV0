/**
 * @file components/admin/google-sheets-config.tsx
 * @description Este componente React (Client Component) fornece a interface do usuário para
 *              o administrador configurar a integração com o Google Sheets. Ele permite inserir
 *              o ID da planilha (Spreadsheet ID) e disparar o processo de inicialização
 *              (que envolve uma chamada ao backend para verificar/criar as abas necessárias).
 *              Utiliza o `useGoogleSheetsSettings` para acessar e atualizar o estado global
 *              da configuração e o `googleSheetsService` para as chamadas à API do backend.
 */
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { googleSheetsService, InitializeSpreadsheetResponse } from '@/lib/google-sheets';
import { useGoogleSheetsSettings } from '@/contexts/google-sheets-settings-context'; 

export function GoogleSheetsConfig() {
  const [spreadsheetIdInput, setSpreadsheetIdInput] = useState<string>('');
  const { 
    spreadsheetId: currentSpreadsheetId, 
    isLoadingConfig, 
    refreshConfig, 
    setContextSpreadsheetId 
  } = useGoogleSheetsSettings();

  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    if (currentSpreadsheetId) {
      setSpreadsheetIdInput(currentSpreadsheetId);
    } else {
      setSpreadsheetIdInput(''); 
    }
  }, [currentSpreadsheetId]);

  const handleInitialize = async () => {
    setIsInitializing(true);
    setMessage('');
    setMessageType('');

    if (!spreadsheetIdInput.trim()) {
        setMessage('O ID da Planilha não pode estar vazio.');
        setMessageType('error');
        setIsInitializing(false);
        return;
    }

    try {
      const response: InitializeSpreadsheetResponse = await googleSheetsService.initializeSpreadsheet(spreadsheetIdInput);

      if (response.success) {
        setContextSpreadsheetId(spreadsheetIdInput); 
        setMessage(response.message || 'Planilha inicializada com sucesso pelo backend!');
        setMessageType('success');
      } else {
        setMessage(response.message || 'Falha ao inicializar planilha no backend.');
        setMessageType('error');
      }
    } catch (error) {
      console.error("Erro ao chamar initializeSpreadsheet:", error);
      setMessage(error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.');
      setMessageType('error');
    } finally {
      setIsInitializing(false);
    }
  };
  
  const handleRefreshContext = () => {
    refreshConfig();
  };

  if (isLoadingConfig) {
    return (
      <Card>
        <CardHeader><CardTitle>Configuração do Google Sheets</CardTitle></CardHeader>
        <CardContent><p>Carregando configuração...</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do Google Sheets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="spreadsheetIdConfig">ID da Planilha Google</Label> {/* Alterado htmlFor para evitar conflito com ID do contexto */}
          <Input
            id="spreadsheetIdConfigInput" // Alterado ID para evitar conflito
            type="text"
            value={spreadsheetIdInput}
            onChange={(e) => setSpreadsheetIdInput(e.target.value)}
            placeholder="Cole o ID da sua Planilha Google aqui"
            disabled={isInitializing}
          />
        </div>
        {currentSpreadsheetId && (
          <p className="text-sm text-muted-foreground">
            ID Configurado Globalmente: <span className="font-medium">{currentSpreadsheetId}</span>
          </p>
        )}
        {message && (
          <p className={`text-sm ${
            messageType === 'success' ? 'text-green-600' : 
            messageType === 'error' ? 'text-red-600' : 'text-muted-foreground'
          }`}>
            {message}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handleInitialize} disabled={isInitializing || !spreadsheetIdInput.trim()}>
          {isInitializing ? 'Salvando e Inicializando...' : 'Salvar e Inicializar'}
        </Button>
        <Button onClick={handleRefreshContext} variant="outline" disabled={isInitializing}>
            Recarregar Configuração Salva
        </Button>
      </CardFooter>
    </Card>
  );
}
