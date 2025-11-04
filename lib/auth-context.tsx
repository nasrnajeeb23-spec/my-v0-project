"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "./types"
import { createClient } from "./supabase/client"
import { DataStore } from "./data-store"

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  updateCurrentUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const USERNAME_TO_EMAIL: Record<string, string> = {
  finance: "finance@military.gov",
  commander: "commander@military.gov",
  auditor: "auditor@military.gov",
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    DataStore.initializeData()

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (profile) {
      setUser({
        id: profile.id,
        username: profile.username,
        password: "",
        role: profile.role as "finance_officer" | "commander" | "auditor",
        fullName: profile.full_name,
        rank: profile.rank,
        unit: profile.unit,
        email: profile.username,
        phone: profile.phone,
        isFirstLogin: false,
      })
    }
    setIsLoading(false)
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const email = USERNAME_TO_EMAIL[username] || username
      console.log("[v0] Attempting login with email:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        console.error("[v0] Login error:", error.message)
        return false
      }

      if (data.user) {
        await loadUserProfile(data.user.id)

        await DataStore.addAuditLog({
          userId: data.user.id,
          userName: user?.fullName || username,
          action: "login",
          entityType: "system",
          details: `تسجيل دخول المستخدم`,
        })

        return true
      }

      return false
    } catch (error) {
      console.error("[v0] Login exception:", error)
      return false
    }
  }

  const logout = async () => {
    if (user) {
      await DataStore.addAuditLog({
        userId: user.id,
        userName: user.fullName,
        action: "logout",
        entityType: "system",
        details: `تسجيل خروج المستخدم ${user.fullName}`,
      })
    }

    await supabase.auth.signOut()
    setUser(null)
  }

  const updateCurrentUser = async (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)

      const dbUpdates: any = {}
      if (updates.fullName) dbUpdates.full_name = updates.fullName
      if (updates.rank) dbUpdates.rank = updates.rank
      if (updates.unit) dbUpdates.unit = updates.unit
      if (updates.phone) dbUpdates.phone = updates.phone

      await supabase.from("profiles").update(dbUpdates).eq("id", user.id)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
