import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding database...");

  // Seed products
  const products = [
    {
      name: "Raw Indian Curly Bundle",
      description: "Premium quality raw Indian curly hair bundles. Tight bouncy curls that hold beautifully. Double-drawn, cuticle-aligned, and tangle-free.",
      price: 100,
      originalPrice: 140,
      image: "/images/product-curly.jpg",
      images: JSON.stringify(["/images/product-curly.jpg"]),
      category: "Bundles",
      badge: "Best Seller",
      rating: 4.9,
      reviewCount: 234,
      stock: 50,
      lowStockThreshold: 5,
      lengths: JSON.stringify(['12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"', '28"', '30"']),
      colors: JSON.stringify(["#1B", "#1", "#2", "#4"]),
      featured: true,
      active: true,
    },
    {
      name: "Raw Indian Straight Bundle",
      description: "Silky smooth raw Indian straight hair bundles. Bone-straight texture that blends seamlessly. Minimal shedding and long-lasting.",
      price: 95,
      originalPrice: 135,
      image: "/images/product-straight.jpg",
      images: JSON.stringify(["/images/product-straight.jpg"]),
      category: "Bundles",
      badge: "New",
      rating: 4.8,
      reviewCount: 187,
      stock: 35,
      lowStockThreshold: 5,
      lengths: JSON.stringify(['12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"']),
      colors: JSON.stringify(["#1B", "#1", "#2"]),
      featured: false,
      active: true,
    },
    {
      name: "Raw Indian Wavy Bundle",
      description: "Gorgeous raw Indian wavy hair bundles. Natural beach waves with incredible body and bounce. Versatile styling options.",
      price: 105,
      originalPrice: 145,
      image: "/images/product-wavy.jpg",
      images: JSON.stringify(["/images/product-wavy.jpg"]),
      category: "Bundles",
      badge: "Popular",
      rating: 4.9,
      reviewCount: 298,
      stock: 42,
      lowStockThreshold: 5,
      lengths: JSON.stringify(['12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"', '28"']),
      colors: JSON.stringify(["#1B", "#1", "#2", "#4"]),
      featured: true,
      active: true,
    },
    {
      name: "13x5 HD Lace Frontal",
      description: "Premium 13x5 HD lace frontal with pre-plucked hairline. Undetectable lace that melts perfectly into any skin tone.",
      price: 185,
      originalPrice: 245,
      image: "/images/product-frontal.jpg",
      images: JSON.stringify(["/images/product-frontal.jpg"]),
      category: "Frontals",
      badge: "Premium",
      rating: 4.7,
      reviewCount: 156,
      stock: 20,
      lowStockThreshold: 5,
      lengths: JSON.stringify(['12"', '14"', '16"', '18"', '20"']),
      colors: JSON.stringify(["#1B", "#1", "#2"]),
      featured: true,
      active: true,
    },
    {
      name: "5x5 HD Lace Closure",
      description: "5x5 HD lace closure with pre-plucked natural hairline. Perfect for a middle or side part. Seamless and undetectable.",
      price: 125,
      originalPrice: 185,
      image: "/images/product-closure.jpg",
      images: JSON.stringify(["/images/product-closure.jpg"]),
      category: "Closures",
      badge: "Top Rated",
      rating: 4.8,
      reviewCount: 203,
      stock: 28,
      lowStockThreshold: 5,
      lengths: JSON.stringify(['12"', '14"', '16"', '18"']),
      colors: JSON.stringify(["#1B", "#1", "#2"]),
      featured: false,
      active: true,
    },
    {
      name: "Full Lace Luxury Wig",
      description: "Custom full lace luxury wig with 180% density. Pre-plucked hairline with baby hair. Glueless install ready.",
      price: 350,
      originalPrice: 450,
      image: "/images/product-wig.jpg",
      images: JSON.stringify(["/images/product-wig.jpg"]),
      category: "Wigs",
      badge: "Luxury",
      rating: 5.0,
      reviewCount: 89,
      stock: 3,
      lowStockThreshold: 5,
      lengths: JSON.stringify(['16"', '18"', '20"', '22"', '24"']),
      colors: JSON.stringify(["#1B", "#1", "#2", "#4"]),
      featured: true,
      active: true,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: "seed-" + p.name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: { ...p, id: "seed-" + p.name.toLowerCase().replace(/\s+/g, "-") },
    });
  }

  // Get the product IDs for reviews
  const allProducts = await prisma.product.findMany();
  if (allProducts.length === 0) {
    console.log("No products found, skipping review seed");
    return;
  }

  // Seed reviews
  const reviewData = [
    { author: "Jasmine M.", rating: 5, title: "Absolutely Amazing!", text: "The quality of these extensions is absolutely unmatched! I have been wearing hair for over 10 years and this is by far the best I have ever purchased.", productId: allProducts[0]?.id },
    { author: "Aaliyah R.", rating: 5, title: "Obsessed!", text: "I am obsessed with my frontal! The HD lace melts so perfectly into my skin, it looks like my real hairline.", productId: allProducts[3]?.id },
    { author: "Destiny K.", rating: 5, title: "Best wig ever", text: "Customer service was amazing and the shipping was super fast. The wig I ordered looks exactly like the photos.", productId: allProducts[5]?.id },
    { author: "Taylor S.", rating: 5, title: "Worth every penny", text: "Best hair investment I have ever made. The straight bundles are silky smooth, tangle-free, and the color match was perfect.", productId: allProducts[1]?.id },
    { author: "Keisha B.", rating: 4, title: "Great curls", text: "Love the curly bundles! They hold their shape beautifully after washing. Only giving 4 stars because shipping took a bit longer than expected.", productId: allProducts[0]?.id },
    { author: "Mia J.", rating: 5, title: "Will buy again", text: "The wavy texture is everything! Natural looking and so easy to style. Already planning my next purchase.", productId: allProducts[2]?.id },
  ];

  for (const r of reviewData) {
    if (!r.productId) continue;
    await prisma.review.create({
      data: {
        author: r.author,
        rating: r.rating,
        title: r.title,
        text: r.text,
        productId: r.productId,
        approved: true,
      },
    });
  }

  // Seed settings
  const defaultSettings = [
    { key: "whatsapp_number", value: "1234567890" },
    { key: "email", value: "hello@lacellehair.com" },
    { key: "phone", value: "+1 (800) LACELLE-HR" },
    { key: "promo_code", value: "LUXE20" },
    { key: "instagram", value: "https://instagram.com/lacellehair" },
    { key: "facebook", value: "https://facebook.com/lacellehair" },
    { key: "tiktok", value: "https://tiktok.com/@lacellehair" },
  ];

  for (const s of defaultSettings) {
    await prisma.settings.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  console.log("✅ Seed complete!");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
