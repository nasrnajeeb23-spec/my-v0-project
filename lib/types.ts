export type UserRole = "finance_officer" | "commander" | "auditor"

export type Currency = "YER" | "USD" | "EUR" | "SAR"

export interface User {
  id: string
  username: string
  password: string
  role: UserRole
  fullName: string
  rank: string
  unit: string
  brigadeId?: string
  avatar?: string
  email?: string
  phone?: string
  isFirstLogin?: boolean
}

export interface Allocation {
  id: string
  date: string
  amount: number
  currency: Currency
  source: string
  description: string
  referenceNumber: string
  brigadeId?: string
  createdBy: string
  createdAt: string
  attachments?: string[]
  previousDebt?: number
}

export interface Order {
  id: string
  orderNumber: string
  date: string
  amount: number
  currency: Currency
  beneficiary: string
  purpose: string
  status: "pending" | "approved" | "rejected" | "paid"
  brigadeId?: string
  notes?: string
  createdBy: string
  createdAt: string
  approvedBy?: string
  approvedAt?: string
  attachments?: string[]
  previousDebt?: number
  isDebt?: boolean
  debtAllocationId?: string
  orderType?: "written" | "verbal" | "phone"
  needsWrittenOrder?: boolean
  rejectionReason?: string
  allocationSource?: string
}

export interface Notification {
  id: string
  type: "allocation" | "order" | "approval" | "system"
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
}

export interface AuditLog {
  id: string
  userId: string
  userName: string
  action: "create" | "update" | "delete" | "approve" | "reject" | "login" | "logout"
  entityType: "allocation" | "order" | "user" | "system"
  entityId?: string
  details: string
  timestamp: string
  ipAddress?: string
}

export interface FinancialSummary {
  totalAllocations: number
  totalOrders: number
  currentBalance: number
  pendingOrders: number
  approvedOrders: number
  paidOrders: number
}

export interface PreviousDebt {
  id: string
  brigadeId: string
  debtNumber: string
  creditor: string
  originalAmount: number
  remainingAmount: number
  currency: Currency
  debtDate: string
  dueDate?: string
  description: string
  status: "active" | "paid" | "overdue" | "cancelled"
  priority?: "high" | "medium" | "low"
  notes?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface RepaymentPlan {
  id: string
  debtId: string
  planNumber: string
  totalInstallments: number
  installmentAmount: number
  currency: Currency
  startDate: string
  frequency: "monthly" | "quarterly" | "semi_annual" | "annual"
  status: "active" | "completed" | "suspended" | "cancelled"
  notes?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface RepaymentInstallment {
  id: string
  planId: string
  installmentNumber: number
  amount: number
  currency: Currency
  dueDate: string
  paidDate?: string
  status: "pending" | "paid" | "overdue" | "cancelled"
  paymentReference?: string
  notes?: string
  createdAt: string
  updatedAt: string
}
