"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DataStore } from "@/lib/data-store"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, TrendingUp, TrendingDown, Calendar } from "lucide-react"
import type { Allocation, Order } from "@/lib/types"
import { SimpleLineChart, SimpleBarChart, SimplePieChart } from "@/components/simple-charts"
import { formatDate } from "@/lib/date-utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/page-header"

export default function ReportsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [dateRange, setDateRange] = useState<string>("all")
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      const loadData = async () => {
        try {
          const allocsData = await DataStore.getAllocations()
          const ordersData = await DataStore.getOrders()
          setAllocations(allocsData)
          setOrders(ordersData)
        } catch (error) {
          console.error("Error loading data:", error)
        }
      }
      loadData()
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

  const filterByDateRange = (items: (Allocation | Order)[]) => {
    if (dateRange === "all") return items

    const now = new Date()
    const filterDate = new Date()

    switch (dateRange) {
      case "month":
        filterDate.setMonth(now.getMonth() - 1)
        break
      case "quarter":
        filterDate.setMonth(now.getMonth() - 3)
        break
      case "year":
        filterDate.setFullYear(now.getFullYear() - 1)
        break
    }

    return items.filter((item) => new Date(item.date) >= filterDate)
  }

  const filteredAllocations = filterByDateRange(allocations) as Allocation[]
  const filteredOrders = filterByDateRange(orders) as Order[]

  const summary = {
    totalAllocations: filteredAllocations.reduce((sum, a) => sum + a.amount, 0),
    totalOrders: filteredOrders.reduce((sum, o) => sum + o.amount, 0),
    balance: 0,
  }
  summary.balance = summary.totalAllocations - summary.totalOrders

  // Monthly trend data
  const monthlyData = new Map<string, { allocations: number; orders: number; balance: number }>()

  filteredAllocations.forEach((a) => {
    const month = formatDate(a.date, "short")
    const current = monthlyData.get(month) || { allocations: 0, orders: 0, balance: 0 }
    monthlyData.set(month, {
      ...current,
      allocations: current.allocations + a.amount,
    })
  })

  filteredOrders.forEach((o) => {
    const month = formatDate(o.date, "short")
    const current = monthlyData.get(month) || { allocations: 0, orders: 0, balance: 0 }
    monthlyData.set(month, {
      ...current,
      orders: current.orders + o.amount,
    })
  })

  const trendData = Array.from(monthlyData.entries())
    .map(([month, data]) => ({
      month,
      المخصصات: data.allocations,
      الأوامر: data.orders,
      الرصيد: data.allocations - data.orders,
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

  // Order status distribution
  const statusData = [
    { name: "معلق", value: filteredOrders.filter((o) => o.status === "pending").length, color: "#f59e0b" },
    { name: "موافق عليه", value: filteredOrders.filter((o) => o.status === "approved").length, color: "#10b981" },
    { name: "مرفوض", value: filteredOrders.filter((o) => o.status === "rejected").length, color: "#ef4444" },
    { name: "مدفوع", value: filteredOrders.filter((o) => o.status === "paid").length, color: "#3b82f6" },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-YE", {
      style: "currency",
      currency: "YER",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleExportPDF = () => {
    window.print()
  }

  // Account statement data
  const accountStatement = [
    ...filteredAllocations.map((a) => ({
      date: new Date(a.date),
      type: "allocation" as const,
      description: a.description,
      reference: a.referenceNumber,
      debit: a.amount,
      credit: 0,
    })),
    ...filteredOrders.map((o) => ({
      date: new Date(o.date),
      type: "order" as const,
      description: o.purpose,
      reference: o.orderNumber,
      debit: 0,
      credit: o.amount,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime())

  let runningBalance = 0
  const statementWithBalance = accountStatement.map((item) => {
    runningBalance += item.debit - item.credit
    return { ...item, balance: runningBalance }
  })

  return (
    <DashboardLayout>
      <div className="space-y-6" ref={reportRef}>
        <PageHeader
          title="التقارير وكشف الحساب"
          description="تقارير مالية شاملة وكشف حساب تفصيلي"
          action={
            <>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="ml-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الفترات</SelectItem>
                  <SelectItem value="month">آخر شهر</SelectItem>
                  <SelectItem value="quarter">آخر 3 أشهر</SelectItem>
                  <SelectItem value="year">آخر سنة</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExportPDF}>
                <Download className="ml-2 h-4 w-4" />
                تصدير PDF
              </Button>
            </>
          }
        />

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                إجمالي المخصصات
              </CardDescription>
              <CardTitle className="text-2xl text-green-600">{formatCurrency(summary.totalAllocations)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                إجمالي الأوامر
              </CardDescription>
              <CardTitle className="text-2xl text-blue-600">{formatCurrency(summary.totalOrders)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                الرصيد الحالي
              </CardDescription>
              <CardTitle className={`text-2xl ${summary.balance >= 0 ? "text-primary" : "text-destructive"}`}>
                {formatCurrency(summary.balance)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="charts" className="space-y-4">
          <TabsList className="print:hidden">
            <TabsTrigger value="charts">الرسوم البيانية</TabsTrigger>
            <TabsTrigger value="statement">كشف الحساب</TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-4">
            {/* Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>الاتجاه المالي</CardTitle>
                <CardDescription>تطور المخصصات والأوامر والرصيد عبر الزمن</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleLineChart data={trendData} height={350} />
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>مقارنة المخصصات والأوامر</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart data={trendData} height={300} />
                </CardContent>
              </Card>

              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>توزيع حالات الأوامر</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <SimplePieChart data={statusData} height={300} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="statement">
            <Card>
              <CardHeader>
                <CardTitle>كشف الحساب التفصيلي</CardTitle>
                <CardDescription>سجل كامل لجميع المخصصات والأوامر مع الرصيد الجاري</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-3 text-right font-medium">التاريخ</th>
                        <th className="p-3 text-right font-medium">البيان</th>
                        <th className="p-3 text-right font-medium">المرجع</th>
                        <th className="p-3 text-right font-medium">مدين</th>
                        <th className="p-3 text-right font-medium">دائن</th>
                        <th className="p-3 text-right font-medium">الرصيد</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statementWithBalance.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground">
                            لا توجد حركات مالية
                          </td>
                        </tr>
                      ) : (
                        statementWithBalance.map((item, index) => (
                          <tr key={index} className="border-t hover:bg-muted/30">
                            <td className="p-3">{formatDate(item.date, "short")}</td>
                            <td className="p-3">{item.description}</td>
                            <td className="p-3">
                              <span className="text-xs bg-muted px-2 py-1 rounded">{item.reference}</span>
                            </td>
                            <td className="p-3 text-green-600 font-medium">
                              {item.debit > 0 ? formatCurrency(item.debit) : "-"}
                            </td>
                            <td className="p-3 text-blue-600 font-medium">
                              {item.credit > 0 ? formatCurrency(item.credit) : "-"}
                            </td>
                            <td
                              className={`p-3 font-semibold ${item.balance >= 0 ? "text-primary" : "text-destructive"}`}
                            >
                              {formatCurrency(item.balance)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {statementWithBalance.length > 0 && (
                      <tfoot className="bg-muted/50 font-semibold">
                        <tr>
                          <td colSpan={3} className="p-3 text-right">
                            الإجمالي
                          </td>
                          <td className="p-3 text-green-600">{formatCurrency(summary.totalAllocations)}</td>
                          <td className="p-3 text-blue-600">{formatCurrency(summary.totalOrders)}</td>
                          <td className={`p-3 ${summary.balance >= 0 ? "text-primary" : "text-destructive"}`}>
                            {formatCurrency(summary.balance)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          #report-content, #report-content * {
            visibility: visible;
          }
          #report-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </DashboardLayout>
  )
}
