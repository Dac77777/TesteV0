export interface User {
  id: string
  name: string
  email?: string
  cpf?: string
  role: "cliente" | "funcionario" | "admin"
  password?: string
  createdAt: string
  isActive: boolean
}

export interface ActivityLog {
  id: string
  userId: string
  userName: string
  action: string
  details: string
  timestamp: string
  module: string
}

export interface ServicePhoto {
  id: string
  serviceId: string
  url: string
  description: string
  uploadedAt: string
  uploadedBy: string
}
