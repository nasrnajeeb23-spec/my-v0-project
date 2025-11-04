"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import {
  Users,
  UserPlus,
  Search,
  Calendar,
  Award,
  Briefcase,
  Heart,
  Shield,
  TrendingUp,
  FileText,
  Clock,
} from "lucide-react"

export default function HRPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const stats = [
    { label: "إجمالي الأفراد", value: "0", icon: Users, color: "text-blue-500" },
    { label: "في الخدمة", value: "0", icon: Shield, color: "text-green-500" },
    { label: "في إجازة", value: "0", icon: Calendar, color: "text-orange-500" },
    { label: "متقاعدون", value: "0", icon: Award, color: "text-gray-500" },
  ]

  const modules = [
    {
      title: "سجلات الأفراد",
      description: "إدارة البيانات الشخصية والعسكرية للأفراد",
      icon: Users,
      color: "bg-blue-500",
      href: "/hr/personnel",
    },
    {
      title: "الحضور والانصراف",
      description: "تسجيل ومتابعة حضور وانصراف الأفراد",
      icon: Clock,
      color: "bg-green-500",
      href: "/hr/attendance",
    },
    {
      title: "الإجازات",
      description: "إدارة طلبات الإجازات والموافقات",
      icon: Calendar,
      color: "bg-orange-500",
      href: "/hr/leaves",
    },
    {
      title: "التقييمات",
      description: "تقييم أداء الأفراد والكفاءات",
      icon: TrendingUp,
      color: "bg-purple-500",
      href: "/hr/evaluations",
    },
    {
      title: "التدريبات والدورات",
      description: "متابعة التدريبات والشهادات",
      icon: Briefcase,
      color: "bg-cyan-500",
      href: "/hr/trainings",
    },
    {
      title: "الترقيات",
      description: "إدارة ترقيات الرتب والمناصب",
      icon: Award,
      color: "bg-yellow-500",
      href: "/hr/promotions",
    },
    {
      title: "الجزاءات والمكافآت",
      description: "تسجيل الجزاءات والمكافآت",
      icon: FileText,
      color: "bg-red-500",
      href: "/hr/disciplinary",
    },
    {
      title: "السجل الطبي",
      description: "متابعة الحالة الصحية واللياقة",
      icon: Heart,
      color: "bg-pink-500",
      href: "/hr/medical",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHeader title="إدارة الموارد البشرية" description="نظام شامل لإدارة شؤون الأفراد والموارد البشرية للواء" />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="p-6 border-2 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 border-2 bg-card/50 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="البحث عن فرد..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-11 h-11"
              />
            </div>
            <Button size="lg" className="gap-2 w-full md:w-auto">
              <UserPlus className="h-5 w-5" />
              إضافة فرد جديد
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {modules.map((module) => (
              <Card
                key={module.title}
                className="p-6 hover:shadow-xl transition-all cursor-pointer border-2 hover:border-primary/50 group"
              >
                <div className="space-y-4">
                  <div
                    className={`w-14 h-14 rounded-2xl ${module.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <module.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">{module.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{module.description}</p>
                  </div>
                  <Badge variant="outline" className="w-full justify-center">
                    قريباً
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        <Card className="p-8 border-2 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-bold text-xl">نظام إدارة الموارد البشرية الشامل</h3>
              <p className="text-muted-foreground leading-relaxed">
                نظام متكامل لإدارة جميع شؤون الأفراد من التعيين حتى التقاعد، يشمل الحضور والانصراف، الإجازات، التقييمات،
                التدريبات، الترقيات، السجلات الطبية، والمعدات المخصصة.
              </p>
              <ul className="grid md:grid-cols-2 gap-2 mt-4 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  إدارة سجلات الأفراد الكاملة
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  نظام حضور وانصراف متقدم
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  إدارة الإجازات والموافقات
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  تقييمات الأداء الدورية
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  متابعة التدريبات والشهادات
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  إدارة الترقيات والجزاءات
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  السجلات الطبية واللياقة
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  تتبع المعدات المخصصة
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
