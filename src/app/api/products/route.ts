import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const where: Record<string, unknown> = { active: true };

    if (category && category !== "All") {
      where.category = category;
    }
    if (featured === "true") {
      where.featured = true;
    }

    const products = await db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const product = await db.product.create({
      data: {
        name: body.name || "",
        description: body.description || "",
        price: Number(body.price) || 0,
        originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
        image: body.image || "",
        images: JSON.stringify(body.images || []),
        category: body.category || "Bundles",
        badge: body.badge || "",
        rating: Number(body.rating) || 0,
        reviewCount: Number(body.reviewCount) || 0,
        stock: Number(body.stock) || 50,
        lowStockThreshold: Number(body.lowStockThreshold) || 5,
        lengths: JSON.stringify(body.lengths || []),
        colors: JSON.stringify(body.colors || []),
        featured: Boolean(body.featured),
        active: Boolean(body.active !== false),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = Number(data.price);
    if (data.originalPrice !== undefined) updateData.originalPrice = data.originalPrice ? Number(data.originalPrice) : null;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.images !== undefined) updateData.images = JSON.stringify(data.images);
    if (data.category !== undefined) updateData.category = data.category;
    if (data.badge !== undefined) updateData.badge = data.badge;
    if (data.rating !== undefined) updateData.rating = Number(data.rating);
    if (data.reviewCount !== undefined) updateData.reviewCount = Number(data.reviewCount);
    if (data.stock !== undefined) updateData.stock = Number(data.stock);
    if (data.lowStockThreshold !== undefined) updateData.lowStockThreshold = Number(data.lowStockThreshold);
    if (data.lengths !== undefined) updateData.lengths = JSON.stringify(data.lengths);
    if (data.colors !== undefined) updateData.colors = JSON.stringify(data.colors);
    if (data.featured !== undefined) updateData.featured = Boolean(data.featured);
    if (data.active !== undefined) updateData.active = Boolean(data.active);

    const product = await db.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("PUT /api/products error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/products error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
