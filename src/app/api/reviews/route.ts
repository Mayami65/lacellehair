import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateToken } from "@/lib/adminAuth";

async function recalcProductRating(productId: string) {
  const approved = await db.review.findMany({
    where: { productId, approved: true },
  });
  const avg =
    approved.length > 0
      ? approved.reduce((s, r) => s + r.rating, 0) / approved.length
      : 0;
  await db.product.update({
    where: { id: productId },
    data: {
      rating: Math.round(avg * 10) / 10,
      reviewCount: approved.length,
    },
  });
}

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

    // Require a paid order matching the reviewer's email and product
    if (body.email) {
      const orders = await db.order.findMany({
        where: {
          email: body.email.toLowerCase().trim(),
          status: { in: ["paid", "shipped", "delivered"] },
        },
        select: { items: true },
      });

      const hasPurchased = orders.some((o) => {
        try {
          const items = JSON.parse(o.items);
          return items.some(
            (item: any) => item.productId === body.productId
          );
        } catch {
          return false;
        }
      });

      if (!hasPurchased) {
        return NextResponse.json(
          { error: "You can only review products you have purchased." },
          { status: 403 }
        );
      }
    }

    const review = await db.review.create({
      data: {
        productId: body.productId,
        author: body.author,
        email: body.email || "",
        rating: Number(body.rating),
        title: body.title || "",
        text: body.text,
      },
      // approved defaults to false — admin must approve before public visibility
    });

    return NextResponse.json(
      { message: "Review submitted for approval.", review },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || "";
    const m = cookie.match(/lacelle_admin_token=([^;]+)/);
    const token = m ? m[1] : undefined;
    if (!validateToken(token)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, approved } = body;

    if (!id) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    const review = await db.review.update({
      where: { id },
      data: { approved },
    });

    // Recalculate product rating when approval status changes
    await recalcProductRating(review.productId);

    return NextResponse.json(review);
  } catch (error) {
    console.error("PUT /api/reviews error:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
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
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    const review = await db.review.delete({ where: { id } });

    if (review.productId) {
      await recalcProductRating(review.productId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/reviews error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
