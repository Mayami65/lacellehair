import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateToken } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    const where: Record<string, unknown> = {};
    if (productId) {
      where.productId = productId;
    }

    const variants = await db.productVariant.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(variants);
  } catch (error) {
    console.error("GET /api/variants error:", error);
    return NextResponse.json({ error: "Failed to fetch variants" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || "";
    const m = cookie.match(/lacelle_admin_token=([^;]+)/);
    const token = m ? m[1] : undefined;
    if (!validateToken(token)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await request.json();

    if (!body.productId || body.price === undefined) {
      return NextResponse.json({ error: "productId and price are required" }, { status: 400 });
    }

    const variant = await db.productVariant.create({
      data: {
        productId: body.productId,
        length: body.length || "",
        color: body.color || "",
        price: Number(body.price) || 0,
        originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
        stock: Number(body.stock) || 50,
        sku: body.sku || "",
        active: body.active !== false,
      },
    });

    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    console.error("POST /api/variants error:", error);
    return NextResponse.json({ error: "Failed to create variant" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || "";
    const m = cookie.match(/lacelle_admin_token=([^;]+)/);
    const token = m ? m[1] : undefined;
    if (!validateToken(token)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Variant ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.length !== undefined) updateData.length = data.length;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.price !== undefined) updateData.price = Number(data.price);
    if (data.originalPrice !== undefined) updateData.originalPrice = data.originalPrice ? Number(data.originalPrice) : null;
    if (data.stock !== undefined) updateData.stock = Number(data.stock);
    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.active !== undefined) updateData.active = Boolean(data.active);

    const variant = await db.productVariant.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(variant);
  } catch (error) {
    console.error("PUT /api/variants error:", error);
    return NextResponse.json({ error: "Failed to update variant" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || "";
    const m = cookie.match(/lacelle_admin_token=([^;]+)/);
    const token = m ? m[1] : undefined;
    if (!validateToken(token)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Variant ID is required" }, { status: 400 });
    }

    await db.productVariant.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/variants error:", error);
    return NextResponse.json({ error: "Failed to delete variant" }, { status: 500 });
  }
}
