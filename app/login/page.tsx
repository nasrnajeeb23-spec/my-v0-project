"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, User } from "lucide-react"
import { initializeDefaultUsers } from "@/app/actions/initialize-users"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [initAttempted, setInitAttempted] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    console.log("[v0] Attempting login for:", username)
    const success = await login(username, password)

    if (success) {
      console.log("[v0] Login successful")
      router.push("/dashboard")
    } else {
      console.log("[v0] Login failed")

      if (!initAttempted) {
        console.log("[v0] First login failure - attempting auto-initialization")
        setIsInitializing(true)
        setError("جاري تهيئة النظام للمرة الأولى...")

        try {
          const result = await initializeDefaultUsers()
          console.log("[v0] Initialization result:", result)

          if (result.success) {
            setInitAttempted(true)
            setError("تم تهيئة النظام. جاري إعادة المحاولة...")

            // Retry login after initialization
            setTimeout(async () => {
              console.log("[v0] Retrying login after initialization")
              const retrySuccess = await login(username, password)

              if (retrySuccess) {
                console.log("[v0] Login successful after initialization")
                router.push("/dashboard")
              } else {
                console.log("[v0] Login still failed after initialization")
                setError("اسم المستخدم أو كلمة المرور غير صحيحة")
                setIsLoading(false)
                setIsInitializing(false)
              }
            }, 1000)
            return
          } else {
            console.error("[v0] Initialization failed:", result.error)
            setError("فشل في تهيئة النظام. يرجى المحاولة مرة أخرى.")
          }
        } catch (err) {
          console.error("[v0] Initialization exception:", err)
          setError("حدث خطأ أثناء تهيئة النظام")
        }

        setIsInitializing(false)
      } else {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة")
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-secondary/20 p-4">
      <Card className="w-full max-w-md border-primary/20 shadow-premium-lg">
        <CardHeader className="space-y-6 text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-balance">نظام إدارة المخصصات المالية</CardTitle>
            <CardDescription className="text-base mt-3">ركن مالية اللواء العسكري</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold">اسم المستخدم</label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pr-11 h-11"
                  placeholder="أدخل اسم المستخدم"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-11 h-11"
                  placeholder="أدخل كلمة المرور"
                  required
                />
              </div>
            </div>

            {error && (
              <div
                className={`${isInitializing ? "bg-primary/10 text-primary border-primary/20" : "bg-destructive/10 text-destructive border-destructive/20"} text-sm p-4 rounded-lg border space-y-2`}
              >
                <p className="text-center font-medium">{error}</p>
                {!isInitializing && !initAttempted && (
                  <Link href="/initialize" className="block text-center text-xs underline hover:no-underline">
                    هل تحتاج إلى تهيئة النظام يدوياً؟
                  </Link>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold shadow-md"
              disabled={isLoading || isInitializing}
            >
              {isInitializing ? "جاري تهيئة النظام..." : isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>

            <div className="text-center">
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                نسيت كلمة المرور أو اسم المستخدم؟
              </Link>
            </div>
          </form>

          <div className="mt-8 p-5 bg-muted/50 rounded-xl text-sm border border-border/50 space-y-3">
            <p className="text-muted-foreground leading-relaxed text-center font-semibold">بيانات الدخول الافتراضية:</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">ركن المالية:</span>
                <span className="font-mono">finance / finance123</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">قائد اللواء:</span>
                <span className="font-mono">commander / commander123</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">المراجع:</span>
                <span className="font-mono">auditor / auditor123</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
