import type { Currency } from "./types"

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  YER: "ر.ي",
  USD: "$",
  EUR: "€",
  SAR: "ر.س",
}

export const CURRENCY_NAMES: Record<Currency, string> = {
  YER: "ريال يمني",
  USD: "دولار أمريكي",
  EUR: "يورو",
  SAR: "ريال سعودي",
}

export const DEFAULT_CURRENCY: Currency = "YER"

export function formatCurrency(amount: number | null | undefined, currency: Currency = "YER"): string {
  const symbol = CURRENCY_SYMBOLS[currency]
  const safeAmount = amount ?? 0
  return `${safeAmount.toLocaleString("ar-SA")} ${symbol}`
}
