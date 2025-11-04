"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DataStore } from "@/lib/data-store"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BellOff, Check, CheckCheck, Wallet, FileText, CheckCircle, AlertCircle } from "lucide-react"
import type { Notification } from "@/lib/types"
import { formatDistanceToNow } from "@/lib/date-utils"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"

export default function NotificationsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])

  const loadNotifications = async () => {
    try {
      const data = await DataStore.getNotifications()
      setNotifications(data)
    } catch (error) {
      console.error("Error loading notifications:", error)
    }
  }

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      loadNotifications()
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

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAsRead = async (id: string) => {
    await DataStore.markNotificationAsRead(id)
    loadNotifications()
  }

  const handleMarkAllAsRead = async () => {
    await DataStore.markAllNotificationsAsRead()
    loadNotifications()
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "allocation":
        return <Wallet className="h-5 w-5 text-green-600" />
      case "order":
        return <FileText className="h-5 w-5 text-blue-600" />
      case "approval":
        return <CheckCircle className="h-5 w-5 text-primary" />
      case "system":
        return <AlertCircle className="h-5 w-5 text-orange-600" />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="الإشعارات"
          description={unreadCount > 0 ? `لديك ${unreadCount} إشعار غير مقروء` : "لا توجد إشعارات جديدة"}
          action={
            unreadCount > 0 ? (
              <Button onClick={handleMarkAllAsRead} variant="outline">
                <CheckCheck className="ml-2 h-4 w-4" />
                تحديد الكل كمقروء
              </Button>
            ) : undefined
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>جميع الإشعارات</CardTitle>
            <CardDescription>
              {notifications.length > 0 ? `${notifications.length} إشعار` : "لا توجد إشعارات"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد إشعارات حالياً</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                      notification.read ? "bg-background" : "bg-primary/5 border-primary/20"
                    }`}
                  >
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                        </div>
                        {!notification.read && (
                          <Badge variant="default" className="flex-shrink-0">
                            جديد
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{formatDistanceToNow(notification.createdAt)}</span>
                        {notification.link && (
                          <Link href={notification.link} className="text-primary hover:underline">
                            عرض التفاصيل
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="تحديد كمقروء"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
