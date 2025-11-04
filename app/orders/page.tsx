"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DataStore } from "@/lib/data-store"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderForm } from "@/components/order-form"
import { OrdersTable } from "@/components/orders-table"
import { Plus, Search, Download, Filter, FileSpreadsheet } from "lucide-react"
import type { Order } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/currency-utils"
import { exportOrdersToExcel } from "@/lib/excel-export"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function OrdersPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [formOpen, setFormOpen] = useState(false)

  const loadOrders = async () => {
    try {
      const data = await DataStore.getOrders()
      setOrders(data)
      setFilteredOrders(data)
    } catch (error) {
      console.error("Error loading orders:", error)
    }
  }

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      loadOrders()
    }
  }, [user, isLoading, router])

  useEffect(() => {
    let filtered = orders

    if (searchQuery) {
      filtered = filtered.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.beneficiary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.purpose.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((o) => o.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }, [searchQuery, statusFilter, orders])

  const handleExportCSV = async () => {
    const csv = [
      ["رقم الأمر", "التاريخ", "المبلغ", "العملة", "المستفيد", "الغرض", "الحالة", "أضيف بواسطة"],
      ...orders.map((o) => [
        o.orderNumber,
        o.date,
        o.amount.toString(),
        o.currency,
        o.beneficiary,
        o.purpose,
        o.status,
        o.createdBy,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `orders_${new Date().toISOString().split("T")[0]}.csv`
    link.click()

    await DataStore.addAuditLog({
      userId: user?.id || "",
      userName: user?.fullName || "",
      action: "create",
      entityType: "system",
      details: `تصدير الأوامر إلى CSV - ${orders.length} أمر`,
    })
  }

  const handleExportExcel = async () => {
    exportOrdersToExcel(orders)

    await DataStore.addAuditLog({
      userId: user?.id || "",
      userName: user?.fullName || "",
      action: "create",
      entityType: "system",
      details: `تصدير الأوامر إلى Excel - ${orders.length} أمر`,
    })
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

  const totalAmount = orders.reduce((sum, o) => sum + o.amount, 0)
  const pendingCount = orders.filter((o) => o.status === "pending").length
  const approvedCount = orders.filter((o) => o.status === "approved").length
  const paidCount = orders.filter((o) => o.status === "paid").length

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          title="إدارة الأوامر"
          description="عرض وإدارة جميع أوامر الصرف"
          action={
            user.role === "finance_officer" || user.role === "commander" ? (
              <Button onClick={() => setFormOpen(true)} className="shadow-md hover:shadow-lg transition-shadow">
                <Plus className="ml-2 h-4 w-4" />
                إضافة أمر
              </Button>
            ) : undefined
          }
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-premium hover:shadow-premium-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm">إجمالي الأوامر</CardDescription>
              <CardTitle className="text-2xl font-bold">{formatCurrency(totalAmount, "YER")}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-premium hover:shadow-premium-lg transition-shadow duration-300 border-yellow-500/30">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm">معلقة</CardDescription>
              <CardTitle className="text-3xl font-bold text-yellow-600">{pendingCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-premium hover:shadow-premium-lg transition-shadow duration-300 border-green-500/30">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm">موافق عليها</CardDescription>
              <CardTitle className="text-3xl font-bold text-green-600">{approvedCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-premium hover:shadow-premium-lg transition-shadow duration-300 border-blue-500/30">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm">مدفوعة</CardDescription>
              <CardTitle className="text-3xl font-bold text-blue-600">{paidCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="shadow-premium">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">قائمة الأوامر</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Download className="ml-2 h-4 w-4" />
                    تصدير
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportExcel}>
                    <FileSpreadsheet className="ml-2 h-4 w-4" />
                    تصدير Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportCSV}>
                    <Download className="ml-2 h-4 w-4" />
                    تصدير CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في الأوامر..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="ml-2 h-4 w-4" />
                  <SelectValue placeholder="تصفية حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="approved">موافق عليه</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                  <SelectItem value="paid">مدفوع</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <OrdersTable orders={filteredOrders} onUpdate={loadOrders} />
          </CardContent>
        </Card>
      </div>

      <OrderForm open={formOpen} onOpenChange={setFormOpen} onSuccess={loadOrders} />
    </DashboardLayout>
  )
}
