import { createClient } from "./supabase/client"

const STORAGE_KEYS = {
  ALLOCATIONS: "military_finance_allocations",
  ORDERS: "military_finance_orders",
  NOTIFICATIONS: "military_finance_notifications",
  USERS: "military_finance_users",
  AUDIT_LOGS: "military_finance_audit_logs",
  BRIGADES: "military_finance_brigades",
  DEBTS: "military_finance_debts",
  REPAYMENT_PLANS: "military_finance_repayment_plans",
  REPAYMENT_INSTALLMENTS: "military_finance_repayment_installments",
}

export async function migrateLocalStorageToSupabase() {
  if (typeof window === "undefined") {
    console.log("[v0] Migration can only run in browser")
    return { success: false, message: "Migration can only run in browser" }
  }

  const supabase = createClient()
  const results = {
    brigades: 0,
    allocations: 0,
    orders: 0,
    notifications: 0,
    auditLogs: 0,
    debts: 0,
    repaymentPlans: 0,
    repaymentInstallments: 0,
    errors: [] as string[],
  }

  try {
    // Migrate Brigades
    const brigadesData = localStorage.getItem(STORAGE_KEYS.BRIGADES)
    if (brigadesData) {
      const brigades = JSON.parse(brigadesData)
      for (const brigade of brigades) {
        const { error } = await supabase.from("brigades").upsert({
          id: brigade.id,
          name: brigade.name,
          code: brigade.code,
          commander_name: brigade.commanderName,
          location: brigade.location,
          phone: brigade.phone,
          email: brigade.email,
          is_active: brigade.isActive,
        })
        if (error) {
          results.errors.push(`Brigade ${brigade.name}: ${error.message}`)
        } else {
          results.brigades++
        }
      }
    }

    // Migrate Allocations
    const allocationsData = localStorage.getItem(STORAGE_KEYS.ALLOCATIONS)
    if (allocationsData) {
      const allocations = JSON.parse(allocationsData)
      for (const allocation of allocations) {
        const { error } = await supabase.from("allocations").upsert({
          id: allocation.id,
          received_date: allocation.date,
          amount: allocation.amount,
          currency: allocation.currency,
          source: allocation.source,
          notes: allocation.description,
          allocation_number: allocation.referenceNumber,
          status: "active",
        })
        if (error) {
          results.errors.push(`Allocation ${allocation.referenceNumber}: ${error.message}`)
        } else {
          results.allocations++
        }
      }
    }

    // Migrate Orders
    const ordersData = localStorage.getItem(STORAGE_KEYS.ORDERS)
    if (ordersData) {
      const orders = JSON.parse(ordersData)
      for (const order of orders) {
        const { error } = await supabase.from("orders").upsert({
          id: order.id,
          order_number: order.orderNumber,
          order_date: order.date,
          amount: order.amount,
          currency: order.currency,
          beneficiary: order.beneficiary,
          purpose: order.purpose,
          status: order.status,
          notes: order.notes,
          order_type: order.orderType || "written",
          has_attachment: !!order.attachments && order.attachments.length > 0,
          rejection_reason: order.rejectionReason,
        })
        if (error) {
          results.errors.push(`Order ${order.orderNumber}: ${error.message}`)
        } else {
          results.orders++
        }
      }
    }

    console.log("[v0] Migration completed:", results)
    return { success: true, results }
  } catch (error) {
    console.error("[v0] Migration error:", error)
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" }
  }
}
