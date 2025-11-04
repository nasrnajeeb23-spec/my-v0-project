"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DataStore } from "@/lib/data-store"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AllocationForm } from "@/components/allocation-form"
import { AllocationsTable } from "@/components/allocations-table"
import { Plus, Search, Download, FileSpreadsheet } from "lucide-react"
import type { Allocation } from "@/lib/types"
import { formatCurrency } from "@/lib/currency-utils"
import { exportAllocationsToExcel } from "@/lib/excel-export"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function AllocationsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [filteredAllocations, setFilteredAllocations] = useState<Allocation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [formOpen, setFormOpen] = useState(false)

  const loadAllocations = async () => {
    try {
      const data = await DataStore.getAllocations()
      setAllocations(data)
      setFilteredAllocations(data)
    } catch (error) {
      console.error("[v0] Error loading allocations:", error)
      setAllocations([])
      setFilteredAllocations([])
    }
  }

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user && user.role !== "finance_officer" && user.role !== "auditor") {
      router.push("/dashboard")
      return
    }

    if (user) {
      loadAllocations()
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (searchQuery) {
      const filtered = allocations.filter(
        (a) =>
          a.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredAllocations(filtered)
    } else {
      setFilteredAllocations(allocations)
    }
  }, [searchQuery, allocations])

  const handleExportCSV = () => {
    const csv = [
      ["رقم المرجع", "التاريخ", "المبلغ", "العملة", "المصدر", "الوصف", "أضيف بواسطة"],
      ...allocations.map((a) => [
        a.referenceNumber,
        a.date,
        a.amount.toString(),
        a.currency,
        a.source,
        a.description,
        a.createdBy,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `allocations_${new Date().toISOString().split("T")[0]}.csv`
    link.click()

    DataStore.addAuditLog({
      userId: user?.id || "",
      userName: user?.fullName || "",
      action: "create",
      entityType: "system",
      details: `تصدير المخصصات إلى CSV - ${allocations.length} مخصص`,
    })
  }

  const handleExportExcel = () => {
    exportAllocationsToExcel(allocations)

    DataStore.addAuditLog({
      userId: user?.id || "",
      userName: user?.fullName || "",
      action: "create",
      entityType: "system",
      details: `تصدير المخصصات إلى Excel - ${allocations.length} مخصص`,
    })
  }

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

  const totalAmount = allocations.reduce((sum, a) => sum + a.amount, 0)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          title="إدارة المخصصات"
          description="عرض وإدارة جميع المخصصات المالية"
          action={
            user.role === "finance_officer" ? (
              <Button onClick={() => setFormOpen(true)} className="shadow-md hover:shadow-lg transition-shadow">
                <Plus className="ml-2 h-4 w-4" />
                إضافة مخصص
              </Button>
            ) : undefined
          }
        />

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-premium hover:shadow-premium-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm">إجمالي المخصصات</CardDescription>
              <CardTitle className="text-3xl font-bold">{formatCurrency(totalAmount, "YER")}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-premium hover:shadow-premium-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardDescription className="text-sm">عدد المخصصات</CardDescription>
              <CardTitle className="text-3xl font-bold">{allocations.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="shadow-premium">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">قائمة المخصصات</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Download className="ml-2 h-4 w-4" />
                    تصدير
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportExcel}>
                    <FileSpreadsheet className="ml-2 h-4 w-4" />
                    تصدير Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportCSV}>
                    <Download className="ml-2 h-4 w-4" />
                    تصدير CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في المخصصات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AllocationsTable allocations={filteredAllocations} onUpdate={loadAllocations} />
          </CardContent>
        </Card>
      </div>

      <AllocationForm open={formOpen} onOpenChange={setFormOpen} onSuccess={loadAllocations} />
    </DashboardLayout>
  )
}
