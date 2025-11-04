"use client"

import { useState, useRef } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Paperclip,
  Eye,
  Printer,
  Edit,
  AlertTriangle,
} from "lucide-react"
import type { Order } from "@/lib/types"
import { DataStore } from "@/lib/data-store"
import { OrderForm } from "./order-form"
import { OrderReceipt } from "./order-receipt"
import { useAuth } from "@/lib/auth-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDate } from "@/lib/date-utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface OrdersTableProps {
  orders: Order[]
  onUpdate: () => void
}

export function OrdersTable({ orders, onUpdate }: OrdersTableProps) {
  const { user } = useAuth()
  const [editingOrder, setEditingOrder] = useState<Order | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [viewingAttachments, setViewingAttachments] = useState<Order | null>(null)
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null)
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null)
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (receiptRef.current) {
      window.print()
    }
  }

  const handleEdit = (order: Order) => {
    setEditingOrder(order)
    setFormOpen(true)

    DataStore.addAuditLog({
      userId: user?.id || "",
      userName: user?.fullName || "",
      action: "update",
      entityType: "order",
      entityId: order.id,
      details: `فتح نموذج تعديل الأمر ${order.orderNumber}`,
    })
  }

  const handleDelete = (id: string) => {
    const order = orders.find((o) => o.id === id)
    DataStore.deleteOrder(id)

    if (order) {
      DataStore.addAuditLog({
        userId: user?.id || "",
        userName: user?.fullName || "",
        action: "delete",
        entityType: "order",
        entityId: id,
        details: `حذف الأمر ${order.orderNumber} - ${order.beneficiary}`,
      })
    }

    setDeletingId(null)
    onUpdate()
  }

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return

    DataStore.updateOrder(orderId, {
      status: newStatus,
      approvedBy: user?.fullName,
      approvedAt: new Date().toISOString(),
    })

    DataStore.addAuditLog({
      userId: user?.id || "",
      userName: user?.fullName || "",
      action: "update",
      entityType: "order",
      entityId: orderId,
      details: `تغيير حالة الأمر ${order.orderNumber} إلى ${newStatus}`,
    })

    setEditingStatusId(null)
    onUpdate()
  }

  const handleApprove = (order: Order) => {
    DataStore.updateOrder(order.id, {
      status: "approved",
      approvedBy: user?.fullName,
      approvedAt: new Date().toISOString(),
    })

    DataStore.addNotification({
      id: Date.now().toString(),
      type: "approval",
      title: "تمت الموافقة على أمر",
      message: `تمت الموافقة على أمر الصرف رقم ${order.orderNumber}`,
      read: false,
      createdAt: new Date().toISOString(),
      link: "/orders",
    })

    DataStore.addAuditLog({
      userId: user?.id || "",
      userName: user?.fullName || "",
      action: "approve",
      entityType: "order",
      entityId: order.id,
      details: `الموافقة على الأمر ${order.orderNumber} - ${order.beneficiary} - ${order.amount} ${order.currency}`,
    })

    onUpdate()
  }

  const handleReject = (order: Order) => {
    DataStore.updateOrder(order.id, {
      status: "rejected",
      approvedBy: user?.fullName,
      approvedAt: new Date().toISOString(),
    })

    DataStore.addNotification({
      id: Date.now().toString(),
      type: "approval",
      title: "تم رفض أمر",
      message: `تم رفض أمر الصرف رقم ${order.orderNumber}`,
      read: false,
      createdAt: new Date().toISOString(),
      link: "/orders",
    })

    DataStore.addAuditLog({
      userId: user?.id || "",
      userName: user?.fullName || "",
      action: "reject",
      entityType: "order",
      entityId: order.id,
      details: `رفض الأمر ${order.orderNumber} - ${order.beneficiary}`,
    })

    onUpdate()
  }

  const handleMarkAsPaid = (order: Order) => {
    DataStore.updateOrder(order.id, {
      status: "paid",
    })

    DataStore.addAuditLog({
      userId: user?.id || "",
      userName: user?.fullName || "",
      action: "update",
      entityType: "order",
      entityId: order.id,
      details: `تحديد الأمر ${order.orderNumber} كمدفوع - ${order.amount} ${order.currency}`,
    })

    onUpdate()
  }

  const handlePrintReceipt = (order: Order) => {
    setPrintingOrder(order)
    setTimeout(() => {
      handlePrint()
      setTimeout(() => setPrintingOrder(null), 500)
    }, 100)

    DataStore.addAuditLog({
      userId: user?.id || "",
      userName: user?.fullName || "",
      action: "create",
      entityType: "order",
      entityId: order.id,
      details: `طباعة إيصال للأمر ${order.orderNumber}`,
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      YER: "ر.ي",
      USD: "$",
      EUR: "€",
      SAR: "ر.س",
    }
    const symbol = symbols[currency] || "ر.ي"
    return `${amount.toLocaleString("ar-SA")} ${symbol}`
  }

  const getStatusBadge = (status: Order["status"]) => {
    const variants = {
      pending: { label: "معلق", variant: "secondary" as const },
      approved: { label: "موافق عليه", variant: "default" as const },
      rejected: { label: "مرفوض", variant: "destructive" as const },
      paid: { label: "مدفوع", variant: "default" as const },
    }
    const { label, variant } = variants[status]
    return <Badge variant={variant}>{label}</Badge>
  }

  const getOrderTypeBadge = (orderType?: Order["orderType"]) => {
    if (!orderType || orderType === "written") return null

    const typeLabels = {
      verbal: "شفهي",
      phone: "اتصال",
      written: "خطي",
    }

    return (
      <Badge variant="outline" className="text-xs">
        {typeLabels[orderType]}
      </Badge>
    )
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingOrder(undefined)
  }

  const canApprove = user?.role === "commander"
  const canEdit = user?.role === "finance_officer"
  const canEditStatus = user?.role === "finance_officer"

  return (
    <>
      <TooltipProvider>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الأمر</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>المستفيد</TableHead>
                <TableHead>الغرض</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>المرفقات</TableHead>
                <TableHead>أضيف بواسطة</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    لا توجد أوامر مسجلة
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{order.orderNumber}</Badge>
                        {getOrderTypeBadge(order.orderType)}
                        {order.needsWrittenOrder && (
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>يحتاج إلى أمر خطي مرفق</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(order.date, "long")}</TableCell>
                    <TableCell className="font-semibold text-blue-600">
                      {formatCurrency(order.amount, order.currency)}
                    </TableCell>
                    <TableCell>{order.beneficiary}</TableCell>
                    <TableCell className="max-w-xs truncate">{order.purpose}</TableCell>
                    <TableCell>
                      {editingStatusId === order.id && canEditStatus ? (
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value as Order["status"])}
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">معلق</SelectItem>
                            <SelectItem value="approved">موافق عليه</SelectItem>
                            <SelectItem value="rejected">مرفوض</SelectItem>
                            <SelectItem value="paid">مدفوع</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.status)}
                          {canEditStatus && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setEditingStatusId(order.id)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.attachments && order.attachments.length > 0 ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => setViewingAttachments(order)}
                        >
                          <Paperclip className="h-4 w-4" />
                          {order.attachments.length}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{order.createdBy}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(order.status === "approved" || order.status === "paid") && (
                            <>
                              <DropdownMenuItem onClick={() => handlePrintReceipt(order)}>
                                <Printer className="ml-2 h-4 w-4" />
                                طباعة إيصال
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {canEdit && order.status === "pending" && (
                            <>
                              <DropdownMenuItem onClick={() => handleEdit(order)}>
                                <Pencil className="ml-2 h-4 w-4" />
                                تعديل
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {canApprove && order.status === "pending" && (
                            <>
                              <DropdownMenuItem onClick={() => handleApprove(order)}>
                                <CheckCircle className="ml-2 h-4 w-4" />
                                الموافقة
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleReject(order)} className="text-destructive">
                                <XCircle className="ml-2 h-4 w-4" />
                                رفض
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {canEdit && order.status === "approved" && (
                            <>
                              <DropdownMenuItem onClick={() => handleMarkAsPaid(order)}>
                                <CheckCircle className="ml-2 h-4 w-4" />
                                تحديد كمدفوع
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {canEdit && (
                            <DropdownMenuItem onClick={() => setDeletingId(order.id)} className="text-destructive">
                              <Trash2 className="ml-2 h-4 w-4" />
                              حذف
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TooltipProvider>

      <OrderForm open={formOpen} onOpenChange={handleFormClose} onSuccess={onUpdate} order={editingOrder} />

      <Dialog open={!!viewingAttachments} onOpenChange={() => setViewingAttachments(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>المرفقات - {viewingAttachments?.orderNumber}</DialogTitle>
            <DialogDescription>عرض جميع الملفات المرفقة بأمر الصرف</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {viewingAttachments?.attachments?.map((attachment, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">ملف {index + 1}</p>
                    <p className="text-sm text-muted-foreground">
                      {attachment.startsWith("data:image")
                        ? "صورة"
                        : attachment.startsWith("data:application/pdf")
                          ? "PDF"
                          : "مستند"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={() => {
                    const link = document.createElement("a")
                    link.href = attachment
                    link.download = `attachment-${index + 1}`
                    link.click()
                  }}
                >
                  <Eye className="h-4 w-4" />
                  عرض/تحميل
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {printingOrder && (
        <div className="fixed inset-0 z-50 bg-white print:relative print:inset-auto">
          <OrderReceipt ref={receiptRef} order={printingOrder} />
        </div>
      )}

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>سيتم حذف هذا الأمر نهائياً ولا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
