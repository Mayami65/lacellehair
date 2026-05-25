import { NextRequest, NextResponse } from "next/server"
import { db, schema } from "@/lib/db"
import { cancelStalePendingOrder } from "@/lib/orderStatus"
import { eq } from "drizzle-orm"

const { Order: OrderTable, Settings: SettingsTable } = schema

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get("reference")

    if (!reference) {
      return NextResponse.json({ error: "Reference is required" }, { status: 400 })
    }

    const [order] = await db.select().from(OrderTable).where(eq(OrderTable.reference, reference))

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Already paid / fulfilled
    if (order.status === "paid" || order.status === "shipped" || order.status === "delivered") {
      return NextResponse.json({ status: "success", order })
    }

    // Stripe orders are confirmed via webhook — if still pending, webhook hasn't arrived yet
    if (order.paymentMethod === "stripe") {
      return NextResponse.json({ status: "processing", order })
    }

    // Verify with Paystack
    const [setting] = await db.select({ value: SettingsTable.value })
      .from(SettingsTable)
      .where(eq(SettingsTable.key, "paystack_secret_key"))
    const secretKey = setting?.value || process.env["PAYSTACK_SECRET_KEY"] || ""

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    })
    const verifyData = await verifyRes.json()

    if (verifyData.status && verifyData.data.status === "success") {
      const [updated] = await db.update(OrderTable)
        .set({ status: "paid", paystackRef: reference, paidAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
        .where(eq(OrderTable.id, order.id))
        .returning()

      return NextResponse.json({ status: "success", order: updated })
    }

    const updated = await cancelStalePendingOrder(reference)

    return NextResponse.json({
      status: order.status,
      order: updated || order,
    })
  } catch (error) {
    console.error("GET /api/checkout/verify error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
