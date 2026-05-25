import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"
import * as schema from "./schema"

const { Product, ProductVariant, Review, Settings, ContactMessage } = schema

const dbUrl = process.env["DATABASE_URL"]?.trim() || "file:./prisma/dev.db"
const authToken = process.env["TURSO_AUTH_TOKEN"]?.trim()

const client = createClient({
  url: dbUrl,
  authToken: authToken && authToken !== "undefined" && authToken !== "null" ? authToken : undefined,
})

const db = drizzle(client, { schema })

const IMAGES = {
  curly: [
    "https://images.unsplash.com/photo-1634663384991-4e15bb74dfe3?w=800&q=80",
    "https://images.unsplash.com/photo-1605980776566-1646c60e7501?w=800&q=80",
    "https://images.unsplash.com/photo-1626015394667-7f5db5e6155f?w=800&q=80",
  ],
  straight: [
    "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&q=80",
    "https://images.unsplash.com/photo-1577774858111-6f0a8b6b8311?w=800&q=80",
  ],
  wavy: [
    "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&q=80",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
  ],
  frontal: [
    "https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&q=80",
    "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=800&q=80",
  ],
  closure: [
    "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&q=80",
    "https://images.unsplash.com/photo-1562004760-aceed7bb0fe3?w=800&q=80",
  ],
  wig: [
    "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800&q=80",
    "https://images.unsplash.com/photo-1605980625605-380f5add3817?w=800&q=80",
    "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&q=80",
  ],
}

async function seed() {
  console.log("🌱 Seeding database...\n")

  // Clean
  await db.delete(ProductVariant).run()
  await db.delete(Review).run()
  await db.delete(Product).run()
  await db.delete(ContactMessage).run()
  await db.delete(Settings).run()
  console.log("  🗑️  Cleared existing data\n")

  const now = new Date().toISOString()

  // ───────────────────────────────────────────────
  // PRODUCT 1 — Raw Indian Curly Bundle
  // ───────────────────────────────────────────────
  const curlyId = "prod-curly"
  await db.insert(Product).values({
    id: curlyId,
    name: "Raw Indian Curly Bundle",
    description: "Premium raw Indian curly hair bundles with tight, bouncy curls. Double-drawn and tangle-free. Each bundle is 3.5oz of pure luxury.",
    price: 85,
    originalPrice: 120,
    image: IMAGES.curly[0],
    images: JSON.stringify(IMAGES.curly),
    category: "Bundles",
    badge: "Best Seller",
    rating: 4.9,
    reviewCount: 234,
    stock: 180,
    lengths: JSON.stringify(['12"','14"','16"','18"','20"','22"','24"','26"','28"','30"']),
    colors: JSON.stringify(["#1B","#1","#2","#4"]),
    featured: true,
    active: true,
    createdAt: now,
    updatedAt: now,
  } as any).run()

  const curlyPrices: Record<string, number> = { '12"':85, '14"':95, '16"':110, '18"':125, '20"':145, '22"':165, '24"':185, '26"':210, '28"':240, '30"':270 }
  const curlyOPs: Record<string, number> = { '12"':120, '14"':130, '16"':145, '18"':160, '20"':180, '22"':200, '24"':220, '26"':250, '28"':280, '30"':310 }
  let variantCount = 0
  for (const [len, baseP] of Object.entries(curlyPrices)) {
    for (const col of ["#1B","#1","#2","#4"]) {
      const surcharge = col === "#4" ? 10 : col === "#2" ? 5 : 0
      await db.insert(ProductVariant).values({
        productId: curlyId,
        length: len, color: col,
        price: baseP + surcharge,
        originalPrice: curlyOPs[len] + surcharge,
        stock: Math.max(2, 25 - (parseInt(len) - 12) * 2),
        sku: `RC-${len.replace('"',"")}-${col.replace("#","")}`,
        active: true,
        createdAt: now,
        updatedAt: now,
      } as any).run()
      variantCount++
    }
  }
  console.log(`  ✅ Raw Indian Curly Bundle — ${variantCount} variants`)

  // ───────────────────────────────────────────────
  // PRODUCT 2 — Raw Indian Straight Bundle
  // ───────────────────────────────────────────────
  const straightId = "prod-straight"
  await db.insert(Product).values({
    id: straightId,
    name: "Raw Indian Straight Bundle",
    description: "Silky smooth raw Indian straight hair bundles. Bone-straight texture that blends seamlessly. Minimal shedding, cuticle-aligned, and long-lasting.",
    price: 80,
    originalPrice: 115,
    image: IMAGES.straight[0],
    images: JSON.stringify(IMAGES.straight),
    category: "Bundles",
    badge: "New",
    rating: 4.8,
    reviewCount: 187,
    stock: 150,
    lengths: JSON.stringify(['12"','14"','16"','18"','20"','22"','24"','26"']),
    colors: JSON.stringify(["#1B","#1","#2"]),
    featured: false,
    active: true,
    createdAt: now,
    updatedAt: now,
  } as any).run()

  const straightPrices: Record<string, number> = { '12"':80, '14"':90, '16"':105, '18"':120, '20"':140, '22"':158, '24"':178, '26"':200 }
  const straightOPs: Record<string, number> = { '12"':115, '14"':125, '16"':140, '18"':155, '20"':175, '22"':193, '24"':215, '26"':240 }
  variantCount = 0
  for (const [len, baseP] of Object.entries(straightPrices)) {
    for (const col of ["#1B","#1","#2"]) {
      const surcharge = col === "#2" ? 5 : 0
      await db.insert(ProductVariant).values({
        productId: straightId,
        length: len, color: col,
        price: baseP + surcharge,
        originalPrice: straightOPs[len] + surcharge,
        stock: Math.max(3, 20 - (parseInt(len) - 12) * 2),
        sku: `RS-${len.replace('"',"")}-${col.replace("#","")}`,
        active: true,
        createdAt: now,
        updatedAt: now,
      } as any).run()
      variantCount++
    }
  }
  console.log(`  ✅ Raw Indian Straight Bundle — ${variantCount} variants`)

  // ───────────────────────────────────────────────
  // PRODUCT 3 — Raw Indian Wavy Bundle
  // ───────────────────────────────────────────────
  const wavyId = "prod-wavy"
  await db.insert(Product).values({
    id: wavyId,
    name: "Raw Indian Wavy Bundle",
    description: "Gorgeous raw Indian wavy hair bundles. Natural beach waves with incredible body and bounce. Can be worn wavy or straightened easily.",
    price: 90,
    originalPrice: 125,
    image: IMAGES.wavy[0],
    images: JSON.stringify(IMAGES.wavy),
    category: "Bundles",
    badge: "Popular",
    rating: 4.9,
    reviewCount: 298,
    stock: 200,
    lengths: JSON.stringify(['12"','14"','16"','18"','20"','22"','24"','26"','28"']),
    colors: JSON.stringify(["#1B","#1","#2","#4"]),
    featured: true,
    active: true,
    createdAt: now,
    updatedAt: now,
  } as any).run()

  const wavyPrices: Record<string, number> = { '12"':90, '14"':100, '16"':115, '18"':130, '20"':150, '22"':170, '24"':190, '26"':215, '28"':245 }
  const wavyOPs: Record<string, number> = { '12"':125, '14"':135, '16"':150, '18"':168, '20"':188, '22"':208, '24"':230, '26"':255, '28"':285 }
  variantCount = 0
  for (const [len, baseP] of Object.entries(wavyPrices)) {
    for (const col of ["#1B","#1","#2","#4"]) {
      const surcharge = col === "#4" ? 10 : col === "#2" ? 5 : 0
      await db.insert(ProductVariant).values({
        productId: wavyId,
        length: len, color: col,
        price: baseP + surcharge,
        originalPrice: wavyOPs[len] + surcharge,
        stock: Math.max(3, 22 - (parseInt(len) - 12) * 2),
        sku: `RW-${len.replace('"',"")}-${col.replace("#","")}`,
        active: true,
        createdAt: now,
        updatedAt: now,
      } as any).run()
      variantCount++
    }
  }
  console.log(`  ✅ Raw Indian Wavy Bundle — ${variantCount} variants`)

  // ───────────────────────────────────────────────
  // PRODUCT 4 — 13x5 HD Lace Frontal
  // ───────────────────────────────────────────────
  const frontalId = "prod-frontal"
  await db.insert(Product).values({
    id: frontalId,
    name: "13x5 HD Lace Frontal",
    description: "Premium 13x5 HD lace frontal with pre-plucked natural hairline. Undetectable lace that melts perfectly. Bleached knots included.",
    price: 165,
    originalPrice: 225,
    image: IMAGES.frontal[0],
    images: JSON.stringify(IMAGES.frontal),
    category: "Frontals",
    badge: "Premium",
    rating: 4.7,
    reviewCount: 156,
    stock: 80,
    lengths: JSON.stringify(['12"','14"','16"','18"','20"']),
    colors: JSON.stringify(["#1B","#1","#2","#4","#27","#30"]),
    featured: true,
    active: true,
    createdAt: now,
    updatedAt: now,
  } as any).run()

  const frontalPrices: Record<string, number> = { '12"':165, '14"':180, '16"':200, '18"':225, '20"':250 }
  const frontalOPs: Record<string, number> = { '12"':225, '14"':240, '16"':260, '18"':285, '20"':310 }
  variantCount = 0
  for (const [len, baseP] of Object.entries(frontalPrices)) {
    for (const [col, surcharge] of Object.entries({ "#1B":0, "#1":0, "#2":5, "#4":10, "#27":15, "#30":20 })) {
      await db.insert(ProductVariant).values({
        productId: frontalId,
        length: len, color: col,
        price: baseP + surcharge,
        originalPrice: frontalOPs[len] + surcharge,
        stock: Math.max(2, 10 - (parseInt(len) - 12)),
        sku: `FL-${len.replace('"',"")}-${col.replace("#","")}`,
        active: true,
        createdAt: now,
        updatedAt: now,
      } as any).run()
      variantCount++
    }
  }
  console.log(`  ✅ 13x5 HD Lace Frontal — ${variantCount} variants`)

  // ───────────────────────────────────────────────
  // PRODUCT 5 — 5x5 HD Lace Closure
  // ───────────────────────────────────────────────
  const closureId = "prod-closure"
  await db.insert(Product).values({
    id: closureId,
    name: "5x5 HD Lace Closure",
    description: "5x5 HD lace closure with pre-plucked natural hairline. Perfect for middle or side part. Seamless and undetectable. Bleached knots ready.",
    price: 110,
    originalPrice: 170,
    image: IMAGES.closure[0],
    images: JSON.stringify(IMAGES.closure),
    category: "Closures",
    badge: "Top Rated",
    rating: 4.8,
    reviewCount: 203,
    stock: 60,
    lengths: JSON.stringify(['12"','14"','16"','18"']),
    colors: JSON.stringify(["#1B","#1","#2","#4"]),
    featured: false,
    active: true,
    createdAt: now,
    updatedAt: now,
  } as any).run()

  const closurePrices: Record<string, number> = { '12"':110, '14"':125, '16"':140, '18"':160 }
  const closureOPs: Record<string, number> = { '12"':170, '14"':185, '16"':200, '18"':220 }
  variantCount = 0
  for (const [len, baseP] of Object.entries(closurePrices)) {
    for (const col of ["#1B","#1","#2","#4"]) {
      const surcharge = col === "#4" ? 10 : col === "#2" ? 5 : 0
      await db.insert(ProductVariant).values({
        productId: closureId,
        length: len, color: col,
        price: baseP + surcharge,
        originalPrice: closureOPs[len] + surcharge,
        stock: Math.max(3, 12 - (parseInt(len) - 12) * 2),
        sku: `CL-${len.replace('"',"")}-${col.replace("#","")}`,
        active: true,
        createdAt: now,
        updatedAt: now,
      } as any).run()
      variantCount++
    }
  }
  console.log(`  ✅ 5x5 HD Lace Closure — ${variantCount} variants`)

  // ───────────────────────────────────────────────
  // PRODUCT 6 — Full Lace Luxury Wig
  // ───────────────────────────────────────────────
  const wigId = "prod-wig"
  await db.insert(Product).values({
    id: wigId,
    name: "Full Lace Luxury Wig",
    description: "Custom full lace luxury wig with 180% density. Pre-plucked hairline with baby hair. Glueless install ready with adjustable straps and combs.",
    price: 320,
    originalPrice: 420,
    image: IMAGES.wig[0],
    images: JSON.stringify(IMAGES.wig),
    category: "Wigs",
    badge: "Luxury",
    rating: 5.0,
    reviewCount: 89,
    stock: 40,
    lengths: JSON.stringify(['16"','18"','20"','22"','24"']),
    colors: JSON.stringify(["#1B","#1","#2","#4","#27","#30","#99J"]),
    featured: true,
    active: true,
    createdAt: now,
    updatedAt: now,
  } as any).run()

  const wigPrices: Record<string, number> = { '16"':320, '18"':365, '20"':410, '22"':460, '24"':520 }
  const wigOPs: Record<string, number> = { '16"':420, '18"':465, '20"':510, '22"':560, '24"':620 }
  variantCount = 0
  for (const [len, baseP] of Object.entries(wigPrices)) {
    for (const [col, surcharge] of Object.entries({ "#1B":0, "#1":0, "#2":10, "#4":15, "#27":25, "#30":30, "#99J":45 })) {
      await db.insert(ProductVariant).values({
        productId: wigId,
        length: len, color: col,
        price: baseP + surcharge,
        originalPrice: wigOPs[len] + surcharge,
        stock: Math.max(1, 6 - (parseInt(len) - 16)),
        sku: `FLW-${len.replace('"',"")}-${col.replace("#","")}`,
        active: true,
        createdAt: now,
        updatedAt: now,
      } as any).run()
      variantCount++
    }
  }
  console.log(`  ✅ Full Lace Luxury Wig — ${variantCount} variants`)

  // ───────────────────────────────────────────────
  // REVIEWS
  // ───────────────────────────────────────────────
  const reviews = [
    { author: "Jasmine M.", rating: 5, title: "Absolutely Amazing!", text: "The quality is unmatched. I've been wearing hair for 10 years and this is the best. Curls hold beautifully.", productId: curlyId },
    { author: "Aaliyah R.", rating: 5, title: "Obsessed!", text: "The HD lace melts perfectly into my skin. Installation was seamless and lasts for months.", productId: frontalId },
    { author: "Destiny K.", rating: 5, title: "Best wig ever", text: "Customer service was amazing and shipping was super fast. I get compliments everywhere I go.", productId: wigId },
    { author: "Taylor S.", rating: 5, title: "Worth every penny", text: "Best hair investment. The straight bundles are silky smooth, tangle-free, and the color match was perfect.", productId: straightId },
    { author: "Keisha B.", rating: 4, title: "Great curls", text: "Love the curly bundles! They hold their shape beautifully after washing.", productId: curlyId },
    { author: "Mia J.", rating: 5, title: "Will buy again", text: "The wavy texture is everything! Natural looking and so easy to style.", productId: wavyId },
    { author: "Brianna L.", rating: 5, title: "Perfect closure", text: "This closure blends flawlessly. The #1B matches my leave-out perfectly!", productId: closureId },
    { author: "Taylor S.", rating: 4, title: "Good quality frontal", text: "Great quality frontal. #2 matched my hair perfectly.", productId: frontalId },
  ]

  for (const r of reviews) {
    await db.insert(Review).values({
      author: r.author,
      email: `${r.author.toLowerCase().replace(/ /g, ".")}@email.com`,
      rating: r.rating,
      title: r.title,
      text: r.text,
      productId: r.productId,
      verified: true,
      approved: true,
      createdAt: now,
    } as any).run()
  }
  console.log(`  ✅ ${reviews.length} reviews seeded`)

  // ───────────────────────────────────────────────
  // SETTINGS
  // ───────────────────────────────────────────────
  const settings = [
    { key: "whatsapp_number", value: "1234567890" },
    { key: "email", value: "hello@lacellehair.com" },
    { key: "phone", value: "+1 (800) LACELLE-HR" },
    { key: "promo_code", value: "LUXE20" },
    { key: "instagram", value: "https://instagram.com/lacellehair" },
    { key: "facebook", value: "https://facebook.com/lacellehair" },
    { key: "tiktok", value: "https://tiktok.com/@lacellehair" },
  ]
  for (const s of settings) {
    await db.insert(Settings).values({ key: s.key, value: s.value, updatedAt: now } as any).run()
  }
  console.log(`  ✅ ${settings.length} settings seeded`)

  console.log("\n🎉 Seed complete!")
  process.exit(0)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
