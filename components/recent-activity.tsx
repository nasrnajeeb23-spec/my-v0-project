"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Allocation, Order } from "@/lib/types"
import { formatDistanceToNow } from "@/lib/date-utils"
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react"

interface RecentActivityProps {
  allocations: Allocation[]
  orders: Order[]
}

export function RecentActivity({ allocations, orders }: RecentActivityProps) {
  // Combine and sort by date
  const activities = [
    ...allocations.map((a) => ({ type: "allocation" as const, data: a, date: new Date(a.createdAt) })),
    ...orders.map((o) => ({ type: "order" as const, data: o, date: new Date(o.createdAt) })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-YE", {
      style: "currency",
      currency: "YER",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-bold">النشاط الأخير</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">لا توجد أنشطة حديثة</p>
          ) : (
            activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0 hover:bg-muted/30 -mx-2 px-2 py-2 rounded-lg transition-colors duration-200"
              >
                <div
                  className={`mt-1 flex h-9 w-9 items-center justify-center rounded-lg ${
                    activity.type === "allocation" ? "bg-green-500/10 text-green-600" : "bg-blue-500/10 text-blue-600"
                  }`}
                >
                  {activity.type === "allocation" ? (
                    <ArrowDownCircle className="h-5 w-5" />
                  ) : (
                    <ArrowUpCircle className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{activity.type === "allocation" ? "مخصص جديد" : "أمر صرف"}</p>
                    <Badge variant={activity.type === "allocation" ? "default" : "secondary"} className="font-semibold">
                      {formatCurrency(activity.data.amount)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {activity.type === "allocation"
                      ? (activity.data as Allocation).description
                      : (activity.data as Order).purpose}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">{formatDistanceToNow(activity.date)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
