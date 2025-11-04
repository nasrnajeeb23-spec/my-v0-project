"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Paperclip, Eye } from "lucide-react"
import type { Allocation } from "@/lib/types"
import { DataStore } from "@/lib/data-store"
import { AllocationForm } from "./allocation-form"
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

interface AllocationsTableProps {
  allocations: Allocation[]
  onUpdate: () => void
}

export function AllocationsTable({ allocations, onUpdate }: AllocationsTableProps) {
  const [editingAllocation, setEditingAllocation] = useState<Allocation | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [viewingAttachments, setViewingAttachments] = useState<Allocation | null>(null)

  const handleEdit = (allocation: Allocation) => {
    setEditingAllocation(allocation)
    setFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      console.log("[v0] Deleting allocation:", id)
      await DataStore.deleteAllocation(id)
      console.log("[v0] Allocation deleted successfully")
      setDeletingId(null)
      onUpdate()
    } catch (error) {
      console.error("[v0] Error deleting allocation:", error)
      alert("حدث خطأ أثناء حذف المخصص. يرجى المحاولة مرة أخرى.")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-YE", {
      style: "currency",
      currency: "YER",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingAllocation(undefined)
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم المرجع</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>المصدر</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>المرفقات</TableHead>
              <TableHead>أضيف بواسطة</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  لا توجد مخصصات مسجلة
                </TableCell>
              </TableRow>
            ) : (
              allocations.map((allocation) => (
                <TableRow key={allocation.id}>
                  <TableCell className="font-medium">
                    <Badge variant="outline">{allocation.referenceNumber}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(allocation.date, "long")}</TableCell>
                  <TableCell className="font-semibold text-green-600">{formatCurrency(allocation.amount)}</TableCell>
                  <TableCell>{allocation.source}</TableCell>
                  <TableCell className="max-w-xs truncate">{allocation.description}</TableCell>
                  <TableCell>
                    {allocation.attachments && allocation.attachments.length > 0 ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => setViewingAttachments(allocation)}
                      >
                        <Paperclip className="h-4 w-4" />
                        {allocation.attachments.length}
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{allocation.createdBy}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(allocation)}>
                          <Pencil className="ml-2 h-4 w-4" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeletingId(allocation.id)} className="text-destructive">
                          <Trash2 className="ml-2 h-4 w-4" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AllocationForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSuccess={onUpdate}
        allocation={editingAllocation}
      />

      <Dialog open={!!viewingAttachments} onOpenChange={() => setViewingAttachments(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>المرفقات - {viewingAttachments?.referenceNumber}</DialogTitle>
            <DialogDescription>عرض جميع الملفات المرفقة بالمخصص</DialogDescription>
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

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>سيتم حذف هذا المخصص نهائياً ولا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
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
