/**
 * @file contexts/google-sheets-settings-context.tsx
 * @description Este arquivo define o Contexto React para gerenciar globalmente as configurações
 *              relacionadas à integração com o Google Sheets, como o ID da planilha (spreadsheetId)
 *              e o status dessa configuração.
 *              O `GoogleSheetsSettingsProvider` encapsula a lógica para carregar, atualizar e fornecer
 *              esses dados de configuração para os componentes da aplicação.
 *              O hook `useGoogleSheetsSettings` simplifica o acesso a este contexto.
 */
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { googleSheetsService } from '@/lib/google-sheets'; // Ajuste o caminho se necessário

interface GoogleSheetsSettingsState {
  spreadsheetId: string | null;
  isSheetsConfigured: boolean;
  isLoadingConfig: boolean;
  refreshConfig: () => void; 
  setContextSpreadsheetId: (id: string | null) => void; 
}

const GoogleSheetsSettingsContext = createContext<GoogleSheetsSettingsState | undefined>(undefined);

export const GoogleSheetsSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [isSheetsConfigured, setIsSheetsConfigured] = useState<boolean>(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState<boolean>(true);

  const loadInitialConfig = useCallback(() => {
    setIsLoadingConfig(true);
    if (typeof window !== "undefined") {
        const currentId = googleSheetsService.getSpreadsheetId();
        setSpreadsheetId(currentId);
        setIsSheetsConfigured(!!currentId);
    } else {
        setSpreadsheetId(null);
        setIsSheetsConfigured(false);
    }
    setIsLoadingConfig(false);
  }, []);

  useEffect(() => {
    loadInitialConfig();
  }, [loadInitialConfig]);

  const setContextSpreadsheetId = useCallback((id: string | null) => {
    // Esta função agora é a principal forma de definir o ID, 
    // tanto no contexto quanto no localStorage do serviço.
    if (typeof window !== "undefined") {
        googleSheetsService.setSpreadsheetId(id); 
    }
    setSpreadsheetId(id);
    setIsSheetsConfigured(!!id);
  }, []);

  const refreshConfig = useCallback(() => {
    // Recarrega a configuração a partir do que está salvo no googleSheetsService (localStorage)
    loadInitialConfig();
  }, [loadInitialConfig]);
  
  return (
    <GoogleSheetsSettingsContext.Provider value={{ spreadsheetId, isSheetsConfigured, isLoadingConfig, refreshConfig, setContextSpreadsheetId }}>
      {children}
    </GoogleSheetsSettingsContext.Provider>
  );
};

export const useGoogleSheetsSettings = (): GoogleSheetsSettingsState => {
  const context = useContext(GoogleSheetsSettingsContext);
  if (context === undefined) {
    throw new Error('useGoogleSheetsSettings must be used within a GoogleSheetsSettingsProvider');
  }
  return context;
};
