"use client"

import type { ActivityLog } from "@/types/user"
import { authService } from "./auth"

class ActivityLogger {
  log(action: string, details: string, module: string): void {
    const user = authService.getCurrentUser()
    if (!user) return

    const log: ActivityLog = {
      id: `log_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      action,
      details,
      timestamp: new Date().toISOString(),
      module,
    }

    const logs = this.getLogs()
    logs.unshift(log) // Adiciona no início

    // Manter apenas os últimos 1000 logs
    if (logs.length > 1000) {
      logs.splice(1000)
    }

    localStorage.setItem("activityLogs", JSON.stringify(logs))
  }

  getLogs(): ActivityLog[] {
    const saved = localStorage.getItem("activityLogs")
    return saved ? JSON.parse(saved) : []
  }

  getLogsByUser(userId: string): ActivityLog[] {
    return this.getLogs().filter((log) => log.userId === userId)
  }

  getLogsByModule(module: string): ActivityLog[] {
    return this.getLogs().filter((log) => log.module === module)
  }

  clearLogs(): void {
    localStorage.setItem("activityLogs", JSON.stringify([]))
  }
}

export const activityLogger = new ActivityLogger()
