import { NextRequest, NextResponse } from "next/server"
import { db, schema } from "@/lib/db"
import { desc, eq, sql } from "drizzle-orm"

const { ContactMessage } = schema

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 })
    }

    const now = new Date().toISOString()
    const [msg] = await db.insert(ContactMessage).values({
      name: body.name,
      email: body.email,
      phone: body.phone || "",
      subject: body.subject || "",
      message: body.message,
      createdAt: now,
    } as any).returning()

    return NextResponse.json(msg, { status: 201 })
  } catch (error) {
    console.error("POST /api/contact error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const messages = await db.select().from(ContactMessage).orderBy(desc(ContactMessage.createdAt))
    return NextResponse.json(messages)
  } catch (error) {
    console.error("GET /api/contact error:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, read } = body
    if (!id) return NextResponse.json({ error: "Message ID is required" }, { status: 400 })

    const [msg] = await db.update(ContactMessage).set({ read } as any).where(eq(ContactMessage.id, id)).returning()
    return NextResponse.json(msg)
  } catch (error) {
    console.error("PUT /api/contact error:", error)
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 })
  }
}
