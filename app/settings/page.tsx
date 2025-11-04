"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { DataStore } from "@/lib/data-store"
import type { User, UserRole } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserIcon, Shield, Users, Trash2, Edit, Plus, Lock, Phone, Award, Building } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/page-header"
import { createClient } from "@/lib/supabase/client"

export default function SettingsPage() {
  const { user, updateCurrentUser } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    rank: user?.rank || "",
    unit: user?.unit || "",
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  })

  // New user form state
  const [newUserForm, setNewUserForm] = useState({
    username: "",
    password: "",
    fullName: "",
    role: "finance_officer" as UserRole,
    rank: "",
    unit: "",
    phone: "",
  })

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        phone: user.phone || "",
        rank: user.rank || "",
        unit: user.unit || "",
      })
    }
  }, [user])

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const allUsers = await DataStore.getUsers()
      setUsers(allUsers)
    } catch (error) {
      console.error("[v0] Error loading users:", error)
      toast({
        title: "خطأ في تحميل المستخدمين",
        description: "حدث خطأ أثناء تحميل قائمة المستخدمين",
        variant: "destructive",
      })
    }
  }

  const handleProfileUpdate = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      await updateCurrentUser(profileForm)

      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث معلومات الملف الشخصي",
      })
    } catch (error) {
      console.error("[v0] Error updating user:", error)
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث الملف الشخصي",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!user) return

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمة المرور الجديدة غير متطابقة",
        variant: "destructive",
      })
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive",
      })
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      })

      if (error) throw error

      setPasswordForm({ newPassword: "", confirmPassword: "" })
      setIsChangePasswordOpen(false)

      toast({
        title: "تم التحديث بنجاح",
        description: "تم تغيير كلمة المرور",
      })
    } catch (error) {
      console.error("[v0] Error changing password:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تغيير كلمة المرور",
        variant: "destructive",
      })
    }
  }

  const handleAddUser = async () => {
    if (!newUserForm.username || !newUserForm.password || !newUserForm.fullName) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    try {
      const existingUser = await DataStore.getUserByUsername(newUserForm.username)
      if (existingUser) {
        toast({
          title: "خطأ",
          description: "اسم المستخدم موجود بالفعل",
          variant: "destructive",
        })
        return
      }

      // Create user in Supabase Auth first
      const supabase = createClient()
      const email = `${newUserForm.username}@military.gov`

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: newUserForm.password,
        email_confirm: true,
      })

      if (authError) throw authError

      // Then create profile
      const newUser: User = {
        id: authData.user.id,
        username: newUserForm.username,
        password: "",
        fullName: newUserForm.fullName,
        role: newUserForm.role,
        rank: newUserForm.rank,
        unit: newUserForm.unit,
        phone: newUserForm.phone,
      }

      await DataStore.addUser(newUser)
      await loadUsers()
      setIsAddUserOpen(false)
      setNewUserForm({
        username: "",
        password: "",
        fullName: "",
        role: "finance_officer",
        rank: "",
        unit: "",
        phone: "",
      })

      toast({
        title: "تم الإضافة بنجاح",
        description: "تم إضافة المستخدم الجديد",
      })
    } catch (error) {
      console.error("[v0] Error adding user:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المستخدم",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
      toast({
        title: "خطأ",
        description: "لا يمكنك حذف حسابك الخاص",
        variant: "destructive",
      })
      return
    }

    try {
      await DataStore.deleteUser(userId)
      await loadUsers()

      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف المستخدم",
      })
    } catch (error) {
      console.error("[v0] Error deleting user:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المستخدم",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = async (editedUser: User) => {
    try {
      await DataStore.updateUser(editedUser.id, editedUser)
      await loadUsers()
      setEditingUser(null)

      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات المستخدم",
      })
    } catch (error) {
      console.error("[v0] Error updating user:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث المستخدم",
        variant: "destructive",
      })
    }
  }

  const getRoleName = (role: UserRole) => {
    const roles = {
      finance_officer: "ركن المالية",
      commander: "القائد",
      auditor: "المراجع المالي",
    }
    return roles[role]
  }

  const getRoleColor = (role: UserRole) => {
    const colors = {
      finance_officer: "bg-primary/10 text-primary border-primary/20",
      commander: "bg-destructive/10 text-destructive border-destructive/20",
      auditor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    }
    return colors[role]
  }

  if (!user) return null

  const canManageUsers = user.role === "finance_officer" || user.role === "commander"

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHeader title="الإعدادات" description="إدارة الحساب والمستخدمين وإعدادات النظام" />

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="profile" className="gap-2">
              <UserIcon className="h-4 w-4" />
              الملف الشخصي
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="h-4 w-4" />
              الأمان
            </TabsTrigger>
            {canManageUsers && (
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                المستخدمون
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="border-2 bg-card/50 backdrop-blur-sm p-8">
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-xl">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-primary/60">
                        {profileForm.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 space-y-2">
                    <h2 className="text-3xl font-bold">{profileForm.fullName}</h2>
                    <Badge className={`${getRoleColor(user.role)} text-base px-4 py-1`}>{getRoleName(user.role)}</Badge>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      {profileForm.rank}
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      الاسم الكامل
                    </Label>
                    <Input
                      id="fullName"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rank" className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      الرتبة
                    </Label>
                    <Input
                      id="rank"
                      value={profileForm.rank}
                      onChange={(e) => setProfileForm({ ...profileForm, rank: e.target.value })}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit" className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      الوحدة
                    </Label>
                    <Input
                      id="unit"
                      value={profileForm.unit}
                      onChange={(e) => setProfileForm({ ...profileForm, unit: e.target.value })}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      رقم الهاتف
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="h-12"
                    />
                  </div>
                </div>

                <Button onClick={handleProfileUpdate} size="lg" className="w-full md:w-auto px-12" disabled={isSaving}>
                  {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="border-2 bg-card/50 backdrop-blur-sm p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">الأمان وكلمة المرور</h3>
                  <p className="text-muted-foreground">قم بتغيير كلمة المرور الخاصة بك للحفاظ على أمان حسابك</p>
                </div>

                <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg" className="gap-2 bg-transparent">
                      <Lock className="h-5 w-5" />
                      تغيير كلمة المرور
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>تغيير كلمة المرور</DialogTitle>
                      <DialogDescription>أدخل كلمة المرور الجديدة</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        />
                      </div>
                      <Button onClick={handlePasswordChange} className="w-full">
                        تغيير كلمة المرور
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-6">
                  <div className="flex items-start gap-4">
                    <Shield className="h-6 w-6 text-primary mt-1" />
                    <div className="space-y-2">
                      <h4 className="font-semibold">نصائح الأمان</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• استخدم كلمة مرور قوية تحتوي على أحرف وأرقام ورموز</li>
                        <li>• لا تشارك كلمة المرور مع أي شخص</li>
                        <li>• قم بتغيير كلمة المرور بشكل دوري</li>
                        <li>• تأكد من تسجيل الخروج عند الانتهاء</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {canManageUsers && (
            <TabsContent value="users" className="space-y-6">
              <Card className="border-2 bg-card/50 backdrop-blur-sm p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">إدارة المستخدمين</h3>
                      <p className="text-muted-foreground">إضافة وتعديل وحذف المستخدمين وصلاحياتهم</p>
                    </div>
                    <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                      <DialogTrigger asChild>
                        <Button size="lg" className="gap-2">
                          <Plus className="h-5 w-5" />
                          إضافة مستخدم
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                          <DialogDescription>أدخل بيانات المستخدم الجديد وحدد صلاحياته</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="newUsername">اسم المستخدم *</Label>
                            <Input
                              id="newUsername"
                              value={newUserForm.username}
                              onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">كلمة المرور *</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              value={newUserForm.password}
                              onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="newFullName">الاسم الكامل *</Label>
                            <Input
                              id="newFullName"
                              value={newUserForm.fullName}
                              onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="newRole">الصلاحية *</Label>
                            <Select
                              value={newUserForm.role}
                              onValueChange={(value: UserRole) => setNewUserForm({ ...newUserForm, role: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="finance_officer">ركن المالية</SelectItem>
                                <SelectItem value="commander">القائد</SelectItem>
                                <SelectItem value="auditor">المراجع المالي</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newRank">الرتبة</Label>
                            <Input
                              id="newRank"
                              value={newUserForm.rank}
                              onChange={(e) => setNewUserForm({ ...newUserForm, rank: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newPhone">رقم الهاتف</Label>
                            <Input
                              id="newPhone"
                              type="tel"
                              value={newUserForm.phone}
                              onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="newUnit">الوحدة</Label>
                            <Input
                              id="newUnit"
                              value={newUserForm.unit}
                              onChange={(e) => setNewUserForm({ ...newUserForm, unit: e.target.value })}
                            />
                          </div>
                        </div>
                        <Button onClick={handleAddUser} className="w-full">
                          إضافة المستخدم
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {users.map((u) => (
                      <Card key={u.id} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-16 w-16 border-2 border-primary/20">
                                <AvatarImage src="/placeholder.svg" />
                                <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-primary/60">
                                  {u.fullName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-bold text-lg">{u.fullName}</h4>
                                <p className="text-sm text-muted-foreground">{u.rank}</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Badge className={`${getRoleColor(u.role)} w-full justify-center py-1`}>
                              {getRoleName(u.role)}
                            </Badge>
                            <div className="text-sm space-y-1 text-muted-foreground">
                              <p className="flex items-center gap-2">
                                <UserIcon className="h-3 w-3" />
                                {u.username}
                              </p>
                              {u.phone && (
                                <p className="flex items-center gap-2">
                                  <Phone className="h-3 w-3" />
                                  {u.phone}
                                </p>
                              )}
                            </div>
                          </div>

                          {u.id !== user.id && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 gap-2 bg-transparent"
                                onClick={() => setEditingUser(u)}
                              >
                                <Edit className="h-4 w-4" />
                                تعديل
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="gap-2"
                                onClick={() => handleDeleteUser(u.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>

              <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
                    <DialogDescription>قم بتعديل بيانات المستخدم وصلاحياته</DialogDescription>
                  </DialogHeader>
                  {editingUser && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <Label>الاسم الكامل</Label>
                        <Input
                          value={editingUser.fullName}
                          onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>الصلاحية</Label>
                        <Select
                          value={editingUser.role}
                          onValueChange={(value: UserRole) => setEditingUser({ ...editingUser, role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="finance_officer">ركن المالية</SelectItem>
                            <SelectItem value="commander">القائد</SelectItem>
                            <SelectItem value="auditor">المراجع المالي</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>الرتبة</Label>
                        <Input
                          value={editingUser.rank}
                          onChange={(e) => setEditingUser({ ...editingUser, rank: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>رقم الهاتف</Label>
                        <Input
                          type="tel"
                          value={editingUser.phone || ""}
                          onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>الوحدة</Label>
                        <Input
                          value={editingUser.unit}
                          onChange={(e) => setEditingUser({ ...editingUser, unit: e.target.value })}
                        />
                      </div>
                      <Button onClick={() => handleEditUser(editingUser)} className="md:col-span-2">
                        حفظ التغييرات
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
