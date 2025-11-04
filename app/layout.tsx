import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { EnvWarning } from "@/components/env-warning"

export const metadata: Metadata = {
  title: "نظام إدارة المخصصات المالية - ركن مالية اللواء",
  description: "نظام متكامل لإدارة المخصصات المالية والأوامر للواء العسكري",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${GeistSans.className} antialiased`}>
        <AuthProvider>
          <EnvWarning />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
