"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DataStore } from "@/lib/data-store"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Upload, Trash2, AlertTriangle, Database, FileJson } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function BackupPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [stats, setStats] = useState({
    allocations: 0,
    orders: 0,
    users: 0,
    notifications: 0,
    auditLogs: 0,
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user && user.role !== "finance_officer") {
      router.push("/dashboard")
      return
    }

    if (user) {
      const loadStats = async () => {
        try {
          const [allocsData, ordersData, usersData, notificationsData, auditLogsData] = await Promise.all([
            DataStore.getAllocations(),
            DataStore.getOrders(),
            DataStore.getUsers(),
            DataStore.getNotifications(),
            DataStore.getAuditLogs(),
          ])

          setStats({
            allocations: allocsData.length,
            orders: ordersData.length,
            users: usersData.length,
            notifications: notificationsData.length,
            auditLogs: auditLogsData.length,
          })
        } catch (error) {
          console.error("Error loading stats:", error)
        }
      }
      loadStats()
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  const handleExportBackup = async () => {
    try {
      const data = await DataStore.exportAllData()
      const blob = new Blob([data], { type: "application/json" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `backup_${new Date().toISOString().split("T")[0]}_${Date.now()}.json`
      link.click()

      await DataStore.addAuditLog({
        userId: user.id,
        userName: user.fullName,
        action: "create",
        entityType: "system",
        details: "تصدير نسخة احتياطية من البيانات",
      })

      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير النسخة الاحتياطية",
      })
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تصدير النسخة الاحتياطية",
        variant: "destructive",
      })
    }
  }

  const handleImportBackup = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const data = event.target?.result as string
          const success = await DataStore.importAllData(data)

          if (success) {
            await DataStore.addAuditLog({
              userId: user.id,
              userName: user.fullName,
              action: "update",
              entityType: "system",
              details: "استيراد نسخة احتياطية من البيانات",
            })

            toast({
              title: "تم الاستيراد بنجاح",
              description: "تم استيراد البيانات. سيتم تحديث الصفحة...",
            })

            setTimeout(() => {
              window.location.reload()
            }, 2000)
          } else {
            throw new Error("Invalid data format")
          }
        } catch (error) {
          toast({
            title: "خطأ",
            description: "فشل استيراد النسخة الاحتياطية. تأكد من صحة الملف",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleClearAllData = async () => {
    await DataStore.addAuditLog({
      userId: user.id,
      userName: user.fullName,
      action: "delete",
      entityType: "system",
      details: "حذف جميع البيانات من النظام",
    })

    await DataStore.clearAllData()

    toast({
      title: "تم الحذف بنجاح",
      description: "تم حذف جميع البيانات. سيتم تحديث الصفحة...",
    })

    setTimeout(() => {
      window.location.reload()
    }, 2000)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="النسخ الاحتياطي والاستعادة" description="إدارة النسخ الاحتياطية واستعادة البيانات" />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Card className="shadow-premium">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm">المخصصات</CardDescription>
              <CardTitle className="text-3xl font-bold">{stats.allocations}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-premium">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm">الأوامر</CardDescription>
              <CardTitle className="text-3xl font-bold">{stats.orders}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-premium">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm">المستخدمين</CardDescription>
              <CardTitle className="text-3xl font-bold">{stats.users}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-premium">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm">الإشعارات</CardDescription>
              <CardTitle className="text-3xl font-bold">{stats.notifications}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-premium">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm">سجلات التدقيق</CardDescription>
              <CardTitle className="text-3xl font-bold">{stats.auditLogs}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-premium">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Download className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>تصدير نسخة احتياطية</CardTitle>
                  <CardDescription>احفظ نسخة من جميع البيانات</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                قم بتصدير جميع البيانات (المخصصات، الأوامر، المستخدمين، الإشعارات، وسجلات التدقيق) إلى ملف JSON.
              </p>
              <Button onClick={handleExportBackup} className="w-full gap-2">
                <Download className="h-4 w-4" />
                تصدير النسخة الاحتياطية
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-premium">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>استيراد نسخة احتياطية</CardTitle>
                  <CardDescription>استعادة البيانات من ملف</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                قم باستيراد البيانات من ملف نسخة احتياطية سابقة. سيتم استبدال البيانات الحالية.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full gap-2 bg-transparent">
                    <Upload className="h-4 w-4" />
                    استيراد النسخة الاحتياطية
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>تأكيد الاستيراد</AlertDialogTitle>
                    <AlertDialogDescription>
                      سيتم استبدال جميع البيانات الحالية بالبيانات من الملف. هل أنت متأكد؟
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction onClick={handleImportBackup}>استيراد</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-premium border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-destructive">منطقة الخطر</CardTitle>
                <CardDescription>إجراءات لا يمكن التراجع عنها</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-destructive mb-1">حذف جميع البيانات</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    سيتم حذف جميع البيانات بشكل دائم وإعادة تهيئة النظام بالبيانات الافتراضية. هذا الإجراء لا يمكن
                    التراجع عنه.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2">
                        <Trash2 className="h-4 w-4" />
                        حذف جميع البيانات
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive">تحذير: حذف دائم</AlertDialogTitle>
                        <AlertDialogDescription>
                          هذا الإجراء سيحذف جميع البيانات بشكل دائم ولا يمكن التراجع عنه. تأكد من تصدير نسخة احتياطية
                          قبل المتابعة. هل أنت متأكد تماماً؟
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleClearAllData}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          نعم، احذف جميع البيانات
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-premium bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FileJson className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">نصائح للنسخ الاحتياطي</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• قم بتصدير نسخة احتياطية بشكل دوري (أسبوعياً على الأقل)</li>
                  <li>• احفظ النسخ الاحتياطية في مكان آمن خارج النظام</li>
                  <li>• تأكد من صحة الملف قبل استيراده</li>
                  <li>• لا تشارك ملفات النسخ الاحتياطي مع أشخاص غير مصرح لهم</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
