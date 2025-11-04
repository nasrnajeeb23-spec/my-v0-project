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
import type { Allocation, Currency } from "@/lib/types"
import { DataStore } from "@/lib/data-store"
import { useAuth } from "@/lib/auth-context"
import { Paperclip, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, DEFAULT_CURRENCY } from "@/lib/currency-utils"

interface AllocationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  allocation?: Allocation
}

export function AllocationForm({ open, onOpenChange, onSuccess, allocation }: AllocationFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    date: allocation?.date || new Date().toISOString().split("T")[0],
    amount: allocation?.amount.toString() || "",
    currency: allocation?.currency || DEFAULT_CURRENCY,
    source: allocation?.source || "",
    description: allocation?.description || "",
    referenceNumber: allocation?.referenceNumber || DataStore.getNextAllocationNumber(),
    previousDebt: allocation?.previousDebt?.toString() || "",
  })

  const [attachments, setAttachments] = useState<string[]>(allocation?.attachments || [])
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

    const allocationData: Allocation = {
      id: allocation?.id || Date.now().toString(),
      date: formData.date,
      amount: Number.parseFloat(formData.amount),
      currency: formData.currency as Currency,
      source: formData.source,
      description: formData.description,
      referenceNumber: formData.referenceNumber,
      createdBy: user?.fullName || "",
      createdAt: allocation?.createdAt || new Date().toISOString(),
      attachments: attachments.length > 0 ? attachments : undefined,
      previousDebt: formData.previousDebt ? Number.parseFloat(formData.previousDebt) : undefined,
    }

    if (allocation) {
      DataStore.updateAllocation(allocation.id, allocationData)
    } else {
      DataStore.addAllocation(allocationData)

      DataStore.addNotification({
        id: Date.now().toString(),
        type: "allocation",
        title: "مخصص جديد",
        message: `تم إضافة مخصص جديد بقيمة ${formatCurrency(allocationData.amount, allocationData.currency)}`,
        read: false,
        createdAt: new Date().toISOString(),
        link: "/allocations",
      })
    }

    onSuccess()
    onOpenChange(false)

    setFormData({
      date: new Date().toISOString().split("T")[0],
      amount: "",
      currency: DEFAULT_CURRENCY,
      source: "",
      description: "",
      referenceNumber: DataStore.getNextAllocationNumber(),
      previousDebt: "",
    })
    setAttachments([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{allocation ? "تعديل المخصص" : "إضافة مخصص جديد"}</DialogTitle>
          <DialogDescription>{allocation ? "قم بتعديل بيانات المخصص" : "أدخل بيانات المخصص الجديد"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
              <Label htmlFor="source">المصدر</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="مثال: الميزانية السنوية"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="referenceNumber">رقم المرجع</Label>
              <Input
                id="referenceNumber"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                placeholder="مثال: ALO-2025-001"
                required
                disabled={!allocation}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف تفصيلي للمخصص"
                rows={3}
                required
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
              {uploadingFile ? "جاري الرفع..." : allocation ? "حفظ التعديلات" : "إضافة المخصص"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
