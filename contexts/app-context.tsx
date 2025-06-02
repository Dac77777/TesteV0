"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { authService } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"

// Definir tipos para as configurações
type CompanySettings = {
  name: string
  address: string
  phone: string
  email: string
  cnpj: string
  logo?: string
  primaryColor: string
  secondaryColor: string
}

// Definir tipo para credenciais de admin
type AdminCredentials = {
  username: string
  password: string
}

// Definir o tipo do contexto
type AppContextType = {
  companySettings: CompanySettings
  updateCompanySettings: (settings: CompanySettings) => Promise<boolean>
  adminCredentials: { username: string }
  updateAdminCredentials: (username: string, password: string) => Promise<boolean>
  isLoading: boolean
  refreshSettings: () => Promise<void>
}

// Valores padrão
const defaultCompanySettings: CompanySettings = {
  name: "Workshop Manager",
  address: "Rua das Flores, 123",
  phone: "(11) 99999-9999",
  email: "contato@oficina.com",
  cnpj: "12.345.678/0001-90",
  logo: "",
  primaryColor: "#3b82f6",
  secondaryColor: "#64748b",
}

// Criar o contexto
const AppContext = createContext<AppContextType>({
  companySettings: defaultCompanySettings,
  updateCompanySettings: async () => false,
  adminCredentials: { username: "admin" },
  updateAdminCredentials: async () => false,
  isLoading: true,
  refreshSettings: async () => {},
})

// Hook personalizado para usar o contexto
export const useAppContext = () => useContext(AppContext)

// Provedor do contexto
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [companySettings, setCompanySettings] = useState<CompanySettings>(defaultCompanySettings)
  const [adminCredentials, setAdminCredentials] = useState<{ username: string }>({ username: "admin" })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Função para carregar configurações
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true)

      // Carregar configurações da empresa
      const settings = await authService.getCompanySettings()
      console.log("Configurações carregadas:", settings)
      setCompanySettings({
        ...defaultCompanySettings,
        ...settings,
      })

      // Carregar credenciais de admin (apenas username)
      const adminCreds = authService.getAdminCredentials()
      console.log("Credenciais de admin carregadas:", { username: adminCreds.username })
      setAdminCredentials({ username: adminCreds.username })
    } catch (error) {
      console.error("Erro ao carregar configurações:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Carregar configurações ao iniciar
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // Adicionar listeners para eventos de atualização
  useEffect(() => {
    // Listener para atualizações de configurações da empresa
    const handleSettingsChange = (event: CustomEvent) => {
      console.log("Evento de alteração de configurações recebido:", event.detail)
      setCompanySettings((prev) => ({
        ...prev,
        ...event.detail,
      }))

      toast({
        title: "Configurações atualizadas",
        description: "As configurações da empresa foram atualizadas com sucesso",
      })
    }

    // Listener para atualizações de credenciais de admin
    const handleCredentialsChange = (event: CustomEvent) => {
      console.log("Evento de alteração de credenciais recebido:", { username: event.detail.username })
      setAdminCredentials({ username: event.detail.username })

      toast({
        title: "Credenciais atualizadas",
        description: "As credenciais de administrador foram atualizadas com sucesso",
      })
    }

    window.addEventListener("companySettingsChanged", handleSettingsChange as EventListener)
    window.addEventListener("adminCredentialsChanged", handleCredentialsChange as EventListener)

    return () => {
      window.removeEventListener("companySettingsChanged", handleSettingsChange as EventListener)
      window.removeEventListener("adminCredentialsChanged", handleCredentialsChange as EventListener)
    }
  }, [toast])

  // Função para atualizar configurações da empresa
  const updateCompanySettings = async (settings: CompanySettings): Promise<boolean> => {
    try {
      const success = await authService.saveCompanySettings(settings)
      if (success) {
        setCompanySettings(settings)

        toast({
          title: "Sucesso",
          description: "Configurações da empresa atualizadas com sucesso",
        })

        return true
      }

      toast({
        title: "Erro",
        description: "Não foi possível atualizar as configurações da empresa",
        variant: "destructive",
      })

      return false
    } catch (error) {
      console.error("Erro ao atualizar configurações:", error)

      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar as configurações",
        variant: "destructive",
      })

      return false
    }
  }

  // Função para atualizar credenciais de admin
  const updateAdminCredentials = async (username: string, password: string): Promise<boolean> => {
    try {
      const success = await authService.updateAdminCredentials(username, password)
      if (success) {
        setAdminCredentials({ username })

        toast({
          title: "Sucesso",
          description: "Credenciais de administrador atualizadas com sucesso",
        })

        return true
      }

      toast({
        title: "Erro",
        description: "Não foi possível atualizar as credenciais de administrador",
        variant: "destructive",
      })

      return false
    } catch (error) {
      console.error("Erro ao atualizar credenciais:", error)

      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar as credenciais",
        variant: "destructive",
      })

      return false
    }
  }

  // Função para forçar atualização das configurações
  const refreshSettings = async () => {
    await loadSettings()
  }

  return (
    <AppContext.Provider
      value={{
        companySettings,
        updateCompanySettings,
        adminCredentials,
        updateAdminCredentials,
        isLoading,
        refreshSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
