import { NextRequest, NextResponse } from "next/server"
import { db, schema } from "@/lib/db"
import { validateToken } from "@/lib/adminAuth"
import { eq, or, like, and, gte, lte, desc, sql } from "drizzle-orm"

const { Order: OrderTable } = schema

function unauthorized() {
  return new NextResponse(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } })
}

function getAdminTokenFromHeaders(req: NextRequest) {
  const cookie = req.headers.get("cookie") || ""
  const m = cookie.match(/lacelle_admin_token=([^;]+)/)
  return m ? m[1] : undefined
}

export async function GET(req: NextRequest) {
  const token = getAdminTokenFromHeaders(req)
  if (!validateToken(token)) return unauthorized()

  const url = new URL(req.url)
  const id = url.searchParams.get("id")
  const status = url.searchParams.get("status")
  const q = url.searchParams.get("q")
  const from = url.searchParams.get("from")
  const to = url.searchParams.get("to")
  const format = url.searchParams.get("format")
  const page = Number(url.searchParams.get("page") || "1")
  const limit = Math.min(Number(url.searchParams.get("limit") || "50"), 200)

  if (id) {
    const [order] = await db.select().from(OrderTable).where(eq(OrderTable.id, id))
    return NextResponse.json(order || null)
  }

  const conditions: any[] = []
  if (status) conditions.push(eq(OrderTable.status, status))
  if (q) {
    conditions.push(or(
      like(OrderTable.email, `%${q}%`),
      like(OrderTable.fullName, `%${q}%`),
      like(OrderTable.reference, `%${q}%`),
    ))
  }
  if (from) {
    const d = new Date(from)
    if (!isNaN(d.getTime())) conditions.push(gte(OrderTable.createdAt, d.toISOString()))
  }
  if (to) {
    const d = new Date(to)
    if (!isNaN(d.getTime())) conditions.push(lte(OrderTable.createdAt, d.toISOString()))
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [orders, [{ count: total }]] = await Promise.all([
    db.select().from(OrderTable).where(where).orderBy(desc(OrderTable.createdAt)).offset((page - 1) * limit).limit(limit),
    db.select({ count: sql<number>`count(*)` }).from(OrderTable).where(where),
  ])

  if (format === "csv") {
    const escape = (v: any) => {
      if (v === null || v === undefined) return ""
      return `"${String(v).replace(/"/g, '""')}"`
    }
    const header = ["id", "reference", "fullName", "email", "phone", "totalAmount", "currency", "status", "trackingNumber", "createdAt", "items"]
    const rows = orders.map((o) => header.map((h) => escape((o as any)[h])).join(","))
    const csv = [header.join(","), ...rows].join("\n")
    return new NextResponse(csv, { status: 200, headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=orders.csv" } })
  }

  return NextResponse.json({ orders, total: Number(total), page, limit })
}

export async function PATCH(req: NextRequest) {
  const token = getAdminTokenFromHeaders(req)
  if (!validateToken(token)) return unauthorized()

  let body: any
  try { body = await req.json() } catch { return new NextResponse(JSON.stringify({ error: "invalid json" }), { status: 400, headers: { "Content-Type": "application/json" } }) }

  const { id, status, trackingNumber } = body
  if (!id) return new NextResponse(JSON.stringify({ error: "missing id" }), { status: 400, headers: { "Content-Type": "application/json" } })

  if (status === "shipped" && !trackingNumber?.trim()) {
    return new NextResponse(JSON.stringify({ error: "Tracking number is required to mark as shipped" }), { status: 400, headers: { "Content-Type": "application/json" } })
  }

  const set: any = { updatedAt: new Date().toISOString() }
  if (status) set.status = status
  if (trackingNumber) {
    if (!/^[A-Za-z0-9\-_.]{3,128}$/.test(trackingNumber)) {
      return new NextResponse(JSON.stringify({ error: "invalid trackingNumber format" }), { status: 400, headers: { "Content-Type": "application/json" } })
    }
    set.trackingNumber = trackingNumber
  }
  if (status === "paid") set.paidAt = new Date().toISOString()

  try {
    const [o] = await db.update(OrderTable).set(set).where(eq(OrderTable.id, id)).returning()
    return NextResponse.json(o)
  } catch (err: any) {
    return new NextResponse(JSON.stringify({ error: err.message || "update failed" }), { status: 500, headers: { "Content-Type": "application/json" } })
  }
}
