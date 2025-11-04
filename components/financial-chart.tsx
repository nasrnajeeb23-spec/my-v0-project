"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Allocation, Order } from "@/lib/types"
import { SimpleBarChart } from "@/components/simple-charts"

interface FinancialChartProps {
  allocations: Allocation[]
  orders: Order[]
}

export function FinancialChart({ allocations, orders }: FinancialChartProps) {
  // Group by month
  const monthlyData = new Map<string, { allocations: number; orders: number }>()

  allocations.forEach((a) => {
    const month = new Date(a.date).toLocaleDateString("ar-SA", { year: "numeric", month: "short" })
    const current = monthlyData.get(month) || { allocations: 0, orders: 0 }
    monthlyData.set(month, { ...current, allocations: current.allocations + a.amount })
  })

  orders.forEach((o) => {
    const month = new Date(o.date).toLocaleDateString("ar-SA", { year: "numeric", month: "short" })
    const current = monthlyData.get(month) || { allocations: 0, orders: 0 }
    monthlyData.set(month, { ...current, orders: current.orders + o.amount })
  })

  const chartData = Array.from(monthlyData.entries())
    .map(([month, data]) => ({
      month,
      المخصصات: data.allocations,
      الأوامر: data.orders,
    }))
    .slice(-6)

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-bold">نظرة عامة على الحركة المالية</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <SimpleBarChart data={chartData} height={350} />
      </CardContent>
    </Card>
  )
}
