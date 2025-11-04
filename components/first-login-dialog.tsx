"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { Lock, User, AlertCircle } from "lucide-react"

interface FirstLoginDialogProps {
  open: boolean
  onClose: () => void
}

export function FirstLoginDialog({ open, onClose }: FirstLoginDialogProps) {
  const { user, updateCurrentUser } = useAuth()
  const [newUsername, setNewUsername] = useState(user?.username || "")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("كلمة المرور غير متطابقة")
      return
    }

    if (!newUsername.trim()) {
      setError("اسم المستخدم مطلوب")
      return
    }

    setIsLoading(true)

    try {
      updateCurrentUser({
        username: newUsername,
        password: newPassword,
        isFirstLogin: false,
      })
      onClose()
    } catch (error) {
      setError("حدث خطأ أثناء حفظ التغييرات")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    updateCurrentUser({
      isFirstLogin: false,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">مرحباً بك في النظام</DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            يُنصح بتغيير اسم المستخدم وكلمة المرور الخاصة بك لحماية حسابك
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-semibold">
              اسم المستخدم الجديد
            </Label>
            <div className="relative">
              <User className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="pr-11 h-11"
                placeholder="أدخل اسم المستخدم الجديد"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold">
              كلمة المرور الجديدة
            </Label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-11 h-11"
                placeholder="أدخل كلمة المرور الجديدة"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-semibold">
              تأكيد كلمة المرور
            </Label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-11 h-11"
                placeholder="أعد إدخال كلمة المرور"
              />
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2 border border-destructive/20">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleSkip} className="flex-1 h-11 bg-transparent">
              تخطي الآن
            </Button>
            <Button type="submit" className="flex-1 h-11" disabled={isLoading}>
              {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
