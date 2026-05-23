import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/checkout — Initialize a Paystack transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, fullName, phone, address, city, state, country, items, subtotal, shippingFee, totalAmount, currency } = body;

    // Validation
    if (!email || !fullName || !phone || !items || !totalAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Generate a unique order reference
    const reference = `LAC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Get Paystack keys from settings (fall back to env vars)
    const settings = await db.settings.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) settingsMap[s.key] = s.value;

    const secretKey = settingsMap.paystack_secret_key || process.env.PAYSTACK_SECRET_KEY || "";
    if (!secretKey) {
      return NextResponse.json({ error: "Paystack is not configured. Please add your secret key in admin settings." }, { status: 500 });
    }

    const paystackCurrency = currency || "GHS";

    // Create order in DB as "pending"
    const order = await db.order.create({
      data: {
        reference,
        email,
        fullName,
        phone,
        address: address || "",
        city: city || "",
        state: state || "",
        country: country || "Ghana",
        items: JSON.stringify(items),
        subtotal,
        shippingFee: shippingFee || 0,
        totalAmount,
        currency: paystackCurrency,
        status: "pending",
        paymentMethod: "paystack",
      },
    });

    // Initialize Paystack transaction
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(totalAmount * 100), // Paystack expects kobo/cents
        currency: paystackCurrency,
        reference,
        metadata: {
          order_id: order.id,
          reference,
          fullName,
          phone,
          items: items.map((i: Record<string, unknown>) => ({
            name: i.name,
            length: i.length || null,
            color: i.color || null,
            price: i.price,
            quantity: i.quantity,
          })),
        },
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || ""}/checkout/success?reference=${reference}`,
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      // Clean up the pending order
      await db.order.delete({ where: { id: order.id } });
      return NextResponse.json({ error: paystackData.message || "Paystack initialization failed" }, { status: 500 });
    }

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
      access_code: paystackData.data.access_code,
    });
  } catch (error) {
    console.error("POST /api/checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
