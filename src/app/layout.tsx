import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://lacellehair.com";

export const metadata: Metadata = {
  title: "LACELLE HAIR | Premium Hair Extensions, Frontals, Closures & Wigs",
  description:
    "Discover premium raw Indian hair extensions, HD lace frontals, closures, and luxury lace wigs at LACELLE HAIR. 100% virgin hair with free shipping on orders over $200. Shop now and transform your look.",
  keywords: [
    "hair extensions",
    "raw Indian hair",
    "lace frontal",
    "HD closure",
    "luxury wigs",
    "premium hair",
    "hair bundles",
    "LACELLE HAIR",
    "virgin hair extensions",
    "13x5 frontal",
    "5x5 closure",
    "lace wig",
    "curly bundles",
    "straight bundles",
    "wavy bundles",
  ],
  authors: [{ name: "LACELLE HAIR", url: siteUrl }],
  creator: "LACELLE HAIR",
  publisher: "LACELLE HAIR",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "LACELLE HAIR | Premium Hair Extensions & Wigs",
    description:
      "Discover premium raw Indian hair extensions, HD lace frontals, closures, and luxury wigs. 100% virgin hair, free shipping over $200.",
    url: siteUrl,
    siteName: "LACELLE HAIR",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "LACELLE HAIR - Premium Hair Extensions",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LACELLE HAIR | Premium Hair Extensions & Wigs",
    description:
      "Discover premium raw Indian hair extensions, HD lace frontals, closures, and luxury wigs.",
    images: ["/images/hero.jpg"],
    creator: "@lacellehair",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "LACELLE HAIR",
    description:
      "Premium raw Indian hair extensions, HD lace frontals, closures, and luxury lace wigs.",
    url: siteUrl,
    telephone: "+1-800-LACELLE-HR",
    email: "hello@lacellehair.com",
    image: `${siteUrl}/images/hero.jpg`,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Atlanta",
      addressRegion: "GA",
      addressCountry: "US",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "10000",
      bestRating: "5",
    },
    sameAs: [
      "https://instagram.com/lacellehair",
      "https://facebook.com/lacellehair",
      "https://tiktok.com/@lacellehair",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning style={{ backgroundColor: "#0A0A0A" }}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: "#0A0A0A", color: "#F5F5F5" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
