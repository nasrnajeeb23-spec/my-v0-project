/**
 * Format a date to a readable string
 * @param date - Date object, string, or timestamp
 * @param formatType - Type of format: 'short', 'long', 'datetime', 'time'
 */
export function formatDate(
  date: Date | string | number,
  formatType: "short" | "long" | "datetime" | "time" = "short",
): string {
  const d = new Date(date)

  if (isNaN(d.getTime())) {
    return "تاريخ غير صالح"
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }

  switch (formatType) {
    case "long":
      return d.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    case "datetime":
      return d.toLocaleString("ar-SA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    case "time":
      return d.toLocaleTimeString("ar-SA", {
        hour: "2-digit",
        minute: "2-digit",
      })
    case "short":
    default:
      return d.toLocaleDateString("ar-SA", options)
  }
}

/**
 * Format a date to show relative time (e.g., "منذ 5 دقائق")
 */
export function formatDistanceToNow(date: Date | string | number): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSecs < 60) {
    return "منذ لحظات"
  } else if (diffMins < 60) {
    return `منذ ${diffMins} ${diffMins === 1 ? "دقيقة" : "دقائق"}`
  } else if (diffHours < 24) {
    return `منذ ${diffHours} ${diffHours === 1 ? "ساعة" : "ساعات"}`
  } else if (diffDays < 30) {
    return `منذ ${diffDays} ${diffDays === 1 ? "يوم" : "أيام"}`
  } else if (diffMonths < 12) {
    return `منذ ${diffMonths} ${diffMonths === 1 ? "شهر" : "أشهر"}`
  } else {
    return `منذ ${diffYears} ${diffYears === 1 ? "سنة" : "سنوات"}`
  }
}

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | string | number): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
