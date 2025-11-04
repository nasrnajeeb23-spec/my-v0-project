import { createBrowserClient } from "@supabase/ssr"
import type {
  Allocation,
  Order,
  AuditLog,
  Brigade,
  Notification,
  PreviousDebt,
  RepaymentPlan,
  RepaymentInstallment,
  FinancialSummary,
  User,
  UserRole,
} from "./types"

export class DataStore {
  private static getClient() {
    return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }

  static async initializeData() {
    // Check if brigades exist, if not create default one
    const brigades = await this.getBrigades()
    if (brigades.length === 0) {
      await this.addBrigade({
        id: crypto.randomUUID(),
        name: "اللواء الأول",
        code: "BRG-001",
        commanderName: "العقيد خالد عبدالله السالم",
        location: "صنعاء",
        phone: "+967-1-234567",
        email: "brigade1@military.gov.ye",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
  }

  // Brigades
  static async getBrigades(): Promise<Brigade[]> {
    const supabase = this.getClient()
    const { data, error } = await supabase.from("brigades").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching brigades:", error)
      return []
    }

    return (
      data?.map((item) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        commanderName: item.commander_name,
        location: item.location,
        phone: item.phone,
        email: item.email,
        isActive: item.is_active,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })) || []
    )
  }

  static async getBrigadeById(id: string): Promise<Brigade | undefined> {
    const brigades = await this.getBrigades()
    return brigades.find((b) => b.id === id)
  }

  static async addBrigade(brigade: Brigade): Promise<Brigade | null> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from("brigades")
      .insert({
        id: brigade.id,
        name: brigade.name,
        code: brigade.code,
        commander_name: brigade.commanderName,
        location: brigade.location,
        phone: brigade.phone,
        email: brigade.email,
        is_active: brigade.isActive,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error adding brigade:", error)
      return null
    }

    return data
      ? {
          id: data.id,
          name: data.name,
          code: data.code,
          commanderName: data.commander_name,
          location: data.location,
          phone: data.phone,
          email: data.email,
          isActive: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }
      : null
  }

  static async updateBrigade(id: string, updates: Partial<Brigade>): Promise<boolean> {
    const supabase = this.getClient()
    const dbUpdates: any = { updated_at: new Date().toISOString() }

    if (updates.name) dbUpdates.name = updates.name
    if (updates.code) dbUpdates.code = updates.code
    if (updates.commanderName) dbUpdates.commander_name = updates.commanderName
    if (updates.location) dbUpdates.location = updates.location
    if (updates.phone) dbUpdates.phone = updates.phone
    if (updates.email) dbUpdates.email = updates.email
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive

    const { error } = await supabase.from("brigades").update(dbUpdates).eq("id", id)

    if (error) {
      console.error("[v0] Error updating brigade:", error)
      return false
    }

    return true
  }

  static async deleteBrigade(id: string): Promise<boolean> {
    const supabase = this.getClient()
    const { error } = await supabase.from("brigades").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting brigade:", error)
      return false
    }

    return true
  }

  // Allocations
  static async getAllocations(): Promise<Allocation[]> {
    const supabase = this.getClient()
    const { data, error } = await supabase.from("allocations").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching allocations:", error)
      return []
    }

    return (
      data?.map((item) => ({
        id: item.id,
        date: item.received_date,
        amount: Number(item.amount),
        currency: item.currency,
        source: item.source,
        description: item.notes || "",
        referenceNumber: item.allocation_number,
        createdBy: item.created_by,
        createdAt: item.created_at,
      })) || []
    )
  }

  static async addAllocation(allocation: Omit<Allocation, "id">): Promise<Allocation | null> {
    const supabase = this.getClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from("allocations")
      .insert({
        received_date: allocation.date,
        amount: allocation.amount,
        currency: allocation.currency,
        source: allocation.source,
        notes: allocation.description,
        allocation_number: allocation.referenceNumber,
        created_by: user?.id || allocation.createdBy,
        status: "active",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error adding allocation:", error)
      return null
    }

    return data
      ? {
          id: data.id,
          date: data.received_date,
          amount: Number(data.amount),
          currency: data.currency,
          source: data.source,
          description: data.notes || "",
          referenceNumber: data.allocation_number,
          createdBy: data.created_by,
          createdAt: data.created_at,
        }
      : null
  }

  static async updateAllocation(id: string, updates: Partial<Allocation>): Promise<boolean> {
    const supabase = this.getClient()
    const dbUpdates: any = { updated_at: new Date().toISOString() }

    if (updates.date) dbUpdates.received_date = updates.date
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount
    if (updates.currency) dbUpdates.currency = updates.currency
    if (updates.source) dbUpdates.source = updates.source
    if (updates.description) dbUpdates.notes = updates.description
    if (updates.referenceNumber) dbUpdates.allocation_number = updates.referenceNumber

    const { error } = await supabase.from("allocations").update(dbUpdates).eq("id", id)

    if (error) {
      console.error("[v0] Error updating allocation:", error)
      return false
    }

    return true
  }

  static async deleteAllocation(id: string): Promise<boolean> {
    const supabase = this.getClient()
    const { error } = await supabase.from("allocations").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting allocation:", error)
      return false
    }

    return true
  }

  // Orders
  static async getOrders(): Promise<Order[]> {
    const supabase = this.getClient()
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching orders:", error)
      return []
    }

    return (
      data?.map((item) => ({
        id: item.id,
        orderNumber: item.order_number,
        date: item.order_date,
        amount: Number(item.amount),
        currency: item.currency,
        beneficiary: item.beneficiary,
        purpose: item.purpose,
        status: item.status,
        notes: item.notes,
        createdBy: item.created_by,
        createdAt: item.created_at,
        approvedBy: item.approved_by,
        approvedAt: item.payment_date,
        orderType: item.order_type || "written",
        needsWrittenOrder: !item.has_attachment && (item.order_type === "verbal" || item.order_type === "phone"),
        rejectionReason: item.rejection_reason,
      })) || []
    )
  }

  static async addOrder(order: Omit<Order, "id">): Promise<Order | null> {
    const supabase = this.getClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from("orders")
      .insert({
        order_number: order.orderNumber,
        order_date: order.date,
        amount: order.amount,
        currency: order.currency,
        beneficiary: order.beneficiary,
        purpose: order.purpose,
        status: order.status,
        notes: order.notes,
        created_by: user?.id || order.createdBy,
        approved_by: order.approvedBy,
        payment_date: order.approvedAt,
        order_type: order.orderType || "written",
        has_attachment: !!order.attachments && order.attachments.length > 0,
        rejection_reason: order.rejectionReason,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error adding order:", error)
      return null
    }

    if (data && !data.has_attachment && (data.order_type === "verbal" || data.order_type === "phone")) {
      await this.addNotification({
        title: "أمر يحتاج إلى مرفق خطي",
        message: `الأمر رقم ${data.order_number} من نوع ${data.order_type === "verbal" ? "شفهي" : "اتصال"} ويحتاج إلى أمر خطي مرفق`,
        type: "warning",
        read: false,
        link: `/orders`,
      })
    }

    return data
      ? {
          id: data.id,
          orderNumber: data.order_number,
          date: data.order_date,
          amount: Number(data.amount),
          currency: data.currency,
          beneficiary: data.beneficiary,
          purpose: data.purpose,
          status: data.status,
          notes: data.notes,
          createdBy: data.created_by,
          createdAt: data.created_at,
          approvedBy: data.approved_by,
          approvedAt: data.payment_date,
          orderType: data.order_type || "written",
          needsWrittenOrder: !data.has_attachment && (data.order_type === "verbal" || data.order_type === "phone"),
          rejectionReason: data.rejection_reason,
        }
      : null
  }

  static async updateOrder(id: string, updates: Partial<Order>): Promise<boolean> {
    const supabase = this.getClient()
    const dbUpdates: any = { updated_at: new Date().toISOString() }

    if (updates.orderNumber) dbUpdates.order_number = updates.orderNumber
    if (updates.date) dbUpdates.order_date = updates.date
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount
    if (updates.currency) dbUpdates.currency = updates.currency
    if (updates.beneficiary) dbUpdates.beneficiary = updates.beneficiary
    if (updates.purpose) dbUpdates.purpose = updates.purpose
    if (updates.status) dbUpdates.status = updates.status
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes
    if (updates.approvedBy) dbUpdates.approved_by = updates.approvedBy
    if (updates.approvedAt) dbUpdates.payment_date = updates.approvedAt
    if (updates.orderType) dbUpdates.order_type = updates.orderType
    if (updates.attachments) dbUpdates.has_attachment = updates.attachments.length > 0
    if (updates.rejectionReason) dbUpdates.rejection_reason = updates.rejectionReason

    const { error } = await supabase.from("orders").update(dbUpdates).eq("id", id)

    if (error) {
      console.error("[v0] Error updating order:", error)
      return false
    }

    return true
  }

  static async deleteOrder(id: string): Promise<boolean> {
    const supabase = this.getClient()
    const { error } = await supabase.from("orders").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting order:", error)
      return false
    }

    return true
  }

  // Notifications
  static async getNotifications(): Promise<Notification[]> {
    const supabase = this.getClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching notifications:", error)
      return []
    }

    return (
      data?.map((item) => ({
        id: item.id,
        title: item.title,
        message: item.message,
        type: item.type as "info" | "warning" | "error" | "success",
        read: item.read,
        createdAt: item.created_at,
        link: item.link,
      })) || []
    )
  }

  static async addNotification(notification: Omit<Notification, "id" | "createdAt">): Promise<boolean> {
    const supabase = this.getClient()

    const { data: profiles } = await supabase.from("profiles").select("id").eq("role", "commander").single()

    if (!profiles) {
      console.error("[v0] Commander profile not found")
      return false
    }

    const { error } = await supabase.from("notifications").insert({
      user_id: profiles.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: notification.read || false,
      link: notification.link,
    })

    if (error) {
      console.error("[v0] Error adding notification:", error)
      return false
    }

    return true
  }

  static async markNotificationAsRead(id: string): Promise<boolean> {
    const supabase = this.getClient()
    const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id)

    if (error) {
      console.error("[v0] Error marking notification as read:", error)
      return false
    }

    return true
  }

  static async markAllNotificationsAsRead(): Promise<boolean> {
    const supabase = this.getClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", user.id)

    if (error) {
      console.error("[v0] Error marking all notifications as read:", error)
      return false
    }

    return true
  }

  // Financial Summary
  static async getFinancialSummary(): Promise<FinancialSummary> {
    const allocations = await this.getAllocations()
    const orders = await this.getOrders()

    const totalAllocations = allocations.reduce((sum, a) => sum + a.amount, 0)
    const totalOrders = orders.reduce((sum, o) => sum + o.amount, 0)
    const pendingOrders = orders.filter((o) => o.status === "pending").length
    const approvedOrders = orders.filter((o) => o.status === "approved").length
    const paidOrders = orders.filter((o) => o.status === "paid").length

    return {
      totalAllocations,
      totalOrders,
      currentBalance: totalAllocations - totalOrders,
      pendingOrders,
      approvedOrders,
      paidOrders,
    }
  }

  static async getFinancialSummaryByCurrency(currency?: string): Promise<FinancialSummary> {
    const allocations = await this.getAllocations()
    const orders = await this.getOrders()

    const filteredAllocations = currency ? allocations.filter((a) => a.currency === currency) : allocations
    const filteredOrders = currency ? orders.filter((o) => o.currency === currency) : orders

    const totalAllocations = filteredAllocations.reduce((sum, a) => sum + a.amount, 0)
    const totalOrders = filteredOrders.reduce((sum, o) => sum + o.amount, 0)
    const pendingOrders = filteredOrders.filter((o) => o.status === "pending").length
    const approvedOrders = filteredOrders.filter((o) => o.status === "approved").length
    const paidOrders = filteredOrders.filter((o) => o.status === "paid").length

    return {
      totalAllocations,
      totalOrders,
      currentBalance: totalAllocations - totalOrders,
      pendingOrders,
      approvedOrders,
      paidOrders,
    }
  }

  // Audit Logs
  static async addAuditLog(log: Omit<AuditLog, "id" | "timestamp">): Promise<boolean> {
    const supabase = this.getClient()
    const { error } = await supabase.from("audit_logs").insert({
      user_id: log.userId,
      action: log.action,
      entity_type: log.entityType,
      entity_id: log.entityId,
      details: { userName: log.userName, details: log.details, ipAddress: log.ipAddress },
    })

    if (error) {
      console.error("[v0] Error adding audit log:", error)
      return false
    }

    return true
  }

  static async getAuditLogs(): Promise<AuditLog[]> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000)

    if (error) {
      console.error("[v0] Error fetching audit logs:", error)
      return []
    }

    return (
      data?.map((item) => ({
        id: item.id,
        userId: item.user_id,
        userName: item.details?.userName || "",
        action: item.action,
        entityType: item.entity_type,
        entityId: item.entity_id,
        details: item.details?.details || "",
        timestamp: item.created_at,
        ipAddress: item.details?.ipAddress,
      })) || []
    )
  }

  // Debts
  static async getDebts(): Promise<PreviousDebt[]> {
    const supabase = this.getClient()
    const { data, error } = await supabase.from("previous_debts").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching debts:", error)
      return []
    }

    return (
      data?.map((item) => ({
        id: item.id,
        brigadeId: item.brigade_id,
        debtNumber: item.debt_number,
        creditor: item.creditor,
        originalAmount: Number(item.original_amount),
        remainingAmount: Number(item.remaining_amount),
        currency: item.currency,
        debtDate: item.debt_date,
        dueDate: item.due_date,
        status: item.status,
        priority: item.priority,
        description: item.description,
        notes: item.notes,
        createdBy: item.created_by,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })) || []
    )
  }

  static async addDebt(debt: PreviousDebt): Promise<PreviousDebt | null> {
    const supabase = this.getClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from("previous_debts")
      .insert({
        id: debt.id,
        brigade_id: debt.brigadeId,
        debt_number: debt.debtNumber,
        creditor: debt.creditor,
        original_amount: debt.originalAmount,
        remaining_amount: debt.remainingAmount,
        currency: debt.currency,
        debt_date: debt.debtDate,
        due_date: debt.dueDate,
        status: debt.status,
        priority: debt.priority,
        description: debt.description,
        notes: debt.notes,
        created_by: user?.id || debt.createdBy,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error adding debt:", error)
      return null
    }

    return data
      ? {
          id: data.id,
          brigadeId: data.brigade_id,
          debtNumber: data.debt_number,
          creditor: data.creditor,
          originalAmount: Number(data.original_amount),
          remainingAmount: Number(data.remaining_amount),
          currency: data.currency,
          debtDate: data.debt_date,
          dueDate: data.due_date,
          status: data.status,
          priority: data.priority,
          description: data.description,
          notes: data.notes,
          createdBy: data.created_by,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }
      : null
  }

  static async updateDebt(id: string, updates: Partial<PreviousDebt>): Promise<boolean> {
    const supabase = this.getClient()
    const dbUpdates: any = { updated_at: new Date().toISOString() }

    if (updates.brigadeId) dbUpdates.brigade_id = updates.brigadeId
    if (updates.debtNumber) dbUpdates.debt_number = updates.debtNumber
    if (updates.creditor) dbUpdates.creditor = updates.creditor
    if (updates.originalAmount !== undefined) dbUpdates.original_amount = updates.originalAmount
    if (updates.remainingAmount !== undefined) dbUpdates.remaining_amount = updates.remainingAmount
    if (updates.currency) dbUpdates.currency = updates.currency
    if (updates.debtDate) dbUpdates.debt_date = updates.debtDate
    if (updates.dueDate) dbUpdates.due_date = updates.dueDate
    if (updates.status) dbUpdates.status = updates.status
    if (updates.priority) dbUpdates.priority = updates.priority
    if (updates.description) dbUpdates.description = updates.description
    if (updates.notes) dbUpdates.notes = updates.notes

    const { error } = await supabase.from("previous_debts").update(dbUpdates).eq("id", id)

    if (error) {
      console.error("[v0] Error updating debt:", error)
      return false
    }

    return true
  }

  static async deleteDebt(id: string): Promise<boolean> {
    const supabase = this.getClient()
    const { error } = await supabase.from("previous_debts").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting debt:", error)
      return false
    }

    return true
  }

  // Repayment Plans
  static async getRepaymentPlans(debtId?: string): Promise<RepaymentPlan[]> {
    const supabase = this.getClient()
    let query = supabase.from("repayment_plans").select("*").order("created_at", { ascending: false })

    if (debtId) {
      query = query.eq("debt_id", debtId)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error fetching repayment plans:", error)
      return []
    }

    return (
      data?.map((item) => ({
        id: item.id,
        debtId: item.debt_id,
        planNumber: item.plan_number,
        totalInstallments: item.total_installments,
        installmentAmount: Number(item.installment_amount),
        currency: item.currency,
        frequency: item.frequency,
        startDate: item.start_date,
        status: item.status,
        notes: item.notes,
        createdBy: item.created_by,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })) || []
    )
  }

  static async addRepaymentPlan(plan: RepaymentPlan): Promise<RepaymentPlan | null> {
    const supabase = this.getClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from("repayment_plans")
      .insert({
        id: plan.id,
        debt_id: plan.debtId,
        plan_number: plan.planNumber,
        total_installments: plan.totalInstallments,
        installment_amount: plan.installmentAmount,
        currency: plan.currency,
        frequency: plan.frequency,
        start_date: plan.startDate,
        status: plan.status,
        notes: plan.notes,
        created_by: user?.id || plan.createdBy,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error adding repayment plan:", error)
      return null
    }

    return data
      ? {
          id: data.id,
          debtId: data.debt_id,
          planNumber: data.plan_number,
          totalInstallments: data.total_installments,
          installmentAmount: Number(data.installment_amount),
          currency: data.currency,
          frequency: data.frequency,
          startDate: data.start_date,
          status: data.status,
          notes: data.notes,
          createdBy: data.created_by,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }
      : null
  }

  static async updateRepaymentPlan(id: string, updates: Partial<RepaymentPlan>): Promise<boolean> {
    const supabase = this.getClient()
    const dbUpdates: any = { updated_at: new Date().toISOString() }

    if (updates.debtId) dbUpdates.debt_id = updates.debtId
    if (updates.planNumber) dbUpdates.plan_number = updates.planNumber
    if (updates.totalInstallments !== undefined) dbUpdates.total_installments = updates.totalInstallments
    if (updates.installmentAmount !== undefined) dbUpdates.installment_amount = updates.installmentAmount
    if (updates.currency) dbUpdates.currency = updates.currency
    if (updates.frequency) dbUpdates.frequency = updates.frequency
    if (updates.startDate) dbUpdates.start_date = updates.startDate
    if (updates.status) dbUpdates.status = updates.status
    if (updates.notes) dbUpdates.notes = updates.notes

    const { error } = await supabase.from("repayment_plans").update(dbUpdates).eq("id", id)

    if (error) {
      console.error("[v0] Error updating repayment plan:", error)
      return false
    }

    return true
  }

  static async deleteRepaymentPlan(id: string): Promise<boolean> {
    const supabase = this.getClient()
    const { error } = await supabase.from("repayment_plans").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting repayment plan:", error)
      return false
    }

    return true
  }

  // Repayment Installments
  static async getRepaymentInstallments(planId?: string): Promise<RepaymentInstallment[]> {
    const supabase = this.getClient()
    let query = supabase.from("repayment_installments").select("*").order("installment_number", { ascending: true })

    if (planId) {
      query = query.eq("plan_id", planId)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error fetching repayment installments:", error)
      return []
    }

    return (
      data?.map((item) => ({
        id: item.id,
        planId: item.plan_id,
        installmentNumber: item.installment_number,
        amount: Number(item.amount),
        currency: item.currency,
        dueDate: item.due_date,
        paidDate: item.paid_date,
        status: item.status,
        paymentReference: item.payment_reference,
        notes: item.notes,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })) || []
    )
  }

  static async addRepaymentInstallment(installment: RepaymentInstallment): Promise<RepaymentInstallment | null> {
    const supabase = this.getClient()

    const { data, error } = await supabase
      .from("repayment_installments")
      .insert({
        id: installment.id,
        plan_id: installment.planId,
        installment_number: installment.installmentNumber,
        amount: installment.amount,
        currency: installment.currency,
        due_date: installment.dueDate,
        paid_date: installment.paidDate,
        status: installment.status,
        payment_reference: installment.paymentReference,
        notes: installment.notes,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error adding repayment installment:", error)
      return null
    }

    return data
      ? {
          id: data.id,
          planId: data.plan_id,
          installmentNumber: data.installment_number,
          amount: Number(data.amount),
          currency: data.currency,
          dueDate: data.due_date,
          paidDate: data.paid_date,
          status: data.status,
          paymentReference: data.payment_reference,
          notes: data.notes,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }
      : null
  }

  static async updateRepaymentInstallment(id: string, updates: Partial<RepaymentInstallment>): Promise<boolean> {
    const supabase = this.getClient()
    const dbUpdates: any = { updated_at: new Date().toISOString() }

    if (updates.planId) dbUpdates.plan_id = updates.planId
    if (updates.installmentNumber !== undefined) dbUpdates.installment_number = updates.installmentNumber
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount
    if (updates.currency) dbUpdates.currency = updates.currency
    if (updates.dueDate) dbUpdates.due_date = updates.dueDate
    if (updates.paidDate) dbUpdates.paid_date = updates.paidDate
    if (updates.status) dbUpdates.status = updates.status
    if (updates.paymentReference) dbUpdates.payment_reference = updates.paymentReference
    if (updates.notes) dbUpdates.notes = updates.notes

    const { error } = await supabase.from("repayment_installments").update(dbUpdates).eq("id", id)

    if (error) {
      console.error("[v0] Error updating repayment installment:", error)
      return false
    }

    return true
  }

  static async deleteRepaymentInstallment(id: string): Promise<boolean> {
    const supabase = this.getClient()
    const { error } = await supabase.from("repayment_installments").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting repayment installment:", error)
      return false
    }

    return true
  }

  // Users/Profiles
  static async getUsers(): Promise<User[]> {
    const supabase = this.getClient()
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching users:", error)
      return []
    }

    return (
      data?.map((item) => ({
        id: item.id,
        username: item.username,
        password: "", // Don't expose passwords
        fullName: item.full_name,
        role: item.role as UserRole,
        rank: item.rank || "",
        unit: item.unit || "",
        email: "", // Email is not stored in profiles table
        phone: item.phone || "",
        avatar: "", // Avatar is not stored in profiles table
      })) || []
    )
  }

  static async getUserByUsername(username: string): Promise<User | undefined> {
    const supabase = this.getClient()
    const { data, error } = await supabase.from("profiles").select("*").eq("username", username).single()

    if (error || !data) {
      return undefined
    }

    return {
      id: data.id,
      username: data.username,
      password: "",
      fullName: data.full_name,
      role: data.role as UserRole,
      rank: data.rank || "",
      unit: data.unit || "",
      email: "", // Email is not stored in profiles table
      phone: data.phone || "",
      avatar: "", // Avatar is not stored in profiles table
    }
  }

  static async addUser(user: User): Promise<boolean> {
    // Note: This only creates the profile. The Supabase Auth user must be created separately
    const supabase = this.getClient()
    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      username: user.username,
      full_name: user.fullName,
      role: user.role,
      rank: user.rank,
      unit: user.unit,
      phone: user.phone,
    })

    if (error) {
      console.error("[v0] Error adding user:", error)
      return false
    }

    return true
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<boolean> {
    const supabase = this.getClient()
    const dbUpdates: any = { updated_at: new Date().toISOString() }

    if (updates.username) dbUpdates.username = updates.username
    if (updates.fullName) dbUpdates.full_name = updates.fullName
    if (updates.role) dbUpdates.role = updates.role
    if (updates.rank) dbUpdates.rank = updates.rank
    if (updates.unit) dbUpdates.unit = updates.unit
    if (updates.phone) dbUpdates.phone = updates.phone

    const { error } = await supabase.from("profiles").update(dbUpdates).eq("id", id)

    if (error) {
      console.error("[v0] Error updating user:", error)
      return false
    }

    // If password is being updated, update it in Supabase Auth
    if (updates.password) {
      const { error: authError } = await supabase.auth.updateUser({
        password: updates.password,
      })

      if (authError) {
        console.error("[v0] Error updating password:", authError)
        return false
      }
    }

    return true
  }

  static async deleteUser(id: string): Promise<boolean> {
    const supabase = this.getClient()
    const { error } = await supabase.from("profiles").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting user:", error)
      return false
    }

    return true
  }

  // Helper methods
  static async getNextAllocationNumber(): Promise<string> {
    const allocations = await this.getAllocations()
    const year = new Date().getFullYear()
    const yearAllocations = allocations.filter((a) => a.referenceNumber.includes(year.toString()))
    const nextNumber = yearAllocations.length + 1
    return `ALO-${year}-${String(nextNumber).padStart(3, "0")}`
  }

  static async getNextOrderNumber(): Promise<string> {
    const orders = await this.getOrders()
    const year = new Date().getFullYear()
    const yearOrders = orders.filter((o) => o.orderNumber.includes(year.toString()))
    const nextNumber = yearOrders.length + 1
    return `ORD-${year}-${String(nextNumber).padStart(3, "0")}`
  }
}
