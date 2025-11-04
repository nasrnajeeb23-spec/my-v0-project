"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export function EnvWarning() {
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!hasSupabaseUrl || !hasSupabaseKey) {
      setShowWarning(true)
    }
  }, [])

  if (!showWarning) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>تحذير: متغيرات البيئة مفقودة</AlertTitle>
      <AlertDescription>
        بعض متغيرات البيئة المطلوبة مفقودة. التطبيق قد لا يعمل بشكل صحيح.{" "}
        <Link href="/env-check" className="underline font-bold">
          اضغط هنا للتحقق
        </Link>
      </AlertDescription>
    </Alert>
  )
}
