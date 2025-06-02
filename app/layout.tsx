import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AppProvider } from "@/contexts/app-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Workshop Manager",
  description: "Sistema de gerenciamento para oficinas mecânicas",
  manifest: "/manifest.json",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AppProvider>{children}</AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
