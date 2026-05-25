import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { db, schema } from "@/lib/db"

const { Order: OrderTable } = schema

const stripe = new Stripe(process.env["STRIPE_SECRET_KEY"] || "", { apiVersion: "2024-08-01" })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, fullName, phone, address, city, state, country, items, subtotal, shippingFee, totalAmount, currency } = body

    if (!email || !fullName || !items || !totalAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    const reference = `LAC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const now = new Date().toISOString()

    const [order] = await db.insert(OrderTable).values({
      reference,
      email,
      fullName,
      phone,
      address: address || "",
      city: city || "",
      state: state || "",
      country: country || "",
      items: JSON.stringify(items),
      subtotal: subtotal || 0,
      shippingFee: shippingFee || 0,
      totalAmount,
      currency: currency || "USD",
      status: "pending",
      paymentMethod: "stripe",
      createdAt: now,
      updatedAt: now,
    } as any).returning()

    const baseUrl = process.env["NEXT_PUBLIC_BASE_URL"] || process.env["NEXTAUTH_URL"] || ""

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((it: any) => ({
        price_data: {
          currency: (currency || "USD").toLowerCase(),
          product_data: { name: it.name },
          unit_amount: Math.round((it.price || 0) * 100),
        },
        quantity: it.quantity || 1,
      })),
      mode: "payment",
      success_url: `${baseUrl}/checkout/success?reference=${reference}`,
      cancel_url: `${baseUrl}/checkout?canceled=true`,
      metadata: { order_id: order.id, reference },
      customer_email: email,
    })

    return NextResponse.json({ url: session.url, id: session.id })
  } catch (error) {
    console.error("/api/stripe/create-session error:", error)
    return NextResponse.json({ error: "Stripe checkout creation failed" }, { status: 500 })
  }
}
