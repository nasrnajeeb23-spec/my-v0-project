"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"

export default function EnvCheckPage() {
  const envVars = [
    { name: "NEXT_PUBLIC_SUPABASE_URL", value: process.env.NEXT_PUBLIC_SUPABASE_URL },
    { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
  ]

  const allPresent = envVars.every((v) => v.value)

  return (
    <div className="min-h-screen bg-background p-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">فحص متغيرات البيئة</CardTitle>
            <CardDescription>تحقق من أن جميع متغيرات البيئة المطلوبة موجودة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allPresent ? (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>جميع المتغيرات موجودة</AlertTitle>
                <AlertDescription>تم العثور على جميع متغيرات البيئة المطلوبة</AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>متغيرات مفقودة</AlertTitle>
                <AlertDescription>بعض متغيرات البيئة مفقودة. يرجى إضافتها في إعدادات Vercel</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              {envVars.map((envVar) => (
                <div key={envVar.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-mono text-sm">{envVar.name}</span>
                  {envVar.value ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              ))}
            </div>

            {!allPresent && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>كيفية إضافة متغيرات البيئة</AlertTitle>
                <AlertDescription className="space-y-2 mt-2">
                  <p>1. اذهب إلى لوحة تحكم Vercel</p>
                  <p>2. اختر مشروعك</p>
                  <p>3. اذهب إلى Settings → Environment Variables</p>
                  <p>4. أضف المتغيرات المفقودة</p>
                  <p>5. أعد نشر التطبيق (Redeploy)</p>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معلومات البيئة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>البيئة:</strong> {process.env.NODE_ENV}
              </p>
              <p>
                <strong>Vercel:</strong> {process.env.VERCEL ? "نعم" : "لا"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
