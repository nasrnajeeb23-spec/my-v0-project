"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DataStore } from "@/lib/data-store"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Download, Shield, User, FileText, Wallet, SettingsIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AuditLog } from "@/lib/types"
import { formatDate } from "@/lib/date-utils"

export default function AuditLogsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [entityFilter, setEntityFilter] = useState<string>("all")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      const loadLogs = async () => {
        try {
          const auditLogs = await DataStore.getAuditLogs()
          setLogs(auditLogs)
          setFilteredLogs(auditLogs)
        } catch (error) {
          console.error("Error loading audit logs:", error)
        }
      }
      loadLogs()
    }
  }, [user, isLoading, router])

  useEffect(() => {
    let filtered = logs

    if (searchQuery) {
      filtered = filtered.filter(
        (log) =>
          log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.details.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (actionFilter !== "all") {
      filtered = filtered.filter((log) => log.action === actionFilter)
    }

    if (entityFilter !== "all") {
      filtered = filtered.filter((log) => log.entityType === entityFilter)
    }

    setFilteredLogs(filtered)
  }, [searchQuery, actionFilter, entityFilter, logs])

  const handleExport = () => {
    const csv = [
      ["التاريخ", "المستخدم", "الإجراء", "النوع", "التفاصيل"],
      ...filteredLogs.map((log) => [
        formatDate(log.timestamp, "datetime"),
        log.userName,
        getActionName(log.action),
        getEntityName(log.entityType),
        log.details,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

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

  const getActionName = (action: string) => {
    const actions: Record<string, string> = {
      create: "إنشاء",
      update: "تعديل",
      delete: "حذف",
      approve: "موافقة",
      reject: "رفض",
      login: "تسجيل دخول",
      logout: "تسجيل خروج",
    }
    return actions[action] || action
  }

  const getEntityName = (entity: string) => {
    const entities: Record<string, string> = {
      allocation: "مخصص",
      order: "أمر",
      user: "مستخدم",
      system: "النظام",
    }
    return entities[entity] || entity
  }

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: "bg-green-500/10 text-green-600 border-green-500/20",
      update: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      delete: "bg-red-500/10 text-red-600 border-red-500/20",
      approve: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      reject: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      login: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      logout: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    }
    return colors[action] || "bg-muted"
  }

  const getEntityIcon = (entity: string) => {
    const icons: Record<string, any> = {
      allocation: Wallet,
      order: FileText,
      user: User,
      system: SettingsIcon,
    }
    const Icon = icons[entity] || Shield
    return <Icon className="h-4 w-4" />
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="سجل التدقيق"
          description="تتبع جميع العمليات والأنشطة في النظام"
          action={
            <Button onClick={handleExport} variant="outline" className="gap-2 bg-transparent">
              <Download className="ml-2 h-4 w-4" />
              تصدير CSV
            </Button>
          }
        />

        <Card className="shadow-premium">
          <CardHeader>
            <CardTitle className="text-xl font-bold">سجل الأنشطة</CardTitle>
            <div className="flex flex-col md:flex-row items-center gap-3 mt-6">
              <div className="relative flex-1 w-full">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في السجل..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="ml-2 h-4 w-4" />
                  <SelectValue placeholder="نوع الإجراء" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الإجراءات</SelectItem>
                  <SelectItem value="create">إنشاء</SelectItem>
                  <SelectItem value="update">تعديل</SelectItem>
                  <SelectItem value="delete">حذف</SelectItem>
                  <SelectItem value="approve">موافقة</SelectItem>
                  <SelectItem value="reject">رفض</SelectItem>
                  <SelectItem value="login">تسجيل دخول</SelectItem>
                  <SelectItem value="logout">تسجيل خروج</SelectItem>
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="ml-2 h-4 w-4" />
                  <SelectValue placeholder="نوع الكيان" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="allocation">مخصصات</SelectItem>
                  <SelectItem value="order">أوامر</SelectItem>
                  <SelectItem value="user">مستخدمين</SelectItem>
                  <SelectItem value="system">النظام</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد سجلات</p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">{getEntityIcon(log.entityType)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getActionColor(log.action)}>{getActionName(log.action)}</Badge>
                        <Badge variant="outline">{getEntityName(log.entityType)}</Badge>
                        <span className="text-sm font-medium">{log.userName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{log.details}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(log.timestamp, "datetime")}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
