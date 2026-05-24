import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "./src/lib/adminAuth";

export const config = {
  matcher: [
    "/api/products/:path*",
    "/api/orders/:path*",
    "/api/variants/:path*",
    "/api/reviews/:path*",
    "/api/settings/:path*",
    "/api/products/images/:path*",
    "/api/cloudinary/sign",
  ],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow safe GET requests
  if (req.method === "GET") return NextResponse.next();

  // Allow public review submissions
  if (pathname.startsWith("/api/reviews") && req.method === "POST") return NextResponse.next();

  // Check admin cookie token
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/lacelle_admin_token=([^;]+)/);
  const token = m ? m[1] : undefined;
  if (!validateToken(token)) {
    return new NextResponse(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  return NextResponse.next();
}
