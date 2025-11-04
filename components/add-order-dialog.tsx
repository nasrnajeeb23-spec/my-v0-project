"use client"

import type React from "react"
import type { Currency, Order } from "@/lib/types" // Import Currency and Order types

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Upload, X, AlertTriangle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { DataStore } from "@/lib/data-store"
import { DEFAULT_CURRENCY, formatCurrency } from "@/lib/currency-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AddOrderDialogProps {
  onOrderAdded: () => void
}

export function AddOrderDialog({ onOrderAdded }: AddOrderDialogProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    beneficiary: "",
    purpose: "",
    currency: DEFAULT_CURRENCY as Currency,
    orderType: "written" as "written" | "verbal" | "phone",
    notes: "",
  })
  const [attachments, setAttachments] = useState<string[]>([])
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const needsWrittenOrder =
      (formData.orderType === "verbal" || formData.orderType === "phone") && attachments.length === 0

    const orderData: Order = {
      id: Date.now().toString(),
      orderNumber: DataStore.getNextOrderNumber(),
      date: new Date().toISOString().split("T")[0],
      amount: Number.parseFloat(formData.amount),
      currency: formData.currency,
      beneficiary: formData.beneficiary,
      purpose: formData.purpose,
      status: "pending",
      notes: formData.notes || undefined,
      createdBy: user?.fullName || "",
      createdAt: new Date().toISOString(),
      attachments: attachments.length > 0 ? attachments : undefined,
      orderType: formData.orderType,
      needsWrittenOrder: needsWrittenOrder,
    }

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

    // Reset form
    setFormData({
      amount: "",
      beneficiary: "",
      purpose: "",
      currency: DEFAULT_CURRENCY,
      orderType: "written",
      notes: "",
    })
    setAttachments([])
    setOpen(false)
    setIsSubmitting(false)
    onOrderAdded()
  }

  const showWarning =
    user?.role === "finance_officer" &&
    (formData.orderType === "verbal" || formData.orderType === "phone") &&
    attachments.length === 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="ml-2 h-4 w-4" />
          إضافة أمر جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إضافة أمر صرف جديد</DialogTitle>
          <DialogDescription>
            {user?.role === "commander"
              ? "قم بإنشاء أمر صرف جديد. سيتم إرساله للمالية للموافقة."
              : "قم بإنشاء أمر صرف جديد."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">العملة *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value: Currency) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
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

          <div className="space-y-2">
            <Label htmlFor="beneficiary">المستفيد *</Label>
            <Input
              id="beneficiary"
              value={formData.beneficiary}
              onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">الغرض *</Label>
            <Textarea
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              required
            />
          </div>

          {user?.role === "finance_officer" && (
            <div className="space-y-2">
              <Label htmlFor="orderType">نوع الأمر *</Label>
              <Select
                value={formData.orderType}
                onValueChange={(value: "written" | "verbal" | "phone") =>
                  setFormData({ ...formData, orderType: value })
                }
              >
                <SelectTrigger>
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
                تنبيه: الأوامر الشفهية والهاتفية تحتاج إلى أمر خطي مرفق لاستكمال الإجراءات. سيتم إرسال إشعار للقائد.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>المرفقات</Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              <input
                type="file"
                id="file-upload"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
                disabled={uploadingFile}
              />
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">انقر لرفع الملفات</span>
                <span className="text-xs text-muted-foreground mt-1">(صور، PDF، Word)</span>
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2 mt-2">
                <p className="text-sm text-muted-foreground">الملفات المرفقة ({attachments.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((_, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded">
                      <span className="text-sm">ملف {index + 1}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeAttachment(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting || uploadingFile}>
              {isSubmitting ? "جاري الإضافة..." : "إضافة الأمر"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
