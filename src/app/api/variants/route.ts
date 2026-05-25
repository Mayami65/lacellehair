import { NextRequest, NextResponse } from "next/server"
import { db, schema } from "@/lib/db"
import { validateToken } from "@/lib/adminAuth"
import { eq } from "drizzle-orm"

const { ProductVariant } = schema

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 })
    }

    const variants = await db.select().from(ProductVariant)
      .where(eq(ProductVariant.productId, productId))

    return NextResponse.json(variants)
  } catch (error) {
    console.error("GET /api/variants error:", error)
    return NextResponse.json({ error: "Failed to fetch variants" }, { status: 500 })
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

    const [variant] = await db.insert(ProductVariant).values({
      productId: body.productId,
      length: body.length || "",
      color: body.color || "",
      price: Number(body.price) || 0,
      originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
      stock: Number(body.stock) || 50,
      sku: body.sku || "",
      active: body.active !== false,
      createdAt: now,
      updatedAt: now,
    } as any).returning()

    return NextResponse.json(variant, { status: 201 })
  } catch (error) {
    console.error("POST /api/variants error:", error)
    return NextResponse.json({ error: "Failed to create variant" }, { status: 500 })
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
    if (!id) return NextResponse.json({ error: "Variant ID is required" }, { status: 400 })

    const set: any = { updatedAt: new Date().toISOString() }
    if (data.length !== undefined) set.length = data.length
    if (data.color !== undefined) set.color = data.color
    if (data.price !== undefined) set.price = Number(data.price)
    if (data.originalPrice !== undefined) set.originalPrice = data.originalPrice ? Number(data.originalPrice) : null
    if (data.stock !== undefined) set.stock = Number(data.stock)
    if (data.sku !== undefined) set.sku = data.sku
    if (data.active !== undefined) set.active = Boolean(data.active)

    const [variant] = await db.update(ProductVariant).set(set).where(eq(ProductVariant.id, id)).returning()
    return NextResponse.json(variant)
  } catch (error) {
    console.error("PUT /api/variants error:", error)
    return NextResponse.json({ error: "Failed to update variant" }, { status: 500 })
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
    if (!id) return NextResponse.json({ error: "Variant ID is required" }, { status: 400 })

    await db.delete(ProductVariant).where(eq(ProductVariant.id, id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/variants error:", error)
    return NextResponse.json({ error: "Failed to delete variant" }, { status: 500 })
  }
}
