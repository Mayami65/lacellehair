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

export const metadata: Metadata = {
  title: "Luxe Locks | Premium Hair Extensions & Wigs",
  description:
    "Discover premium raw Indian hair extensions, frontals, closures, and luxury wigs. Shop the finest quality hair with free shipping on orders over $200.",
  keywords: [
    "hair extensions",
    "raw Indian hair",
    "lace frontal",
    "HD closure",
    "luxury wigs",
    "premium hair",
    "bundles",
    "hair plugs",
  ],
  authors: [{ name: "Luxe Locks" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Luxe Locks | Premium Hair Extensions & Wigs",
    description:
      "Discover premium raw Indian hair extensions, frontals, closures, and luxury wigs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning style={{ backgroundColor: '#0A0A0A' }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: '#0A0A0A', color: '#F5F5F5' }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
