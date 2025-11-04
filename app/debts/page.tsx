"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, DollarSign, AlertTriangle, Clock, MoreVertical, Pencil, Trash2, Eye } from "lucide-react"
import type { PreviousDebt, RepaymentPlan, RepaymentInstallment, Brigade } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"

export default function DebtsPage() {
  const { user } = useAuth()
  const [debts, setDebts] = useState<PreviousDebt[]>([])
  const [plans, setPlans] = useState<RepaymentPlan[]>([])
  const [installments, setInstallments] = useState<RepaymentInstallment[]>([])
  const [brigades, setBrigades] = useState<Brigade[]>([])
  const [selectedBrigade, setSelectedBrigade] = useState<string>("all")
  const [isAddDebtOpen, setIsAddDebtOpen] = useState(false)
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<string>("")
  const [isEditDebtOpen, setIsEditDebtOpen] = useState(false)
  const [isDeleteDebtOpen, setIsDeleteDebtOpen] = useState(false)
  const [selectedDebtForAction, setSelectedDebtForAction] = useState<PreviousDebt | null>(null)

  useEffect(() => {
    // Load mock data - will be replaced with Supabase queries
    const mockBrigades: Brigade[] = [
      {
        id: "1",
        name: "اللواء الأول",
        code: "BRG-001",
        commanderName: "العقيد أحمد محمد",
        location: "صنعاء",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "اللواء الثاني",
        code: "BRG-002",
        commanderName: "العقيد خالد علي",
        location: "عدن",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    const mockDebts: PreviousDebt[] = [
      {
        id: "1",
        brigadeId: "1",
        debtNumber: "DEBT-2024-001",
        creditor: "شركة التوريدات العسكرية",
        originalAmount: 5000000,
        remainingAmount: 3000000,
        currency: "YER",
        debtDate: "2024-06-15",
        dueDate: "2025-12-31",
        description: "مستحقات توريد معدات عسكرية",
        status: "active",
        priority: "high",
        createdBy: user?.id || "1",
        createdAt: new Date("2024-06-15").toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        brigadeId: "1",
        debtNumber: "DEBT-2024-002",
        creditor: "مقاول الصيانة",
        originalAmount: 1500000,
        remainingAmount: 1500000,
        currency: "YER",
        debtDate: "2024-08-20",
        dueDate: "2025-08-20",
        description: "أعمال صيانة المباني",
        status: "active",
        priority: "medium",
        createdBy: user?.id || "1",
        createdAt: new Date("2024-08-20").toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    const mockPlans: RepaymentPlan[] = [
      {
        id: "1",
        debtId: "1",
        planNumber: "PLAN-2024-001",
        totalInstallments: 10,
        installmentAmount: 300000,
        currency: "YER",
        startDate: "2025-01-01",
        frequency: "monthly",
        status: "active",
        createdBy: user?.id || "1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    const mockInstallments: RepaymentInstallment[] = [
      {
        id: "1",
        planId: "1",
        installmentNumber: 1,
        amount: 300000,
        currency: "YER",
        dueDate: "2025-01-31",
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        planId: "1",
        installmentNumber: 2,
        amount: 300000,
        currency: "YER",
        dueDate: "2025-02-28",
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    setBrigades(mockBrigades)
    setDebts(mockDebts)
    setPlans(mockPlans)
    setInstallments(mockInstallments)
  }, [user])

  const filteredDebts = selectedBrigade === "all" ? debts : debts.filter((d) => d.brigadeId === selectedBrigade)

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      paid: "secondary",
      overdue: "destructive",
      cancelled: "outline",
    }
    return (
      <Badge variant={variants[status] || "default"}>
        {status === "active" ? "نشط" : status === "paid" ? "مسدد" : status === "overdue" ? "متأخر" : "ملغي"}
      </Badge>
    )
  }

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      high: "destructive",
      medium: "default",
      low: "secondary",
    }
    return (
      <Badge variant={variants[priority]}>
        {priority === "high" ? "عالي" : priority === "medium" ? "متوسط" : "منخفض"}
      </Badge>
    )
  }

  const totalDebts = filteredDebts.reduce((sum, d) => sum + d.remainingAmount, 0)
  const activeDebts = filteredDebts.filter((d) => d.status === "active").length
  const overdueDebts = filteredDebts.filter((d) => d.status === "overdue").length

  const handleEditDebt = (debt: PreviousDebt) => {
    setSelectedDebtForAction(debt)
    setIsEditDebtOpen(true)
  }

  const handleDeleteDebt = (debt: PreviousDebt) => {
    setSelectedDebtForAction(debt)
    setIsDeleteDebtOpen(true)
  }

  const confirmDeleteDebt = async () => {
    if (selectedDebtForAction) {
      try {
        console.log("[v0] Deleting debt:", selectedDebtForAction.id)
        // TODO: Replace with actual DataStore.deleteDebt call when implemented
        setDebts(debts.filter((d) => d.id !== selectedDebtForAction.id))
        console.log("[v0] Debt deleted successfully")
        setIsDeleteDebtOpen(false)
        setSelectedDebtForAction(null)
      } catch (error) {
        console.error("[v0] Error deleting debt:", error)
        alert("حدث خطأ أثناء حذف الدين. يرجى المحاولة مرة أخرى.")
      }
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">إدارة الديون السابقة</h1>
            <p className="text-muted-foreground mt-1">تتبع الديون السابقة وخطط السداد بشكل منفصل عن الصندوق الحالي</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedBrigade} onValueChange={setSelectedBrigade}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="اختر اللواء" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الألوية</SelectItem>
                {brigades.map((brigade) => (
                  <SelectItem key={brigade.id} value={brigade.id}>
                    {brigade.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {user?.role === "finance_officer" && (
              <Dialog open={isAddDebtOpen} onOpenChange={setIsAddDebtOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة دين
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>إضافة دين سابق</DialogTitle>
                    <DialogDescription>أدخل تفاصيل الدين السابق الذي لم يتم سداده</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>رقم الدين</Label>
                        <Input placeholder="DEBT-2025-001" />
                      </div>
                      <div className="space-y-2">
                        <Label>اللواء</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر اللواء" />
                          </SelectTrigger>
                          <SelectContent>
                            {brigades.map((brigade) => (
                              <SelectItem key={brigade.id} value={brigade.id}>
                                {brigade.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>الدائن</Label>
                      <Input placeholder="اسم الشركة أو الجهة الدائنة" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>المبلغ الأصلي</Label>
                        <Input type="number" placeholder="0" />
                      </div>
                      <div className="space-y-2">
                        <Label>المبلغ المتبقي</Label>
                        <Input type="number" placeholder="0" />
                      </div>
                      <div className="space-y-2">
                        <Label>العملة</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="YER">ريال يمني</SelectItem>
                            <SelectItem value="SAR">ريال سعودي</SelectItem>
                            <SelectItem value="USD">دولار</SelectItem>
                            <SelectItem value="EUR">يورو</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>تاريخ الدين (ميلادي)</Label>
                        <Input type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label>تاريخ الاستحقاق (ميلادي)</Label>
                        <Input type="date" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>الأولوية</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">عالي</SelectItem>
                          <SelectItem value="medium">متوسط</SelectItem>
                          <SelectItem value="low">منخفض</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>الوصف</Label>
                      <Textarea placeholder="تفاصيل الدين..." rows={3} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDebtOpen(false)}>
                      إلغاء
                    </Button>
                    <Button onClick={() => setIsAddDebtOpen(false)}>حفظ</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الديون المتبقية</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDebts.toLocaleString()} ريال</div>
              <p className="text-xs text-muted-foreground mt-1">منفصل عن الصندوق الحالي</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الديون النشطة</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeDebts}</div>
              <p className="text-xs text-muted-foreground mt-1">ديون قيد السداد</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الديون المتأخرة</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{overdueDebts}</div>
              <p className="text-xs text-muted-foreground mt-1">تحتاج متابعة عاجلة</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="debts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="debts">الديون السابقة</TabsTrigger>
            <TabsTrigger value="plans">خطط السداد</TabsTrigger>
            <TabsTrigger value="installments">الأقساط</TabsTrigger>
          </TabsList>

          <TabsContent value="debts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>قائمة الديون السابقة</CardTitle>
                <CardDescription>جميع الديون المسجلة والمتبقية من فترات سابقة</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم الدين</TableHead>
                      <TableHead>الدائن</TableHead>
                      <TableHead>المبلغ الأصلي</TableHead>
                      <TableHead>المتبقي</TableHead>
                      <TableHead>تاريخ الاستحقاق (ميلادي)</TableHead>
                      <TableHead>الأولوية</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDebts.map((debt) => (
                      <TableRow key={debt.id}>
                        <TableCell className="font-medium">{debt.debtNumber}</TableCell>
                        <TableCell>{debt.creditor}</TableCell>
                        <TableCell>
                          {debt.originalAmount.toLocaleString()} {debt.currency}
                        </TableCell>
                        <TableCell className="font-bold">
                          {debt.remainingAmount.toLocaleString()} {debt.currency}
                        </TableCell>
                        <TableCell>{debt.dueDate ? new Date(debt.dueDate).toLocaleDateString("en-GB") : "-"}</TableCell>
                        <TableCell>{getPriorityBadge(debt.priority)}</TableCell>
                        <TableCell>{getStatusBadge(debt.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedDebt(debt.id)
                                  setIsAddPlanOpen(true)
                                }}
                              >
                                <Plus className="ml-2 h-4 w-4" />
                                إنشاء خطة سداد
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditDebt(debt)}>
                                <Pencil className="ml-2 h-4 w-4" />
                                تعديل
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => alert("عرض التفاصيل")}>
                                <Eye className="ml-2 h-4 w-4" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              {user?.role === "finance_officer" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleDeleteDebt(debt)} className="text-destructive">
                                    <Trash2 className="ml-2 h-4 w-4" />
                                    حذف
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>خطط السداد</CardTitle>
                <CardDescription>خطط السداد المجدولة للديون السابقة</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم الخطة</TableHead>
                      <TableHead>رقم الدين</TableHead>
                      <TableHead>عدد الأقساط</TableHead>
                      <TableHead>قيمة القسط</TableHead>
                      <TableHead>التكرار</TableHead>
                      <TableHead>تاريخ البداية (ميلادي)</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => {
                      const debt = debts.find((d) => d.id === plan.debtId)
                      return (
                        <TableRow key={plan.id}>
                          <TableCell className="font-medium">{plan.planNumber}</TableCell>
                          <TableCell>{debt?.debtNumber}</TableCell>
                          <TableCell>{plan.totalInstallments}</TableCell>
                          <TableCell>
                            {plan.installmentAmount.toLocaleString()} {plan.currency}
                          </TableCell>
                          <TableCell>
                            {plan.frequency === "monthly"
                              ? "شهري"
                              : plan.frequency === "quarterly"
                                ? "ربع سنوي"
                                : plan.frequency === "semi_annual"
                                  ? "نصف سنوي"
                                  : "سنوي"}
                          </TableCell>
                          <TableCell>{new Date(plan.startDate).toLocaleDateString("en-GB")}</TableCell>
                          <TableCell>{getStatusBadge(plan.status)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Pencil className="ml-2 h-4 w-4" />
                                  تعديل
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Eye className="ml-2 h-4 w-4" />
                                  عرض التفاصيل
                                </DropdownMenuItem>
                                {user?.role === "finance_officer" && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">
                                      <Trash2 className="ml-2 h-4 w-4" />
                                      حذف
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="installments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الأقساط المستحقة</CardTitle>
                <CardDescription>جدول الأقساط وحالة السداد</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم القسط</TableHead>
                      <TableHead>رقم الخطة</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>تاريخ الاستحقاق (ميلادي)</TableHead>
                      <TableHead>تاريخ السداد (ميلادي)</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {installments.map((installment) => {
                      const plan = plans.find((p) => p.id === installment.planId)
                      return (
                        <TableRow key={installment.id}>
                          <TableCell className="font-medium">#{installment.installmentNumber}</TableCell>
                          <TableCell>{plan?.planNumber}</TableCell>
                          <TableCell>
                            {installment.amount.toLocaleString()} {installment.currency}
                          </TableCell>
                          <TableCell>{new Date(installment.dueDate).toLocaleDateString("en-GB")}</TableCell>
                          <TableCell>
                            {installment.paidDate ? new Date(installment.paidDate).toLocaleDateString("en-GB") : "-"}
                          </TableCell>
                          <TableCell>{getStatusBadge(installment.status)}</TableCell>
                          <TableCell>
                            {installment.status === "pending" && user?.role === "finance_officer" && (
                              <Button variant="outline" size="sm">
                                تسجيل السداد
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isEditDebtOpen} onOpenChange={setIsEditDebtOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>تعديل بيانات الدين</DialogTitle>
              <DialogDescription>قم بتحديث تفاصيل الدين السابق</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>رقم الدين</Label>
                  <Input placeholder="DEBT-2025-001" defaultValue={selectedDebtForAction?.debtNumber} />
                </div>
                <div className="space-y-2">
                  <Label>اللواء</Label>
                  <Select defaultValue={selectedDebtForAction?.brigadeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر اللواء" />
                    </SelectTrigger>
                    <SelectContent>
                      {brigades.map((brigade) => (
                        <SelectItem key={brigade.id} value={brigade.id}>
                          {brigade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>الدائن</Label>
                <Input placeholder="اسم الشركة أو الجهة الدائنة" defaultValue={selectedDebtForAction?.creditor} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>المبلغ الأصلي</Label>
                  <Input type="number" placeholder="0" defaultValue={selectedDebtForAction?.originalAmount} />
                </div>
                <div className="space-y-2">
                  <Label>المبلغ المتبقي</Label>
                  <Input type="number" placeholder="0" defaultValue={selectedDebtForAction?.remainingAmount} />
                </div>
                <div className="space-y-2">
                  <Label>العملة</Label>
                  <Select defaultValue={selectedDebtForAction?.currency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YER">ريال يمني</SelectItem>
                      <SelectItem value="SAR">ريال سعودي</SelectItem>
                      <SelectItem value="USD">دولار</SelectItem>
                      <SelectItem value="EUR">يورو</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>تاريخ الدين (ميلادي)</Label>
                  <Input type="date" defaultValue={selectedDebtForAction?.debtDate} />
                </div>
                <div className="space-y-2">
                  <Label>تاريخ الاستحقاق (ميلادي)</Label>
                  <Input type="date" defaultValue={selectedDebtForAction?.dueDate} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>الأولوية</Label>
                <Select defaultValue={selectedDebtForAction?.priority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">عالي</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="low">منخفض</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Textarea placeholder="تفاصيل الدين..." rows={3} defaultValue={selectedDebtForAction?.description} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDebtOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={() => setIsEditDebtOpen(false)}>حفظ التعديلات</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDebtOpen} onOpenChange={setIsDeleteDebtOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف الدين "{selectedDebtForAction?.debtNumber}" نهائياً. هذا الإجراء لا يمكن التراجع عنه.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteDebt} className="bg-destructive text-destructive-foreground">
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
