"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Order, Currency } from "@/lib/types"
import { DataStore } from "@/lib/data-store"
import { useAuth } from "@/lib/auth-context"
import { Paperclip, X, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, DEFAULT_CURRENCY } from "@/lib/currency-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface OrderFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  order?: Order
}

export function OrderForm({ open, onOpenChange, onSuccess, order }: OrderFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    orderNumber: order?.orderNumber || DataStore.getNextOrderNumber(),
    date: order?.date || new Date().toISOString().split("T")[0],
    amount: order?.amount.toString() || "",
    currency: order?.currency || DEFAULT_CURRENCY,
    beneficiary: order?.beneficiary || "",
    purpose: order?.purpose || "",
    notes: order?.notes || "",
    previousDebt: order?.previousDebt?.toString() || "",
    status: order?.status || "pending",
    orderType: order?.orderType || "written",
  })

  const [attachments, setAttachments] = useState<string[]>(order?.attachments || [])
  const [uploadingFile, setUploadingFile] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingFile(true)
    const newAttachments: string[] = []

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newAttachments.push(reader.result as string)
        if (newAttachments.length === files.length) {
          setAttachments([...attachments, ...newAttachments])
          setUploadingFile(false)
        }
      }
      reader.readAsDataURL(file)
    })

    e.target.value = ""
  }

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const needsWrittenOrder =
      (formData.orderType === "verbal" || formData.orderType === "phone") && attachments.length === 0

    const orderData: Order = {
      id: order?.id || Date.now().toString(),
      orderNumber: formData.orderNumber,
      date: formData.date,
      amount: Number.parseFloat(formData.amount),
      currency: formData.currency as Currency,
      beneficiary: formData.beneficiary,
      purpose: formData.purpose,
      status: formData.status as Order["status"],
      notes: formData.notes || undefined,
      createdBy: user?.fullName || "",
      createdAt: order?.createdAt || new Date().toISOString(),
      approvedBy: order?.approvedBy,
      approvedAt: order?.approvedAt,
      attachments: attachments.length > 0 ? attachments : undefined,
      previousDebt: formData.previousDebt ? Number.parseFloat(formData.previousDebt) : undefined,
      orderType: formData.orderType as Order["orderType"],
      needsWrittenOrder: needsWrittenOrder,
    }

    if (order) {
      DataStore.updateOrder(order.id, orderData)

      if (order.needsWrittenOrder && !needsWrittenOrder) {
        DataStore.addNotification({
          id: `${Date.now()}-resolved`,
          type: "approval",
          title: "تم إرفاق الأمر الخطي",
          message: `تم إرفاق الأمر الخطي للأمر ${orderData.orderNumber}`,
          read: false,
          createdAt: new Date().toISOString(),
          link: "/orders",
        })
      }

      if (!order.needsWrittenOrder && needsWrittenOrder && user?.role === "finance_officer") {
        const orderTypeText = formData.orderType === "verbal" ? "شفهي" : "هاتفي"
        DataStore.addNotification({
          id: `${Date.now()}-written-order`,
          type: "system",
          title: "أمر يحتاج إلى مرفق خطي",
          message: `الأمر ${orderData.orderNumber} (${orderTypeText}) يحتاج إلى أمر خطي مرفق لاستكمال الإجراءات`,
          read: false,
          createdAt: new Date().toISOString(),
          link: "/orders",
        })
      }
    } else {
      DataStore.addOrder(orderData)

      if (needsWrittenOrder && user?.role === "finance_officer") {
        const orderTypeText = formData.orderType === "verbal" ? "شفهي" : "هاتفي"
        DataStore.addNotification({
          id: `${Date.now()}-written-order`,
          type: "system",
          title: "أمر يحتاج إلى مرفق خطي",
          message: `الأمر ${orderData.orderNumber} (${orderTypeText}) يحتاج إلى أمر خطي مرفق لاستكمال الإجراءات`,
          read: false,
          createdAt: new Date().toISOString(),
          link: "/orders",
        })
      }

      DataStore.addNotification({
        id: Date.now().toString(),
        type: "order",
        title: "أمر صرف جديد",
        message: `تم إضافة أمر صرف جديد رقم ${orderData.orderNumber} بقيمة ${formatCurrency(orderData.amount, orderData.currency)}`,
        read: false,
        createdAt: new Date().toISOString(),
        link: "/orders",
      })
    }

    onSuccess()
    onOpenChange(false)

    setFormData({
      orderNumber: DataStore.getNextOrderNumber(),
      date: new Date().toISOString().split("T")[0],
      amount: "",
      currency: DEFAULT_CURRENCY,
      beneficiary: "",
      purpose: "",
      notes: "",
      previousDebt: "",
      status: "pending",
      orderType: "written",
    })
    setAttachments([])
  }

  const showWarning =
    user?.role === "finance_officer" &&
    (formData.orderType === "verbal" || formData.orderType === "phone") &&
    attachments.length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{order ? "تعديل الأمر" : "إضافة أمر صرف جديد"}</DialogTitle>
          <DialogDescription>{order ? "قم بتعديل بيانات الأمر" : "أدخل بيانات أمر الصرف الجديد"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="orderNumber">رقم الأمر</Label>
              <Input
                id="orderNumber"
                value={formData.orderNumber}
                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                placeholder="ORD-2025-001"
                required
                disabled={!order}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">التاريخ</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">المبلغ</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currency">العملة</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value: Currency) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YER">ريال يمني (ر.ي)</SelectItem>
                    <SelectItem value="USD">دولار أمريكي ($)</SelectItem>
                    <SelectItem value="EUR">يورو (€)</SelectItem>
                    <SelectItem value="SAR">ريال سعودي (ر.س)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {order && user?.role === "finance_officer" && (
              <div className="grid gap-2">
                <Label htmlFor="status">الحالة</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">معلق</SelectItem>
                    <SelectItem value="approved">موافق عليه</SelectItem>
                    <SelectItem value="rejected">مرفوض</SelectItem>
                    <SelectItem value="paid">مدفوع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="previousDebt">الدين السابق (اختياري)</Label>
              <Input
                id="previousDebt"
                type="number"
                step="0.01"
                value={formData.previousDebt}
                onChange={(e) => setFormData({ ...formData, previousDebt: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="beneficiary">المستفيد</Label>
              <Input
                id="beneficiary"
                value={formData.beneficiary}
                onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
                placeholder="اسم المستفيد أو الجهة"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="purpose">الغرض</Label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="الغرض من الصرف"
                rows={2}
                required
              />
            </div>

            {user?.role === "finance_officer" && (
              <div className="grid gap-2">
                <Label htmlFor="orderType">نوع الأمر</Label>
                <Select
                  value={formData.orderType}
                  onValueChange={(value) => setFormData({ ...formData, orderType: value })}
                >
                  <SelectTrigger id="orderType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="written">أمر خطي</SelectItem>
                    <SelectItem value="verbal">أمر شفهي</SelectItem>
                    <SelectItem value="phone">أمر هاتفي (اتصال)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {showWarning && (
              <Alert variant="destructive" className="bg-amber-50 dark:bg-amber-950/20 border-amber-500">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  تنبيه: هذا الأمر يحتاج إلى أمر خطي مرفق لاستكمال الإجراءات. سيتم إرسال إشعار للقائد.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="notes">ملاحظات (اختياري)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="ملاحظات إضافية"
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="attachments">المرفقات (اختياري)</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    id="attachments"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    className="cursor-pointer"
                  />
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                </div>
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">الملفات المرفقة ({attachments.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {attachments.map((_, index) => (
                        <Badge key={index} variant="secondary" className="gap-2 pr-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          ملف {index + 1}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={uploadingFile}>
              {uploadingFile ? "جاري الرفع..." : order ? "حفظ التعديلات" : "إضافة الأمر"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
