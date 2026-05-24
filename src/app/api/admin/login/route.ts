import { NextRequest, NextResponse } from "next/server";
import { createToken } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = body?.password;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "LACELLE2024";
    if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: "invalid" }, { status: 401 });

    const token = createToken();
    const secure = process.env.NODE_ENV === "production";
    const cookie = `lacelle_admin_token=${token}; Path=/; HttpOnly; SameSite=Lax; ${secure ? "Secure; " : ""}Max-Age=${24 * 3600}`;
    const res = NextResponse.json({ success: true });
    res.headers.set("Set-Cookie", cookie);
    return res;
  } catch (err) {
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
