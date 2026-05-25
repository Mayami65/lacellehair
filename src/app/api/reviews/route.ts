import { NextRequest, NextResponse } from "next/server"
import { db, schema } from "@/lib/db"
import { validateToken } from "@/lib/adminAuth"
import { eq, and, desc, sql } from "drizzle-orm"

const { Review, Product, Order: OrderTable } = schema

async function recalcProductRating(productId: string) {
  const approved = await db.select().from(Review).where(and(eq(Review.productId, productId), eq(Review.approved, true)))
  const avg = approved.length > 0 ? approved.reduce((s, r) => s + r.rating, 0) / approved.length : 0
  await db.update(Product)
    .set({ rating: Math.round(avg * 10) / 10, reviewCount: approved.length, updatedAt: new Date().toISOString() })
    .where(eq(Product.id, productId))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const page = Number(searchParams.get("page") || 1)
    const limit = Number(searchParams.get("limit") || 20)

    const conditions = [eq(Review.approved, true)]
    if (productId) conditions.push(eq(Review.productId, productId))
    const where = and(...conditions)

    const [reviews, [{ count: total }]] = await Promise.all([
      db.query.Review.findMany({
        where,
        orderBy: desc(Review.createdAt),
        offset: (page - 1) * limit,
        limit,
        with: { product: { columns: { name: true } } },
      }),
      db.select({ count: sql<number>`count(*)` }).from(Review).where(where),
    ])

    return NextResponse.json({ reviews, total: Number(total), page, limit })
  } catch (error) {
    console.error("GET /api/reviews error:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.productId || !body.author || !body.rating || !body.text) {
      return NextResponse.json({ error: "Product ID, author, rating, and text are required" }, { status: 400 })
    }

    if (body.email) {
      const email = body.email.toLowerCase().trim()
      const orders = await db.select({ items: OrderTable.items })
        .from(OrderTable)
        .where(eq(OrderTable.email, email))

      const hasPurchased = orders.some((o) => {
        try {
          const items = JSON.parse(o.items)
          return items.some((item: any) => item.productId === body.productId)
        } catch { return false }
      })

      if (!hasPurchased) {
        return NextResponse.json({ error: "You can only review products you have purchased." }, { status: 403 })
      }
    }

    const now = new Date().toISOString()
    const [review] = await db.insert(Review).values({
      productId: body.productId,
      author: body.author,
      email: body.email || "",
      rating: Number(body.rating),
      title: body.title || "",
      text: body.text,
      createdAt: now,
    } as any).returning()

    return NextResponse.json({ message: "Review submitted for approval.", review }, { status: 201 })
  } catch (error) {
    console.error("POST /api/reviews error:", error)
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || ""
    const m = cookie.match(/lacelle_admin_token=([^;]+)/)
    const token = m ? m[1] : undefined
    if (!validateToken(token)) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const body = await request.json()
    const { id, approved } = body
    if (!id) return NextResponse.json({ error: "Review ID is required" }, { status: 400 })

    const [review] = await db.update(Review).set({ approved } as any).where(eq(Review.id, id)).returning()
    await recalcProductRating(review.productId)

    return NextResponse.json(review)
  } catch (error) {
    console.error("PUT /api/reviews error:", error)
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || ""
    const m = cookie.match(/lacelle_admin_token=([^;]+)/)
    const token = m ? m[1] : undefined
    if (!validateToken(token)) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Review ID is required" }, { status: 400 })

    const [review] = await db.select({ productId: Review.productId }).from(Review).where(eq(Review.id, id))
    await db.delete(Review).where(eq(Review.id, id))

    if (review?.productId) await recalcProductRating(review.productId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/reviews error:", error)
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }
}
