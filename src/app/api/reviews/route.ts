import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const where: Record<string, unknown> = { approved: true };

    if (productId) {
      where.productId = productId;
    }

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { product: { select: { name: true } } },
      }),
      db.review.count({ where }),
    ]);

    return NextResponse.json({ reviews, total, page, limit });
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.productId || !body.author || !body.rating || !body.text) {
      return NextResponse.json(
        { error: "Product ID, author, rating, and text are required" },
        { status: 400 }
      );
    }

    const review = await db.review.create({
      data: {
        productId: body.productId,
        author: body.author,
        email: body.email || "",
        rating: Number(body.rating),
        title: body.title || "",
        text: body.text,
        verified: Boolean(body.verified),
      },
    });

    // Update product rating average
    const allReviews = await db.review.findMany({
      where: { productId: body.productId, approved: true },
    });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await db.product.update({
      where: { id: body.productId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, approved } = body;

    if (!id) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    const review = await db.review.update({
      where: { id },
      data: { approved },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("PUT /api/reviews error:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    const review = await db.review.delete({ where: { id } });

    // Recalculate product rating
    if (review.productId) {
      const remaining = await db.review.findMany({
        where: { productId: review.productId, approved: true },
      });
      const avg = remaining.length > 0
        ? remaining.reduce((s, r) => s + r.rating, 0) / remaining.length
        : 0;
      await db.product.update({
        where: { id: review.productId },
        data: { rating: Math.round(avg * 10) / 10, reviewCount: remaining.length },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/reviews error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
