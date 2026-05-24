import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || "";
    const m = cookie.match(/lacelle_admin_token=([^;]+)/);
    const token = m ? m[1] : undefined;
    if (!validateToken(token)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await request.json();
    const { productId, url, public_id } = body;
    if (!productId || !url) return NextResponse.json({ error: "productId and url required" }, { status: 400 });

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "product not found" }, { status: 404 });

    let images: Array<any> = [];
    try { images = JSON.parse(product.images || "[]"); } catch { images = []; }
    images.push({ url, public_id: public_id || null, uploadedAt: new Date().toISOString() });

    const updated = await db.product.update({ where: { id: productId }, data: { images: JSON.stringify(images) } });
    return NextResponse.json({ success: true, product: updated });
  } catch (err) {
    console.error("POST /api/products/images error:", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || "";
    const m = cookie.match(/lacelle_admin_token=([^;]+)/);
    const token = m ? m[1] : undefined;
    if (!validateToken(token)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const public_id = searchParams.get("public_id");
    if (!productId || !public_id) return NextResponse.json({ error: "productId and public_id required" }, { status: 400 });

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "product not found" }, { status: 404 });

    let images: Array<any> = [];
    try { images = JSON.parse(product.images || "[]"); } catch { images = []; }
    images = images.filter((i) => i.public_id !== public_id);

    const updated = await db.product.update({ where: { id: productId }, data: { images: JSON.stringify(images) } });
    return NextResponse.json({ success: true, product: updated });
  } catch (err) {
    console.error("DELETE /api/products/images error:", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
