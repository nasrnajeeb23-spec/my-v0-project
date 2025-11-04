"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DataStore } from "@/lib/data-store"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Send, Sparkles, AlertCircle, Lightbulb } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PageHeader } from "@/components/page-header"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function AIAssistantPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user && messages.length === 0) {
      // Welcome message
      setMessages([
        {
          role: "assistant",
          content: `مرحباً ${user.fullName}! أنا مساعدك الذكي للشؤون المالية. يمكنني مساعدتك في:\n\n• تحليل البيانات المالية\n• تقديم توصيات لتحسين الإنفاق\n• الإجابة على أسئلتك حول المخصصات والأوامر\n• إنشاء تقارير وملخصات\n\nكيف يمكنني مساعدتك اليوم؟`,
          timestamp: new Date(),
        },
      ])
    }
  }, [user, isLoading, router, messages.length])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      // Get financial context
      const allocations = DataStore.getAllocations()
      const orders = DataStore.getOrders()
      const summary = DataStore.getFinancialSummary()

      const context = {
        summary,
        recentAllocations: allocations.slice(-5),
        recentOrders: orders.slice(-5),
      }

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          context,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error,
            timestamp: new Date(),
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
            timestamp: new Date(),
          },
        ])
      }
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const suggestedQuestions = [
    "ما هو الوضع المالي الحالي؟",
    "هل هناك أوامر معلقة تحتاج موافقة؟",
    "ما هي توصياتك لتحسين الإنفاق؟",
    "قدم لي ملخص للمخصصات الأخيرة",
  ]

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 h-[calc(100vh-12rem)]">
        <PageHeader title="مساعد الذكاء الاصطناعي" description="احصل على تحليلات وتوصيات مالية ذكية" />

        <div className="grid gap-4 h-full">
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                المحادثة
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
              <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div
                        className={`rounded-lg p-3 max-w-[80%] ${
                          message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString("ar-SA", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {message.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium">{user.fullName.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <div className="rounded-lg p-3 bg-muted">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {messages.length === 1 && (
                <div className="grid gap-2 md:grid-cols-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="justify-start text-right h-auto py-2 bg-transparent"
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      <Lightbulb className="ml-2 h-4 w-4 flex-shrink-0" />
                      <span className="text-xs">{question}</span>
                    </Button>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="اكتب سؤالك هنا..."
                  disabled={isTyping}
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-blue-900 dark:text-blue-100">
                  <strong>ملاحظة:</strong> لتفعيل ميزة الذكاء الاصطناعي، يرجى إضافة{" "}
                  <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">GEMINI_API_KEY</code> في متغيرات البيئة من
                  قسم Vars في الشريط الجانبي.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
