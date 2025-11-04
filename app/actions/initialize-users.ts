"use server"

import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function initializeDefaultUsers() {
  try {
    const defaultUsers = [
      {
        email: "finance@military.gov",
        password: "finance123",
        username: "finance",
        full_name: "أحمد محمد العلي",
        role: "finance_officer",
        rank: "رائد",
        unit: "ركن المالية",
        phone: "+966501234567",
      },
      {
        email: "commander@military.gov",
        password: "commander123",
        username: "commander",
        full_name: "خالد عبدالله السالم",
        role: "commander",
        rank: "عقيد",
        unit: "قائد اللواء",
        phone: "+966501234568",
      },
      {
        email: "auditor@military.gov",
        password: "auditor123",
        username: "auditor",
        full_name: "محمد سعيد الأحمد",
        role: "auditor",
        rank: "نقيب",
        unit: "المراجعة المالية",
        phone: "+966501234569",
      },
    ]

    const results = []

    for (const user of defaultUsers) {
      // Check if user already exists
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("username", user.username)
        .single()

      if (existingProfile) {
        results.push({ email: user.email, status: "already_exists" })
        continue
      }

      // Create user in Supabase Auth
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      })

      if (authError) {
        console.error(`[v0] Error creating auth user ${user.email}:`, authError)
        results.push({ email: user.email, status: "error", error: authError.message })
        continue
      }

      if (!authUser.user) {
        results.push({ email: user.email, status: "error", error: "No user returned" })
        continue
      }

      // Create profile
      const { error: profileError } = await supabaseAdmin.from("profiles").insert({
        id: authUser.user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        rank: user.rank,
        unit: user.unit,
        phone: user.phone,
      })

      if (profileError) {
        console.error(`[v0] Error creating profile for ${user.email}:`, profileError)
        results.push({ email: user.email, status: "error", error: profileError.message })
        continue
      }

      results.push({ email: user.email, status: "success" })
    }

    return { success: true, results }
  } catch (error) {
    console.error("[v0] Error in initializeDefaultUsers:", error)
    return { success: false, error: String(error) }
  }
}
