import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference")?.trim();
    const email = searchParams.get("email")?.trim().toLowerCase();

    if (!reference || !email) {
      return NextResponse.json({ error: "reference and email are required" }, { status: 400 });
    }

    const order = await db.order.findFirst({
      where: {
        reference,
        email: { equals: email, mode: "insensitive" },
      },
      select: {
        reference: true,
        status: true,
        trackingNumber: true,
        paidAt: true,
        createdAt: true,
        updatedAt: true,
        fullName: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("GET /api/orders/public error:", error);
    return NextResponse.json({ error: "Failed to look up order" }, { status: 500 });
  }
}