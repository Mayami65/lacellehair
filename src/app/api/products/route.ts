import { NextRequest, NextResponse } from "next/server"
import { db, schema } from "@/lib/db"
import { validateToken } from "@/lib/adminAuth"
import { eq, and, desc, asc } from "drizzle-orm"

const { Product, ProductVariant } = schema

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")

    const conditions = [eq(Product.active, true)]

    if (category && category !== "All") {
      conditions.push(eq(Product.category, category))
    }
    if (featured === "true") {
      conditions.push(eq(Product.featured, true))
    }

    const products = await db.query.Product.findMany({
      where: and(...conditions),
      orderBy: desc(Product.createdAt),
      with: {
        variants: {
          where: and(eq(ProductVariant.active, true)),
          orderBy: [asc(ProductVariant.price)],
        },
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("GET /api/products error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || ""
    const m = cookie.match(/lacelle_admin_token=([^;]+)/)
    const token = m ? m[1] : undefined
    if (!validateToken(token)) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const body = await request.json()
    const now = new Date().toISOString()

    const [product] = await db.insert(Product).values({
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
      active: body.active !== false,
      createdAt: now,
      updatedAt: now,
    } as any).returning()

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("POST /api/products error:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || ""
    const m = cookie.match(/lacelle_admin_token=([^;]+)/)
    const token = m ? m[1] : undefined
    if (!validateToken(token)) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const set: Record<string, unknown> = { updatedAt: new Date().toISOString() }
    if (data.name !== undefined) set.name = data.name
    if (data.description !== undefined) set.description = data.description
    if (data.price !== undefined) set.price = Number(data.price)
    if (data.originalPrice !== undefined) set.originalPrice = data.originalPrice ? Number(data.originalPrice) : null
    if (data.image !== undefined) set.image = data.image
    if (data.images !== undefined) set.images = JSON.stringify(data.images)
    if (data.category !== undefined) set.category = data.category
    if (data.badge !== undefined) set.badge = data.badge
    if (data.rating !== undefined) set.rating = Number(data.rating)
    if (data.reviewCount !== undefined) set.reviewCount = Number(data.reviewCount)
    if (data.stock !== undefined) set.stock = Number(data.stock)
    if (data.lowStockThreshold !== undefined) set.lowStockThreshold = Number(data.lowStockThreshold)
    if (data.lengths !== undefined) set.lengths = JSON.stringify(data.lengths)
    if (data.colors !== undefined) set.colors = JSON.stringify(data.colors)
    if (data.featured !== undefined) set.featured = Boolean(data.featured)
    if (data.active !== undefined) set.active = Boolean(data.active)

    const [product] = await db.update(Product).set(set as any).where(eq(Product.id, id)).returning()

    return NextResponse.json(product)
  } catch (error) {
    console.error("PUT /api/products error:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
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

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    await db.delete(Product).where(eq(Product.id, id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/products error:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
