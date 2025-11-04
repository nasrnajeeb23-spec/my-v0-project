export function exportToExcel(data: any[], filename: string, sheetName = "Sheet1") {
  // Convert data to CSV format (Excel can open CSV files)
  const headers = Object.keys(data[0] || {})
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          // Escape commas and quotes in values
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        .join(","),
    ),
  ].join("\n")

  // Create blob with UTF-8 BOM for proper Arabic character encoding
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
}

export function exportAllocationsToExcel(allocations: any[]) {
  const data = allocations.map((a) => ({
    "رقم المرجع": a.referenceNumber,
    التاريخ: a.date,
    المبلغ: a.amount,
    العملة: a.currency,
    المصدر: a.source,
    الوصف: a.description,
    "أضيف بواسطة": a.createdBy,
    "تاريخ الإضافة": new Date(a.createdAt).toLocaleString("ar-SA"),
  }))

  exportToExcel(data, `allocations_${new Date().toISOString().split("T")[0]}`, "المخصصات")
}

export function exportOrdersToExcel(orders: any[]) {
  const data = orders.map((o) => ({
    "رقم الأمر": o.orderNumber,
    التاريخ: o.date,
    المبلغ: o.amount,
    العملة: o.currency,
    المستفيد: o.beneficiary,
    الغرض: o.purpose,
    الحالة:
      o.status === "pending"
        ? "معلق"
        : o.status === "approved"
          ? "موافق عليه"
          : o.status === "rejected"
            ? "مرفوض"
            : "مدفوع",
    "أضيف بواسطة": o.createdBy,
    "تاريخ الإضافة": new Date(o.createdAt).toLocaleString("ar-SA"),
    "وافق عليه": o.approvedBy || "-",
    "تاريخ الموافقة": o.approvedAt ? new Date(o.approvedAt).toLocaleString("ar-SA") : "-",
  }))

  exportToExcel(data, `orders_${new Date().toISOString().split("T")[0]}`, "الأوامر")
}

export function exportAuditLogsToExcel(logs: any[]) {
  const data = logs.map((log) => ({
    التاريخ: new Date(log.timestamp).toLocaleString("ar-SA"),
    المستخدم: log.userName,
    الإجراء:
      log.action === "create"
        ? "إنشاء"
        : log.action === "update"
          ? "تعديل"
          : log.action === "delete"
            ? "حذف"
            : log.action === "approve"
              ? "موافقة"
              : log.action === "reject"
                ? "رفض"
                : log.action === "login"
                  ? "تسجيل دخول"
                  : "تسجيل خروج",
    النوع:
      log.entityType === "allocation"
        ? "مخصص"
        : log.entityType === "order"
          ? "أمر"
          : log.entityType === "user"
            ? "مستخدم"
            : "النظام",
    التفاصيل: log.details,
  }))

  exportToExcel(data, `audit_logs_${new Date().toISOString().split("T")[0]}`, "سجل التدقيق")
}

export function exportFinancialReportToExcel(allocations: any[], orders: any[], summary: any) {
  const reportData = [
    { البيان: "إجمالي المخصصات", القيمة: summary.totalAllocations },
    { البيان: "إجمالي الأوامر", القيمة: summary.totalOrders },
    { البيان: "الرصيد الحالي", القيمة: summary.currentBalance },
    { البيان: "أوامر معلقة", القيمة: summary.pendingOrders },
    { البيان: "أوامر موافق عليها", القيمة: summary.approvedOrders },
    { البيان: "أوامر مدفوعة", القيمة: summary.paidOrders },
    { البيان: "", القيمة: "" },
    { البيان: "عدد المخصصات", القيمة: allocations.length },
    { البيان: "عدد الأوامر", القيمة: orders.length },
  ]

  exportToExcel(reportData, `financial_report_${new Date().toISOString().split("T")[0]}`, "التقرير المالي")
}
