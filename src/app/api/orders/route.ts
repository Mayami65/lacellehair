import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateToken } from "@/lib/adminAuth";

function unauthorized() {
  return new NextResponse(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
}

function getAdminTokenFromHeaders(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/lacelle_admin_token=([^;]+)/);
  return m ? m[1] : undefined;
}

export async function GET(req: NextRequest) {
  // Admin only: validate token
  const token = getAdminTokenFromHeaders(req);
  if (!validateToken(token)) return unauthorized();

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const format = url.searchParams.get("format");
  const page = Number(url.searchParams.get("page") || "1");
  const limit = Math.min(Number(url.searchParams.get("limit") || "50"), 200);

  if (id) {
    const order = await db.order.findUnique({ where: { id } });
    return NextResponse.json(order || null);
  }

  const where: any = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { fullName: { contains: q, mode: "insensitive" } },
      { reference: { contains: q, mode: "insensitive" } },
    ];
  }
  if (from || to) {
    where.createdAt = {};
    if (from) {
      const d = new Date(from);
      if (!isNaN(d.getTime())) where.createdAt.gte = d;
    }
    if (to) {
      const d = new Date(to);
      if (!isNaN(d.getTime())) where.createdAt.lte = d;
    }
  }

  const total = await db.order.count({ where });
  const orders = await db.order.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit });

  // CSV export
  if (format === "csv") {
    const rows = orders.map((o) => ({
      id: o.id,
      reference: o.reference,
      fullName: o.fullName,
      email: o.email,
      phone: o.phone,
      totalAmount: String(o.totalAmount),
      currency: o.currency,
      status: o.status,
      trackingNumber: o.trackingNumber || "",
      createdAt: o.createdAt.toISOString(),
      items: o.items,
    }));

    const escape = (v: any) => {
      if (v === null || v === undefined) return "";
      const s = String(v).replace(/"/g, '""');
      return `"${s}"`;
    };

    const header = ["id", "reference", "fullName", "email", "phone", "totalAmount", "currency", "status", "trackingNumber", "createdAt", "items"];
    const csv = [header.join(","), ...rows.map((r) => header.map((h) => escape((r as any)[h])).join(","))].join("\n");

    return new NextResponse(csv, { status: 200, headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=orders.csv" } });
  }

  return NextResponse.json({ orders, total, page, limit });
}

export async function PATCH(req: NextRequest) {
  const token = getAdminTokenFromHeaders(req);
  if (!validateToken(token)) return unauthorized();

  let body: any;
  try { body = await req.json(); } catch { return new NextResponse(JSON.stringify({ error: "invalid json" }), { status: 400, headers: { "Content-Type": "application/json" } }); }

  const { id, status, trackingNumber } = body;
  if (!id) return new NextResponse(JSON.stringify({ error: "missing id" }), { status: 400, headers: { "Content-Type": "application/json" } });

  const update: any = {};
  if (status) update.status = status;
  if (trackingNumber) {
    // basic tracking number validation
    const ok = /^[A-Za-z0-9\-_.]{3,128}$/.test(trackingNumber);
    if (!ok) return new NextResponse(JSON.stringify({ error: "invalid trackingNumber format" }), { status: 400, headers: { "Content-Type": "application/json" } });
    update.trackingNumber = trackingNumber;
  }
  if (status === "paid") update.paidAt = new Date();

  try {
    const o = await db.order.update({ where: { id }, data: update });
    return NextResponse.json(o);
  } catch (err: any) {
    return new NextResponse(JSON.stringify({ error: err.message || "update failed" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
