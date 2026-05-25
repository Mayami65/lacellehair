"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Crown,
  Package,
  Truck,
  Search,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function LoadingFallback() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function TrackOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialReference = searchParams.get("reference") || "";
  const [reference, setReference] = useState(initialReference);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<{
    reference: string;
    status: string;
    trackingNumber?: string | null;
    paidAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
    fullName?: string;
  } | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim() || !email.trim()) {
      setError("Enter your reference and the email used at checkout.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(
        `/api/orders/public?reference=${encodeURIComponent(reference.trim())}&email=${encodeURIComponent(email.trim())}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Order not found");
        return;
      }
      setResult(data.order || null);
    } catch {
      setError("Unable to look up order right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!reference) return;
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      <div className="bg-gradient-to-r from-pink-dark via-pink to-pink-dark text-white text-center py-2 px-4 text-xs md:text-sm font-semibold tracking-wide">
        <div className="flex items-center justify-center gap-2">
          <Crown className="w-3.5 h-3.5" />
          <span>LACELLE HAIR</span>
          <Crown className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-2xl"
        >
          <div className="text-center mb-8">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(212,175,55,0.18), rgba(255,77,109,0.12))",
                border: "1px solid rgba(212,175,55,0.25)",
              }}
            >
              <Search className="w-10 h-10 text-gold" />
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Track Your Order
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Enter the order reference from your receipt and the email used at
              checkout to see the current status and tracking number.
            </p>
          </div>

          <div
            className="rounded-2xl border border-luxury-border p-6 md:p-8"
            style={{ backgroundColor: "#111111" }}
          >
            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="text-sm text-white/70 mb-1 block">
                  Order Reference
                </label>
                <div className="flex gap-2">
                  <input
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="LAC-123456-ABCDEF"
                    className="flex-1 rounded-xl border border-luxury-border bg-luxury-gray px-3 py-3 text-white font-mono text-sm outline-none focus:border-gold/50"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-luxury-border text-white/70 hover:text-gold"
                    onClick={handleCopy}
                    disabled={!reference}
                  >
                    {copied ? (
                      "Copied"
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm text-white/70 mb-1 block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-luxury-border bg-luxury-gray px-3 py-3 text-white placeholder:text-white/30 outline-none focus:border-gold/50"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full gold-gradient text-luxury-black font-semibold rounded-full px-6 py-3"
              >
                {loading ? "Looking up..." : "Track Order"}
              </Button>
            </form>

            {error && <p className="text-sm text-red-400 mt-4">{error}</p>}

            {result && (
              <div className="mt-6 rounded-xl border border-gold/30 bg-gold/5 p-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-white font-medium">
                    {result.fullName || "Customer order"}
                  </p>
                  <span className="text-xs uppercase tracking-wide text-gold">
                    {result.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Created:{" "}
                  {result.createdAt
                    ? new Date(result.createdAt).toLocaleString()
                    : "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Paid:{" "}
                  {result.paidAt
                    ? new Date(result.paidAt).toLocaleString()
                    : "Not yet paid"}
                </p>
                <p className="text-sm text-white">
                  Tracking number: {result.trackingNumber || "Pending — assigned once your order ships"}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-6">
              <Button
                onClick={() =>
                  router.push(
                    initialReference
                      ? `/checkout/success?reference=${encodeURIComponent(initialReference)}`
                      : "/shop",
                  )
                }
                variant="outline"
                className="border-luxury-border text-white/70 hover:text-gold"
              >
                Back to Checkout Success
              </Button>
              <Button
                onClick={() => router.push("/shop")}
                className="gold-gradient text-luxury-black font-semibold"
              >
                Continue Shopping <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-left">
            {[
              {
                icon: Package,
                title: "Order status",
                text: "See whether your order is pending, paid, cancelled, shipped, or delivered.",
              },
              {
                icon: Truck,
                title: "Tracking number",
                text: "View the tracking number once it has been assigned by the admin team.",
              },
              {
                icon: CheckCircle,
                title: "Secure lookup",
                text: "Your reference and checkout email are required to access order details.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-luxury-border p-4 bg-luxury-dark/60"
              >
                <item.icon className="w-5 h-5 text-gold mb-3" />
                <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TrackOrderContent />
    </Suspense>
  );
}
