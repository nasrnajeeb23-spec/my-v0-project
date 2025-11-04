"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { initializeDefaultUsers } from "@/app/actions/initialize-users"
import Link from "next/link"

export default function InitializePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleInitialize = async () => {
    setIsLoading(true)
    setResults(null)

    const response = await initializeDefaultUsers()
    setResults(response)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-secondary/20 p-4">
      <Card className="w-full max-w-2xl border-primary/20 shadow-premium-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-balance">تهيئة النظام</CardTitle>
            <CardDescription className="text-base">إنشاء المستخدمين الافتراضيين للنظام</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6 space-y-4 border border-border/50">
            <h3 className="font-semibold text-lg">المستخدمون الافتراضيون:</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-3 bg-background rounded-md">
                <div>
                  <p className="font-medium">ركن المالية</p>
                  <p className="text-muted-foreground">finance@military.gov</p>
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded">finance123</code>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-md">
                <div>
                  <p className="font-medium">قائد اللواء</p>
                  <p className="text-muted-foreground">commander@military.gov</p>
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded">commander123</code>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-md">
                <div>
                  <p className="font-medium">المراجع المالي</p>
                  <p className="text-muted-foreground">auditor@military.gov</p>
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded">auditor123</code>
              </div>
            </div>
          </div>

          {!results && (
            <Button onClick={handleInitialize} disabled={isLoading} className="w-full h-12 text-base font-semibold">
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جاري إنشاء المستخدمين...
                </>
              ) : (
                "إنشاء المستخدمين الافتراضيين"
              )}
            </Button>
          )}

          {results && (
            <div className="space-y-4">
              {results.success ? (
                <>
                  <div className="space-y-2">
                    {results.results.map((result: any, index: number) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          result.status === "success" || result.status === "already_exists"
                            ? "bg-green-500/10 border border-green-500/20"
                            : "bg-destructive/10 border border-destructive/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {result.status === "success" || result.status === "already_exists" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive" />
                          )}
                          <div>
                            <p className="font-medium">{result.email}</p>
                            {result.error && <p className="text-xs text-muted-foreground">{result.error}</p>}
                          </div>
                        </div>
                        <span className="text-xs font-medium">
                          {result.status === "success"
                            ? "تم الإنشاء"
                            : result.status === "already_exists"
                              ? "موجود مسبقاً"
                              : "خطأ"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleInitialize} variant="outline" className="flex-1 bg-transparent">
                      إعادة المحاولة
                    </Button>
                    <Link href="/login" className="flex-1">
                      <Button className="w-full">الانتقال لتسجيل الدخول</Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
                    <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                    <p className="font-medium text-destructive">حدث خطأ أثناء إنشاء المستخدمين</p>
                    {results.error && <p className="text-sm text-muted-foreground mt-1">{results.error}</p>}
                  </div>
                  <Button onClick={handleInitialize} variant="outline" className="w-full bg-transparent">
                    إعادة المحاولة
                  </Button>
                </>
              )}
            </div>
          )}

          <div className="text-center pt-4 border-t">
            <Link href="/login" className="text-sm text-primary hover:underline">
              العودة إلى صفحة تسجيل الدخول
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
