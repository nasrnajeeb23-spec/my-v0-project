"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { migrateLocalStorageToSupabase } from "@/lib/migrate-to-supabase"
import { AlertCircle, CheckCircle2, Database } from "lucide-react"

export default function MigratePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleMigrate = async () => {
    setIsLoading(true)
    setResult(null)

    const migrationResult = await migrateLocalStorageToSupabase()
    setResult(migrationResult)
    setIsLoading(false)
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            نقل البيانات إلى Supabase
          </CardTitle>
          <CardDescription>
            انقل بياناتك من التخزين المحلي (localStorage) إلى قاعدة بيانات Supabase للحفظ الدائم
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>تنبيه مهم</AlertTitle>
            <AlertDescription>
              هذه العملية ستنقل جميع البيانات من المتصفح إلى قاعدة البيانات. تأكد من أنك قمت بإنشاء المستخدمين في
              Supabase Auth أولاً.
            </AlertDescription>
          </Alert>

          <Button onClick={handleMigrate} disabled={isLoading} className="w-full">
            {isLoading ? "جاري النقل..." : "بدء عملية النقل"}
          </Button>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "نجحت عملية النقل!" : "فشلت عملية النقل"}</AlertTitle>
              <AlertDescription>
                {result.success ? (
                  <div className="space-y-2 mt-2">
                    <p>تم نقل البيانات بنجاح:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>الألوية: {result.results.brigades}</li>
                      <li>المخصصات: {result.results.allocations}</li>
                      <li>الأوامر: {result.results.orders}</li>
                      <li>الإشعارات: {result.results.notifications}</li>
                    </ul>
                    {result.results.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="font-semibold">أخطاء:</p>
                        <ul className="list-disc list-inside">
                          {result.results.errors.map((error: string, i: number) => (
                            <li key={i} className="text-sm">
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>{result.message}</p>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
