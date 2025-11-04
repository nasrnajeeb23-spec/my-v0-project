"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DataStore } from "@/lib/data-store"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatCard } from "@/components/stat-card"
import { RecentActivity } from "@/components/recent-activity"
import { FinancialChart } from "@/components/financial-chart"
import { FirstLoginDialog } from "@/components/first-login-dialog"
import { Wallet, TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle, FileText } from "lucide-react"
import type { Allocation, Order, FinancialSummary } from "@/lib/types"
import { formatCurrency } from "@/lib/currency-utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [showFirstLoginDialog, setShowFirstLoginDialog] = useState(false)
  const [summary, setSummary] = useState<FinancialSummary>({
    totalAllocations: 0,
    totalOrders: 0,
    currentBalance: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    paidOrders: 0,
  })
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      const loadData = async () => {
        setDataLoading(true)
        try {
          const allocs = await DataStore.getAllocations()
          const ords = await DataStore.getOrders()
          const financialSummary = await DataStore.getFinancialSummaryByCurrency("YER")

          setAllocations(allocs)
          setOrders(ords)
          setSummary(financialSummary)
        } catch (error) {
          console.error("[v0] Error loading dashboard data:", error)
        } finally {
          setDataLoading(false)
        }
      }

      loadData()

      if (user.isFirstLogin === true) {
        setShowFirstLoginDialog(true)
      }
    }
  }, [user, isLoading, router])

  if (isLoading || !user || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  const ordersNeedingWrittenOrder = orders.filter((order) => order.needsWrittenOrder === true)

  return (
    <DashboardLayout>
      <FirstLoginDialog open={showFirstLoginDialog} onClose={() => setShowFirstLoginDialog(false)} />

      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tight text-balance">مرحباً، {user.fullName}</h2>
          <p className="text-muted-foreground text-lg">
            {user.rank} - {user.unit}
          </p>
        </div>

        {user.role === "commander" && ordersNeedingWrittenOrder.length > 0 && (
          <Alert variant="destructive" className="bg-amber-50 dark:bg-amber-950/20 border-amber-500">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-900 dark:text-amber-100">تنبيه: أوامر تحتاج إلى مرفقات خطية</AlertTitle>
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <p className="mb-3">
                يوجد {ordersNeedingWrittenOrder.length} أمر (شفهي أو هاتفي) يحتاج إلى أمر خطي مرفق لاستكمال الإجراءات.
              </p>
              <Link href="/orders">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900"
                >
                  <FileText className="ml-2 h-4 w-4" />
                  عرض الأوامر
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {user.role === "commander" && ordersNeedingWrittenOrder.length > 0 && (
          <Card className="border-amber-500/50 shadow-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                أوامر تحتاج إلى أمر خطي
              </CardTitle>
              <CardDescription>الأوامر الشفهية والهاتفية التي تحتاج إلى أمر خطي مرفق</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ordersNeedingWrittenOrder.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-amber-50/50 dark:bg-amber-950/10"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {order.orderNumber}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {order.orderType === "verbal" ? "شفهي" : "اتصال"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {order.beneficiary} - {formatCurrency(order.amount, order.currency)}
                        </p>
                      </div>
                    </div>
                    <Link href="/orders">
                      <Button variant="outline" size="sm">
                        عرض
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="الرصيد الحالي"
            value={formatCurrency(summary.currentBalance, "YER")}
            icon={Wallet}
            description="إجمالي المخصصات - إجمالي الأوامر"
            className="border-primary/50 shadow-premium hover:shadow-premium-lg transition-shadow duration-300"
          />
          <StatCard
            title="إجمالي المخصصات"
            value={formatCurrency(summary.totalAllocations, "YER")}
            icon={TrendingUp}
            description={`${allocations.length} مخصص`}
            className="shadow-premium hover:shadow-premium-lg transition-shadow duration-300"
          />
          <StatCard
            title="إجمالي الأوامر"
            value={formatCurrency(summary.totalOrders, "YER")}
            icon={TrendingDown}
            description={`${orders.length} أمر صرف`}
            className="shadow-premium hover:shadow-premium-lg transition-shadow duration-300"
          />
          <StatCard
            title="الأوامر المعلقة"
            value={summary.pendingOrders.toString()}
            icon={Clock}
            description="بانتظار الموافقة"
            className="shadow-premium hover:shadow-premium-lg transition-shadow duration-300"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <StatCard
            title="أوامر معلقة"
            value={summary.pendingOrders.toString()}
            icon={Clock}
            className="border-yellow-500/50 shadow-premium hover:shadow-premium-lg transition-shadow duration-300"
          />
          <StatCard
            title="أوامر موافق عليها"
            value={summary.approvedOrders.toString()}
            icon={CheckCircle}
            className="border-green-500/50 shadow-premium hover:shadow-premium-lg transition-shadow duration-300"
          />
          <StatCard
            title="أوامر مدفوعة"
            value={summary.paidOrders.toString()}
            icon={CheckCircle}
            className="border-blue-500/50 shadow-premium hover:shadow-premium-lg transition-shadow duration-300"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="shadow-premium rounded-xl">
            <FinancialChart allocations={allocations} orders={orders} />
          </div>
          <div className="shadow-premium rounded-xl">
            <RecentActivity allocations={allocations} orders={orders} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
