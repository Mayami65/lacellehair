import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding database...");

  // Clean slate — delete in correct order (variants first due to cascade)
  await prisma.productVariant.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.contactMessage.deleteMany({});
  await prisma.settings.deleteMany({});
  console.log("  🗑️  Cleared existing data");

  /* ════════════════════════════════════════════
     PRODUCT 1 — Raw Indian Curly Bundle
     Price increases with length, #4 (medium brown) costs a bit more
     ════════════════════════════════════════════ */
  const curly = await prisma.product.create({
    data: {
      id: "prod-curly",
      name: "Raw Indian Curly Bundle",
      description: "Premium quality raw Indian curly hair bundles. Tight bouncy curls that hold beautifully. Double-drawn, cuticle-aligned, and tangle-free. Each bundle is 3.5oz of pure luxury.",
      price: 85,          // starting price (12" / #1B)
      originalPrice: 120,
      image: "/images/product-curly.jpg",
      images: JSON.stringify(["/images/product-curly.jpg"]),
      category: "Bundles",
      badge: "Best Seller",
      rating: 4.9,
      reviewCount: 234,
      stock: 180,
      lowStockThreshold: 5,
      lengths: JSON.stringify(['12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"', '28"', '30"']),
      colors: JSON.stringify(["#1B", "#1", "#2", "#4"]),
      featured: true,
      active: true,
    },
  });

  const curlyPrices: Record<string, number> = {
    '12"': 85,  '14"': 95,  '16"': 110, '18"': 125, '20"': 145,
    '22"': 165, '24"': 185, '26"': 210, '28"': 240, '30"': 270,
  };
  const curlyOPs: Record<string, number> = {
    '12"': 120, '14"': 130, '16"': 145, '18"': 160, '20"': 180,
    '22"': 200, '24"': 220, '26"': 250, '28"': 280, '30"': 310,
  };
  const colorSurcharge: Record<string, number> = { "#1B": 0, "#1": 0, "#2": 5, "#4": 10 };

  const curlyVariants: { length: string; color: string; price: number; originalPrice: number; stock: number; sku: string }[] = [];
  for (const [len, baseP] of Object.entries(curlyPrices)) {
    for (const [col, surcharge] of Object.entries(colorSurcharge)) {
      curlyVariants.push({
        length: len, color: col,
        price: baseP + surcharge,
        originalPrice: curlyOPs[len] + surcharge,
        stock: Math.max(2, 25 - (parseInt(len) - 12) * 2), // longer = less stock
        sku: `RC-${len.replace('"', "")}-${col.replace("#", "")}`,
      });
    }
  }
  await prisma.productVariant.createMany({
    data: curlyVariants.map(v => ({ productId: curly.id, ...v, active: true })),
  });
  console.log(`  ✅ ${curly.name} — ${curlyVariants.length} variants`);

  /* ════════════════════════════════════════════
     PRODUCT 2 — Raw Indian Straight Bundle
     ════════════════════════════════════════════ */
  const straight = await prisma.product.create({
    data: {
      id: "prod-straight",
      name: "Raw Indian Straight Bundle",
      description: "Silky smooth raw Indian straight hair bundles. Bone-straight texture that blends seamlessly. Minimal shedding, cuticle-aligned, and long-lasting quality.",
      price: 80,
      originalPrice: 115,
      image: "/images/product-straight.jpg",
      images: JSON.stringify(["/images/product-straight.jpg"]),
      category: "Bundles",
      badge: "New",
      rating: 4.8,
      reviewCount: 187,
      stock: 150,
      lowStockThreshold: 5,
      lengths: JSON.stringify(['12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"']),
      colors: JSON.stringify(["#1B", "#1", "#2"]),
      featured: false,
      active: true,
    },
  });

  const straightPrices: Record<string, number> = {
    '12"': 80, '14"': 90, '16"': 105, '18"': 120, '20"': 140,
    '22"': 158, '24"': 178, '26"': 200,
  };
  const straightOPs: Record<string, number> = {
    '12"': 115, '14"': 125, '16"': 140, '18"': 155, '20"': 175,
    '22"': 193, '24"': 215, '26"': 240,
  };
  const straightVariants: { length: string; color: string; price: number; originalPrice: number; stock: number; sku: string }[] = [];
  for (const [len, baseP] of Object.entries(straightPrices)) {
    for (const [col, surcharge] of Object.entries(colorSurcharge)) {
      if (col === "#4") continue; // straight doesn't come in #4
      straightVariants.push({
        length: len, color: col,
        price: baseP + surcharge,
        originalPrice: straightOPs[len] + surcharge,
        stock: Math.max(3, 20 - (parseInt(len) - 12) * 2),
        sku: `RS-${len.replace('"', "")}-${col.replace("#", "")}`,
      });
    }
  }
  await prisma.productVariant.createMany({
    data: straightVariants.map(v => ({ productId: straight.id, ...v, active: true })),
  });
  console.log(`  ✅ ${straight.name} — ${straightVariants.length} variants`);

  /* ════════════════════════════════════════════
     PRODUCT 3 — Raw Indian Wavy Bundle
     ════════════════════════════════════════════ */
  const wavy = await prisma.product.create({
    data: {
      id: "prod-wavy",
      name: "Raw Indian Wavy Bundle",
      description: "Gorgeous raw Indian wavy hair bundles. Natural beach waves with incredible body and bounce. Can be worn wavy or straightened easily. Versatile styling options.",
      price: 90,
      originalPrice: 125,
      image: "/images/product-wavy.jpg",
      images: JSON.stringify(["/images/product-wavy.jpg"]),
      category: "Bundles",
      badge: "Popular",
      rating: 4.9,
      reviewCount: 298,
      stock: 200,
      lowStockThreshold: 5,
      lengths: JSON.stringify(['12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"', '28"']),
      colors: JSON.stringify(["#1B", "#1", "#2", "#4"]),
      featured: true,
      active: true,
    },
  });

  const wavyPrices: Record<string, number> = {
    '12"': 90, '14"': 100, '16"': 115, '18"': 130, '20"': 150,
    '22"': 170, '24"': 190, '26"': 215, '28"': 245,
  };
  const wavyOPs: Record<string, number> = {
    '12"': 125, '14"': 135, '16"': 150, '18"': 168, '20"': 188,
    '22"': 208, '24"': 230, '26"': 255, '28"': 285,
  };
  const wavyVariants: { length: string; color: string; price: number; originalPrice: number; stock: number; sku: string }[] = [];
  for (const [len, baseP] of Object.entries(wavyPrices)) {
    for (const [col, surcharge] of Object.entries(colorSurcharge)) {
      wavyVariants.push({
        length: len, color: col,
        price: baseP + surcharge,
        originalPrice: wavyOPs[len] + surcharge,
        stock: Math.max(3, 22 - (parseInt(len) - 12) * 2),
        sku: `RW-${len.replace('"', "")}-${col.replace("#", "")}`,
      });
    }
  }
  await prisma.productVariant.createMany({
    data: wavyVariants.map(v => ({ productId: wavy.id, ...v, active: true })),
  });
  console.log(`  ✅ ${wavy.name} — ${wavyVariants.length} variants`);

  /* ════════════════════════════════════════════
     PRODUCT 4 — 13x5 HD Lace Frontal
     Frontal pricing: higher base, fewer length options
     ════════════════════════════════════════════ */
  const frontal = await prisma.product.create({
    data: {
      id: "prod-frontal",
      name: "13x5 HD Lace Frontal",
      description: "Premium 13x5 HD lace frontal with pre-plucked natural hairline. Undetectable lace that melts perfectly into any skin tone. Bleached knots included.",
      price: 165,
      originalPrice: 225,
      image: "/images/product-frontal.jpg",
      images: JSON.stringify(["/images/product-frontal.jpg"]),
      category: "Frontals",
      badge: "Premium",
      rating: 4.7,
      reviewCount: 156,
      stock: 80,
      lowStockThreshold: 5,
      lengths: JSON.stringify(['12"', '14"', '16"', '18"', '20"']),
      colors: JSON.stringify(["#1B", "#1", "#2", "#4", "#27", "#30"]),
      featured: true,
      active: true,
    },
  });

  const frontalPrices: Record<string, number> = {
    '12"': 165, '14"': 180, '16"': 200, '18"': 225, '20"': 250,
  };
  const frontalOPs: Record<string, number> = {
    '12"': 225, '14"': 240, '16"': 260, '18"': 285, '20"': 310,
  };
  const frontalColorSurcharge: Record<string, number> = { "#1B": 0, "#1": 0, "#2": 5, "#4": 10, "#27": 15, "#30": 20 };
  const frontalVariants: { length: string; color: string; price: number; originalPrice: number; stock: number; sku: string }[] = [];
  for (const [len, baseP] of Object.entries(frontalPrices)) {
    for (const [col, surcharge] of Object.entries(frontalColorSurcharge)) {
      frontalVariants.push({
        length: len, color: col,
        price: baseP + surcharge,
        originalPrice: frontalOPs[len] + surcharge,
        stock: Math.max(2, 10 - (parseInt(len) - 12)),
        sku: `FL-${len.replace('"', "")}-${col.replace("#", "")}`,
      });
    }
  }
  await prisma.productVariant.createMany({
    data: frontalVariants.map(v => ({ productId: frontal.id, ...v, active: true })),
  });
  console.log(`  ✅ ${frontal.name} — ${frontalVariants.length} variants`);

  /* ════════════════════════════════════════════
     PRODUCT 5 — 5x5 HD Lace Closure
     ════════════════════════════════════════════ */
  const closure = await prisma.product.create({
    data: {
      id: "prod-closure",
      name: "5x5 HD Lace Closure",
      description: "5x5 HD lace closure with pre-plucked natural hairline. Perfect for a middle or side part. Seamless and undetectable. Bleached knots ready.",
      price: 110,
      originalPrice: 170,
      image: "/images/product-closure.jpg",
      images: JSON.stringify(["/images/product-closure.jpg"]),
      category: "Closures",
      badge: "Top Rated",
      rating: 4.8,
      reviewCount: 203,
      stock: 60,
      lowStockThreshold: 5,
      lengths: JSON.stringify(['12"', '14"', '16"', '18"']),
      colors: JSON.stringify(["#1B", "#1", "#2", "#4"]),
      featured: false,
      active: true,
    },
  });

  const closurePrices: Record<string, number> = {
    '12"': 110, '14"': 125, '16"': 140, '18"': 160,
  };
  const closureOPs: Record<string, number> = {
    '12"': 170, '14"': 185, '16"': 200, '18"': 220,
  };
  const closureVariants: { length: string; color: string; price: number; originalPrice: number; stock: number; sku: string }[] = [];
  for (const [len, baseP] of Object.entries(closurePrices)) {
    for (const [col, surcharge] of Object.entries(colorSurcharge)) {
      closureVariants.push({
        length: len, color: col,
        price: baseP + surcharge,
        originalPrice: closureOPs[len] + surcharge,
        stock: Math.max(3, 12 - (parseInt(len) - 12) * 2),
        sku: `CL-${len.replace('"', "")}-${col.replace("#", "")}`,
      });
    }
  }
  await prisma.productVariant.createMany({
    data: closureVariants.map(v => ({ productId: closure.id, ...v, active: true })),
  });
  console.log(`  ✅ ${closure.name} — ${closureVariants.length} variants`);

  /* ════════════════════════════════════════════
     PRODUCT 6 — Full Lace Luxury Wig
     Wigs: highest prices, wider color range
     ════════════════════════════════════════════ */
  const wig = await prisma.product.create({
    data: {
      id: "prod-wig",
      name: "Full Lace Luxury Wig",
      description: "Custom full lace luxury wig with 180% density. Pre-plucked hairline with baby hair. Glueless install ready. Comes with adjustable straps and combs.",
      price: 320,
      originalPrice: 420,
      image: "/images/product-wig.jpg",
      images: JSON.stringify(["/images/product-wig.jpg"]),
      category: "Wigs",
      badge: "Luxury",
      rating: 5.0,
      reviewCount: 89,
      stock: 40,
      lowStockThreshold: 5,
      lengths: JSON.stringify(['16"', '18"', '20"', '22"', '24"']),
      colors: JSON.stringify(["#1B", "#1", "#2", "#4", "#27", "#30", "#99J"]),
      featured: true,
      active: true,
    },
  });

  const wigPrices: Record<string, number> = {
    '16"': 320, '18"': 365, '20"': 410, '22"': 460, '24"': 520,
  };
  const wigOPs: Record<string, number> = {
    '16"': 420, '18"': 465, '20"': 510, '22"': 560, '24"': 620,
  };
  const wigColorSurcharge: Record<string, number> = { "#1B": 0, "#1": 0, "#2": 10, "#4": 15, "#27": 25, "#30": 30, "#99J": 45 };
  const wigVariants: { length: string; color: string; price: number; originalPrice: number; stock: number; sku: string }[] = [];
  for (const [len, baseP] of Object.entries(wigPrices)) {
    for (const [col, surcharge] of Object.entries(wigColorSurcharge)) {
      wigVariants.push({
        length: len, color: col,
        price: baseP + surcharge,
        originalPrice: wigOPs[len] + surcharge,
        stock: Math.max(1, 6 - (parseInt(len) - 16)),
        sku: `FLW-${len.replace('"', "")}-${col.replace("#", "")}`,
      });
    }
  }
  await prisma.productVariant.createMany({
    data: wigVariants.map(v => ({ productId: wig.id, ...v, active: true })),
  });
  console.log(`  ✅ ${wig.name} — ${wigVariants.length} variants`);

  /* ════════════════════════════════════════════
     REVIEWS
     ════════════════════════════════════════════ */
  const allProducts = await prisma.product.findMany();
  const reviewData = [
    { author: "Jasmine M.", rating: 5, title: "Absolutely Amazing!", text: "The quality of these extensions is absolutely unmatched! I have been wearing hair for over 10 years and this is by far the best I have ever purchased. The curls hold beautifully even after multiple washes.", productId: curly.id },
    { author: "Aaliyah R.", rating: 5, title: "Obsessed!", text: "I am obsessed with my frontal! The HD lace melts so perfectly into my skin, it looks like my real hairline. Installation was seamless and the hair lasts for months.", productId: frontal.id },
    { author: "Destiny K.", rating: 5, title: "Best wig ever", text: "Customer service was amazing and the shipping was super fast. The wig I ordered looks exactly like the photos. I get compliments everywhere I go.", productId: wig.id },
    { author: "Taylor S.", rating: 5, title: "Worth every penny", text: "Best hair investment I have ever made. The straight bundles are silky smooth, tangle-free, and the color match was perfect.", productId: straight.id },
    { author: "Keisha B.", rating: 4, title: "Great curls", text: "Love the curly bundles! They hold their shape beautifully after washing. Only giving 4 stars because shipping took a bit longer than expected.", productId: curly.id },
    { author: "Mia J.", rating: 5, title: "Will buy again", text: "The wavy texture is everything! Natural looking and so easy to style. Already planning my next purchase.", productId: wavy.id },
    { author: "Brianna L.", rating: 5, title: "Perfect closure", text: "This closure blends flawlessly. I got the 16 inch in #1B and it matches my leave-out perfectly. Definitely recommend!", productId: closure.id },
    { author: "Taylor S.", rating: 4, title: "Good quality frontal", text: "The frontal is great quality. Only downside is I wish they had more color options. The #2 matched my hair perfectly though.", productId: frontal.id },
  ];

  for (const r of reviewData) {
    await prisma.review.create({
      data: {
        author: r.author,
        email: `${r.author.toLowerCase().replace(" ", ".")}@email.com`,
        rating: r.rating,
        title: r.title,
        text: r.text,
        productId: r.productId,
        verified: true,
        approved: true,
      },
    });
  }
  console.log(`  ✅ ${reviewData.length} reviews seeded`);

  /* ════════════════════════════════════════════
     SETTINGS
     ════════════════════════════════════════════ */
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
  console.log(`  ✅ ${defaultSettings.length} settings seeded`);

  /* ════════════════════════════════════════════
     SUMMARY
     ════════════════════════════════════════════ */
  const totalVariants = await prisma.productVariant.count();
  const totalProducts = await prisma.product.count();
  console.log(`\n🎉 Seed complete!`);
  console.log(`   Products: ${totalProducts}`);
  console.log(`   Variants: ${totalVariants}`);
  console.log(`   Reviews:  ${reviewData.length}`);
  console.log(`   Settings: ${defaultSettings.length}`);
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
