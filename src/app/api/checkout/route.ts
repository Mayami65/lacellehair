import { NextRequest, NextResponse } from "next/server"
import { db, schema } from "@/lib/db"
import { eq } from "drizzle-orm"

const { Order: OrderTable, Settings: SettingsTable } = schema

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.items || !body.email || !body.fullName || !body.phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const reference = `LAC-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`
    const now = new Date().toISOString()

    // Read Paystack key from settings or env
    const [setting] = await db.select({ value: SettingsTable.value })
      .from(SettingsTable)
      .where(eq(SettingsTable.key, "paystack_secret_key"))
    const secretKey = setting?.value || process.env["PAYSTACK_SECRET_KEY"] || ""

    const subtotal = body.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const shippingFee = body.shippingFee || 0
    const totalAmount = subtotal + shippingFee

    // Create order in DB
    const [order] = await db.insert(OrderTable).values({
      reference,
      email: body.email.toLowerCase().trim(),
      fullName: body.fullName,
      phone: body.phone,
      address: body.address || "",
      city: body.city || "",
      state: body.state || "",
      country: body.country || "Belgium",
      items: JSON.stringify(body.items),
      subtotal,
      shippingFee,
      totalAmount,
      currency: body.currency || "EUR",
      paystackRef: "",
      status: "pending",
      paymentMethod: body.paymentMethod || "paystack",
      createdAt: now,
      updatedAt: now,
    } as any).returning()

    // Initialize Paystack transaction
    const callbackUrl = `${process.env["NEXT_PUBLIC_BASE_URL"] || process.env["NEXTAUTH_URL"] || ""}/checkout/success?reference=${reference}`
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: order.email,
        amount: Math.round(totalAmount * 100), // Paystack uses kobo/pesewas
        reference,
        callback_url: callbackUrl,
        metadata: { orderId: order.id },
      }),
    })

    const paystackData = await paystackRes.json()

    if (paystackData.status) {
      return NextResponse.json({
        success: true,
        reference,
        paymentUrl: paystackData.data.authorization_url,
      })
    }

    return NextResponse.json({ success: false, error: "Payment initialization failed" }, { status: 500 })
  } catch (error) {
    console.error("POST /api/checkout error:", error)
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 })
  }
}
