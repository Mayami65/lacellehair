import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-08-01" });

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  const buf = await request.arrayBuffer();
  const sig = request.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(Buffer.from(buf), sig, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return new NextResponse(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata: any = session.metadata || {};
        const reference = metadata.reference as string | undefined;

        if (reference) {
          await db.order.updateMany({
            where: { reference },
            data: {
              status: "paid",
              paidAt: new Date(),
              paymentMethod: "stripe",
              paystackRef: session.id || "",
            },
          });
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const metadata: any = pi.metadata || {};
        const reference = metadata.reference as string | undefined;
        if (reference) {
          await db.order.updateMany({ where: { reference }, data: { status: "failed" } });
        }
        break;
      }
      default:
        // ignore
        break;
    }
  } catch (err) {
    console.error("Error handling Stripe webhook event:", err);
    return new NextResponse(JSON.stringify({ error: "Webhook handler failed" }), { status: 500 });
  }

  return NextResponse.json({ received: true });
}
