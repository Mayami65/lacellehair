import { NextRequest, NextResponse } from "next/server"
import { db, schema } from "@/lib/db"
import { validateToken } from "@/lib/adminAuth"
import { eq } from "drizzle-orm"

const { Product } = schema

function getToken(req: NextRequest) {
  const cookie = req.headers.get("cookie") || ""
  const m = cookie.match(/lacelle_admin_token=([^;]+)/)
  return m ? m[1] : undefined
}

export async function POST(request: NextRequest) {
  try {
    const token = getToken(request)
    if (!validateToken(token)) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const body = await request.json()
    const { productId, url, public_id } = body
    if (!productId || !url) return NextResponse.json({ error: "productId and url required" }, { status: 400 })

    const [product] = await db.select({ images: Product.images }).from(Product).where(eq(Product.id, productId))
    if (!product) return NextResponse.json({ error: "product not found" }, { status: 404 })

    let images: any[] = []
    try { images = JSON.parse(product.images || "[]") } catch { images = [] }
    images.push({ url, public_id: public_id || null, uploadedAt: new Date().toISOString() })

    const [updated] = await db.update(Product)
      .set({ images: JSON.stringify(images), updatedAt: new Date().toISOString() })
      .where(eq(Product.id, productId))
      .returning()

    return NextResponse.json({ success: true, product: updated })
  } catch (err) {
    console.error("POST /api/products/images error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = getToken(request)
    if (!validateToken(token)) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const public_id = searchParams.get("public_id")
    if (!productId || !public_id) return NextResponse.json({ error: "productId and public_id required" }, { status: 400 })

    const [product] = await db.select({ images: Product.images }).from(Product).where(eq(Product.id, productId))
    if (!product) return NextResponse.json({ error: "product not found" }, { status: 404 })

    let images: any[] = []
    try { images = JSON.parse(product.images || "[]") } catch { images = [] }
    images = images.filter((i: any) => i.public_id !== public_id)

    const [updated] = await db.update(Product)
      .set({ images: JSON.stringify(images), updatedAt: new Date().toISOString() })
      .where(eq(Product.id, productId))
      .returning()

    return NextResponse.json({ success: true, product: updated })
  } catch (err) {
    console.error("DELETE /api/products/images error:", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
