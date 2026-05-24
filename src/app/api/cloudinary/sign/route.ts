import crypto from "crypto";
import { validateToken } from "@/lib/adminAuth";

export const runtime = "node";

// Simple in-memory rate limiter per IP (process-limited)
const rateMap = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30;

function getIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: Request) {
  try {
    // Require admin auth cookie
    const cookie = req.headers.get("cookie") || "";
    const m = cookie.match(/lacelle_admin_token=([^;]+)/);
    const token = m ? m[1] : undefined;
    if (!validateToken(token)) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
    }

    const ip = getIp(req);
    const entry = rateMap.get(ip) || { count: 0, first: Date.now() };
    if (Date.now() - entry.first > WINDOW_MS) {
      entry.count = 0;
      entry.first = Date.now();
    }
    entry.count += 1;
    rateMap.set(ip, entry);
    if (entry.count > MAX_REQUESTS) {
      return new Response(JSON.stringify({ error: "rate_limited" }), { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const { folder, public_id } = body as { folder?: string; public_id?: string };

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return new Response(JSON.stringify({ error: "Cloudinary env vars missing" }), { status: 400 });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const params: Record<string, string | number> = { timestamp };
    if (folder) params.folder = folder;
    if (public_id) params.public_id = public_id;

    const sorted = Object.keys(params).sort();
    const toSign = sorted.map((k) => `${k}=${params[k]}`).join("&");
    const signature = crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");

    return new Response(
      JSON.stringify({ signature, timestamp, api_key: apiKey, cloud_name: cloudName }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "internal_error", detail: String(err) }), { status: 500 });
  }
}
