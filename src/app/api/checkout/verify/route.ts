import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cancelStalePendingOrder } from "@/lib/orderStatus";

// GET /api/checkout/verify?reference=xxx — Verify payment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    await cancelStalePendingOrder(reference);

    // Get Paystack keys from settings
    const settings = await db.settings.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) settingsMap[s.key] = s.value;

    const secretKey = settingsMap.paystack_secret_key || process.env.PAYSTACK_SECRET_KEY || "";
    if (!secretKey) {
      return NextResponse.json({ error: "Paystack not configured" }, { status: 500 });
    }

    // Verify transaction with Paystack
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      return NextResponse.json({ error: "Verification failed", status: "failed" }, { status: 400 });
    }

    const transaction = paystackData.data;

    // Update order status
    if (transaction.status === "success" && transaction.reference) {
      await db.order.updateMany({
        where: { reference: transaction.reference },
        data: {
          status: "paid",
          paystackRef: transaction.reference,
          paidAt: new Date(),
        },
      });
    } else if (transaction.reference && ["failed", "abandoned", "cancelled"].includes(transaction.status)) {
      await db.order.updateMany({
        where: { reference: transaction.reference },
        data: {
          status: transaction.status === "abandoned" ? "cancelled" : transaction.status,
        },
      });
    }

    return NextResponse.json({
      status: transaction.status,
      reference: transaction.reference,
      amount: transaction.amount,
      paid_at: transaction.paid_at,
      channel: transaction.channel,
    });
  } catch (error) {
    console.error("GET /api/checkout/verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

// POST /api/checkout/verify — Paystack webhook handler
export async function POST(request: NextRequest) {
  try {
    // Read raw body to verify Paystack signature
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature") || "";

    // Get Paystack keys from settings or env
    const settings = await db.settings.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) settingsMap[s.key] = s.value;
    const secretKey = settingsMap.paystack_secret_key || process.env.PAYSTACK_SECRET_KEY || "";

    // If no secret key, accept but do not process (log)
    if (!secretKey) {
      console.warn("Paystack webhook received but no secret key configured");
      return NextResponse.json({ received: true });
    }

    // Verify signature (HMAC SHA512 of raw body)
    try {
      const crypto = await import("crypto");
      const expected = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");

      if (signature && signature !== expected) {
        console.warn("Invalid Paystack webhook signature");
        return NextResponse.json({ received: true });
      }
    } catch (err) {
      console.warn("Failed to verify Paystack signature", err);
      return NextResponse.json({ received: true });
    }

    const body = JSON.parse(rawBody);

    // Paystack webhook sends the event data
    if (body.event === "charge.success") {
      const data = body.data;
      const reference = data.reference;

      if (reference) {
        await db.order.updateMany({
          where: { reference },
          data: {
            status: "paid",
            paystackRef: reference,
            paidAt: new Date(),
          },
        });
      }
    } else if (body.event === "charge.failed" || body.event === "charge.abandoned") {
      const data = body.data;
      const reference = data.reference;

      if (reference) {
        await db.order.updateMany({
          where: { reference },
          data: {
            status: body.event === "charge.abandoned" ? "cancelled" : "failed",
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("POST /api/checkout/verify webhook error:", error);
    return NextResponse.json({ received: true }); // Always 200 for webhooks
  }
}
