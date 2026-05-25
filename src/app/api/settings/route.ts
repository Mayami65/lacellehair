import { NextRequest, NextResponse } from "next/server"
import { db, schema } from "@/lib/db"
import { validateToken } from "@/lib/adminAuth"
import { eq } from "drizzle-orm"

const { Settings: SettingsTable } = schema

export async function GET() {
  try {
    const settings = await db.select().from(SettingsTable)
    const map: Record<string, string> = {}
    for (const s of settings) map[s.key] = s.value
    return NextResponse.json(map)
  } catch (error) {
    console.error("GET /api/settings error:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || ""
    const m = cookie.match(/lacelle_admin_token=([^;]+)/)
    const token = m ? m[1] : undefined
    if (!validateToken(token)) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const body = await request.json()
    const now = new Date().toISOString()

    for (const [key, value] of Object.entries(body)) {
      if (typeof value !== "string") continue
      const existing = await db.select({ id: SettingsTable.id }).from(SettingsTable).where(eq(SettingsTable.key, key))
      if (existing.length > 0) {
        await db.update(SettingsTable).set({ value, updatedAt: now }).where(eq(SettingsTable.key, key))
      } else {
        await db.insert(SettingsTable).values({ key, value, updatedAt: now } as any)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PUT /api/settings error:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
