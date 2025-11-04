"use client"

import { forwardRef } from "react"
import type { Order } from "@/lib/types"
import { formatCurrency, CURRENCY_NAMES } from "@/lib/currency-utils"
import { formatDate } from "@/lib/date-utils"
import { Shield, CheckCircle } from "lucide-react"

interface OrderReceiptProps {
  order: Order
}

export const OrderReceipt = forwardRef<HTMLDivElement, OrderReceiptProps>(({ order }, ref) => {
  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-receipt,
          .print-receipt * {
            visibility: visible;
          }
          .print-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

      <div ref={ref} className="print-receipt bg-white p-8 max-w-2xl mx-auto" dir="rtl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center border-b-2 border-gray-800 pb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="h-12 w-12 text-gray-800" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">القوات المسلحة</h1>
            <h2 className="text-xl font-semibold text-gray-700">نظام إدارة المخصصات المالية</h2>
            <p className="text-lg font-medium text-gray-600 mt-2">إيصال أمر صرف</p>
          </div>

          {/* Order Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600 mb-1">رقم الأمر</p>
                <p className="text-lg font-bold text-gray-800">{order.orderNumber}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600 mb-1">التاريخ</p>
                <p className="text-lg font-bold text-gray-800">{formatDate(order.date, "long")}</p>
              </div>
            </div>

            <div className="border-2 border-gray-800 p-6 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">المبلغ</p>
                <p className="text-3xl font-bold text-gray-800">{formatCurrency(order.amount, order.currency)}</p>
              </div>
              <div className="text-center py-2 border-t border-gray-300">
                <p className="text-sm text-gray-600">{CURRENCY_NAMES[order.currency]}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">المستفيد:</span>
                <span className="font-semibold text-gray-800">{order.beneficiary}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">الغرض:</span>
                <span className="font-semibold text-gray-800">{order.purpose}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">الحالة:</span>
                <span className="font-semibold text-gray-800">
                  {order.status === "paid" && "مدفوع"}
                  {order.status === "approved" && "موافق عليه"}
                  {order.status === "pending" && "معلق"}
                  {order.status === "rejected" && "مرفوض"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">أنشئ بواسطة:</span>
                <span className="font-semibold text-gray-800">{order.createdBy}</span>
              </div>
              {order.approvedBy && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">وافق عليه:</span>
                  <span className="font-semibold text-gray-800">{order.approvedBy}</span>
                </div>
              )}
            </div>

            {order.notes && (
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600 mb-2">ملاحظات:</p>
                <p className="text-gray-800">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t-2 border-gray-800 pt-6 mt-8">
            <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
              <CheckCircle className="h-6 w-6" />
              <p className="font-semibold">إيصال معتمد</p>
            </div>
            <p className="text-center text-sm text-gray-600">تم الإصدار في: {formatDate(new Date(), "datetime")}</p>
            <p className="text-center text-xs text-gray-500 mt-2">
              هذا الإيصال صادر من نظام إدارة المخصصات المالية - القوات المسلحة
            </p>
          </div>
        </div>
      </div>
    </>
  )
})

OrderReceipt.displayName = "OrderReceipt"
