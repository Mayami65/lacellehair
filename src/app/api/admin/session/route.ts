import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || "";
    const match = cookie.match(/lacelle_admin_token=([^;]+)/);
    const token = match ? match[1] : undefined;

    if (!validateToken(token)) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}