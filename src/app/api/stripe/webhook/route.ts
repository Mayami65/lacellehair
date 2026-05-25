import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { db, schema } from "@/lib/db"
import { eq } from "drizzle-orm"

const { Order: OrderTable } = schema

export async function POST(request: NextRequest) {
  const stripeSecret = process.env["STRIPE_SECRET_KEY"]?.trim()
  if (!stripeSecret) {
    return new NextResponse(JSON.stringify({ error: "Stripe is not configured" }), { status: 500 })
  }
  const stripe = new Stripe(stripeSecret, { apiVersion: "2026-04-22.dahlia" })
  const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"] || ""
  const buf = await request.arrayBuffer()
  const sig = request.headers.get("stripe-signature") || ""

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(Buffer.from(buf), sig, webhookSecret)
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err)
    return new NextResponse(JSON.stringify({ error: "Invalid signature" }), { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const reference = session.metadata?.reference
        if (reference) {
          await db.update(OrderTable)
            .set({
              status: "paid",
              paidAt: new Date().toISOString(),
              paymentMethod: "stripe",
              paystackRef: session.id || "",
              updatedAt: new Date().toISOString(),
            })
            .where(eq(OrderTable.reference, reference))
        }
        break
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent
        const reference = pi.metadata?.reference
        if (reference) {
          await db.update(OrderTable)
            .set({ status: "failed", updatedAt: new Date().toISOString() })
            .where(eq(OrderTable.reference, reference))
        }
        break
      }
      default:
        break
    }
  } catch (err) {
    console.error("Error handling Stripe webhook event:", err)
    return new NextResponse(JSON.stringify({ error: "Webhook handler failed" }), { status: 500 })
  }

  return NextResponse.json({ received: true })
}
