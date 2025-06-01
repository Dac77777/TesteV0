"use client"

import { useState, useEffect, useCallback } from "react"
import { googleSheetsService, type SheetsData } from "@/lib/google-sheets"

export function useGoogleSheets() {
  const [isConnected, setIsConnected] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if Google Sheets is configured
    setIsConnected(googleSheetsService.isConfigured())

    // Load last sync time
    const savedLastSync = localStorage.getItem("lastSync")
    if (savedLastSync) {
      setLastSync(new Date(savedLastSync).toLocaleString("pt-BR"))
    }
  }, [])

  const syncToSheets = useCallback(
    async (data: SheetsData) => {
      if (!isConnected) {
        throw new Error("Google Sheets not connected")
      }

      setIsSyncing(true)
      setError(null)

      try {
        await googleSheetsService.syncData(data)
        setLastSync(new Date().toLocaleString("pt-BR"))
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Sync failed"
        setError(errorMessage)
        throw err
      } finally {
        setIsSyncing(false)
      }
    },
    [isConnected],
  )

  const pullFromSheets = useCallback(async (): Promise<SheetsData> => {
    if (!isConnected) {
      throw new Error("Google Sheets not connected")
    }

    setIsSyncing(true)
    setError(null)

    try {
      const data = await googleSheetsService.pullData()
      setLastSync(new Date().toLocaleString("pt-BR"))
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Pull failed"
      setError(errorMessage)
      throw err
    } finally {
      setIsSyncing(false)
    }
  }, [isConnected])

  const testConnection = useCallback(async (): Promise<boolean> => {
    setIsSyncing(true)
    setError(null)

    try {
      const result = await googleSheetsService.authenticate()
      setIsConnected(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Connection test failed"
      setError(errorMessage)
      setIsConnected(false)
      return false
    } finally {
      setIsSyncing(false)
    }
  }, [])

  return {
    isConnected,
    isSyncing,
    lastSync,
    error,
    syncToSheets,
    pullFromSheets,
    testConnection,
    setIsConnected,
  }
}
