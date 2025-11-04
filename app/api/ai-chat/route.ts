import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "لم يتم تكوين مفتاح API للذكاء الاصطناعي. يرجى إضافة GEMINI_API_KEY في متغيرات البيئة.",
        },
        { status: 500 },
      )
    }

    const systemPrompt = `أنت مساعد ذكاء اصطناعي متخصص في المالية العسكرية. تساعد في:
1. تحليل البيانات المالية والميزانيات
2. تقديم توصيات لتحسين الإنفاق
3. الإجابة على الأسئلة المتعلقة بالمخصصات والأوامر
4. إنشاء تقارير وملخصات مالية
5. تقديم نصائح حول إدارة الموارد المالية

السياق المالي الحالي:
${JSON.stringify(context, null, 2)}

يجب أن تكون إجاباتك:
- دقيقة ومهنية
- باللغة العربية الفصحى
- مختصرة ومفيدة
- تركز على الجوانب المالية والإدارية`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\nسؤال المستخدم: ${message}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Gemini API error:", errorData)
      return NextResponse.json({ error: "حدث خطأ في الاتصال بخدمة الذكاء الاصطناعي" }, { status: 500 })
    }

    const data = await response.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أتمكن من معالجة طلبك."

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error("[v0] AI chat error:", error)
    return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 })
  }
}
