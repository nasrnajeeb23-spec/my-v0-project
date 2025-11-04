"use client"

import { type ReactNode, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  Wallet,
  FileText,
  BarChart3,
  Bell,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Shield,
  Bot,
  Settings,
  ScrollText,
  Database,
  CreditCard,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { DataStore } from "@/lib/data-store"
import { Badge } from "@/components/ui/badge"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      DataStore.getNotifications()
        .then((notifications) => {
          setUnreadCount(notifications.filter((n) => !n.read).length)
        })
        .catch((error) => {
          console.error("[v0] Error fetching notifications:", error)
          setUnreadCount(0)
        })
    }
  }, [user, pathname])

  const handleLogout = async () => {
    try {
      console.log("[v0] Logging out user")
      await logout()
      console.log("[v0] Logout successful, redirecting to login")
      router.push("/login")
    } catch (error) {
      console.error("[v0] Error during logout:", error)
      alert("حدث خطأ أثناء تسجيل الخروج. يرجى المحاولة مرة أخرى.")
    }
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  const navigation = [
    {
      name: "لوحة التحكم",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["finance_officer", "commander", "auditor"],
    },
    {
      name: "المخصصات",
      href: "/allocations",
      icon: Wallet,
      roles: ["finance_officer", "auditor"],
    },
    {
      name: "الأوامر",
      href: "/orders",
      icon: FileText,
      roles: ["finance_officer", "commander", "auditor"],
    },
    {
      name: "الديون السابقة",
      href: "/debts",
      icon: CreditCard,
      roles: ["finance_officer", "commander", "auditor"],
    },
    {
      name: "الموارد البشرية",
      href: "/hr",
      icon: Users,
      roles: ["finance_officer", "commander"],
    },
    {
      name: "التقارير",
      href: "/reports",
      icon: BarChart3,
      roles: ["finance_officer", "commander", "auditor"],
    },
    {
      name: "سجل التدقيق",
      href: "/audit-logs",
      icon: ScrollText,
      roles: ["finance_officer", "auditor"],
    },
    {
      name: "مساعد الذكاء الاصطناعي",
      href: "/ai-assistant",
      icon: Bot,
      roles: ["finance_officer", "commander", "auditor"],
    },
    {
      name: "النسخ الاحتياطي",
      href: "/backup",
      icon: Database,
      roles: ["finance_officer"],
    },
    {
      name: "الإعدادات",
      href: "/settings",
      icon: Settings,
      roles: ["finance_officer", "commander", "auditor"],
    },
  ]

  const filteredNavigation = navigation.filter((item) => item.roles.includes(user?.role || ""))

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80 shadow-sm">
        <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-l from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                نظام إدارة المخصصات المالية
              </h1>
              <p className="text-xs text-muted-foreground">القوات المسلحة</p>
            </div>
          </div>

          <div className="mr-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="hover:bg-muted">
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Button variant="ghost" size="icon" asChild className="relative hover:bg-muted">
              <Link href="/notifications">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -left-1 h-5 w-5 flex items-center justify-center p-0 text-xs shadow-lg"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 hover:bg-muted">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                    {user?.fullName.charAt(0)}
                  </div>
                  <span className="hidden sm:inline font-medium">{user?.fullName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold">{user?.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.rank} - {user?.unit}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="ml-2 h-4 w-4" />
                    الإعدادات
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="ml-2 h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={cn(
            "fixed inset-y-0 right-0 z-40 w-64 border-l bg-card transition-transform duration-300 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:translate-x-0 shadow-lg",
            sidebarOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <nav className="flex flex-col gap-1 p-4">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-l from-primary to-primary/90 text-primary-foreground shadow-md"
                      : "hover:bg-muted text-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
