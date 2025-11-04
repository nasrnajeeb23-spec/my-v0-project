"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DataStore } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Mail, Phone, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [foundUser, setFoundUser] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSearch = () => {
    setIsSearching(true)
    const users = DataStore.getUsers()

    const user = users.find((u) => (email && u.email === email) || (phone && u.phone === phone))

    if (user) {
      setFoundUser(user)
      toast({
        title: "تم العثور على الحساب",
        description: "يرجى التواصل مع ركن المالية لإعادة تعيين كلمة المرور",
      })
    } else {
      toast({
        title: "لم يتم العثور على الحساب",
        description: "يرجى التحقق من البيانات المدخلة أو التواصل مع ركن المالية",
        variant: "destructive",
      })
    }

    setIsSearching(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-secondary/20 p-4">
      <Card className="w-full max-w-md border-primary/20 shadow-premium-lg">
        <CardHeader className="space-y-6 text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-balance">استعادة كلمة المرور</CardTitle>
            <CardDescription className="text-base mt-3">
              أدخل بريدك الإلكتروني أو رقم هاتفك للبحث عن حسابك
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!foundUser ? (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pr-11 h-11"
                      placeholder="أدخل بريدك الإلكتروني"
                    />
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground">أو</div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">رقم الهاتف</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pr-11 h-11"
                      placeholder="أدخل رقم هاتفك"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSearch}
                className="w-full h-11 text-base font-semibold shadow-md"
                disabled={isSearching || (!email && !phone)}
              >
                {isSearching ? "جاري البحث..." : "البحث عن الحساب"}
              </Button>
            </>
          ) : (
            <div className="space-y-6">
              <div className="p-6 bg-primary/5 border-2 border-primary/20 rounded-xl space-y-4">
                <h3 className="font-bold text-lg">تم العثور على حسابك</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-semibold">الاسم:</span> {foundUser.fullName}
                  </p>
                  <p>
                    <span className="font-semibold">اسم المستخدم:</span> {foundUser.username}
                  </p>
                  <p>
                    <span className="font-semibold">الرتبة:</span> {foundUser.rank}
                  </p>
                  <p>
                    <span className="font-semibold">الوحدة:</span> {foundUser.unit}
                  </p>
                </div>
              </div>

              <div className="p-5 bg-muted/50 rounded-xl text-sm border border-border/50">
                <p className="text-muted-foreground leading-relaxed text-center">
                  يرجى التواصل مع ركن المالية لإعادة تعيين كلمة المرور الخاصة بك
                </p>
              </div>

              <Button onClick={() => setFoundUser(null)} variant="outline" className="w-full h-11">
                بحث عن حساب آخر
              </Button>
            </div>
          )}

          <div className="text-center">
            <Link href="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              العودة لتسجيل الدخول
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
