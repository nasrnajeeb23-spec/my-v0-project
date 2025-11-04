"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  showBackButton?: boolean
}

export function PageHeader({ title, description, action, showBackButton = true }: PageHeaderProps) {
  const router = useRouter()

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard")} className="shrink-0">
            <ArrowRight className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-l from-foreground to-foreground/70 bg-clip-text">
            {title}
          </h1>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      </div>
      {action && <div className="flex gap-2">{action}</div>}
    </div>
  )
}
