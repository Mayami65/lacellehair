import { NextRequest, NextResponse } from "next/server"
import { db, schema } from "@/lib/db"
import { cancelStalePendingOrder } from "@/lib/orderStatus"
import { and, eq } from "drizzle-orm"

const { Order: OrderTable } = schema

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get("reference")?.trim()
    const email = searchParams.get("email")?.trim().toLowerCase()

    if (!reference || !email) {
      return NextResponse.json({ error: "reference and email are required" }, { status: 400 })
    }

    const [order] = await db.select({
      reference: OrderTable.reference,
      status: OrderTable.status,
      trackingNumber: OrderTable.trackingNumber,
      paidAt: OrderTable.paidAt,
      createdAt: OrderTable.createdAt,
      updatedAt: OrderTable.updatedAt,
      fullName: OrderTable.fullName,
    }).from(OrderTable).where(and(eq(OrderTable.reference, reference), eq(OrderTable.email, email)))

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const updatedOrder = await cancelStalePendingOrder(reference)
    const safeOrder = updatedOrder && "email" in updatedOrder ? updatedOrder : order

    return NextResponse.json({ order: safeOrder })
  } catch (error) {
    console.error("GET /api/orders/public error:", error)
    return NextResponse.json({ error: "Failed to look up order" }, { status: 500 })
  }
}
