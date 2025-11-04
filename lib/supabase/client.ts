import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Missing Supabase environment variables:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
    })
    throw new Error(
      "Missing Supabase environment variables. Please check your .env file or Vercel environment variables.",
    )
  }

  console.log("[v0] Creating Supabase client with URL:", supabaseUrl)

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
