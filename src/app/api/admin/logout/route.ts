import { NextRequest, NextResponse } from "next/server";
import { revokeToken } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || "";
    const match = cookie.match(/lacelle_admin_token=([^;]+)/);
    const token = match ? match[1] : undefined;
    if (token) revokeToken(token);
    const res = NextResponse.json({ success: true });
    res.headers.set("Set-Cookie", `lacelle_admin_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`);
    return res;
  } catch (err) {
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
