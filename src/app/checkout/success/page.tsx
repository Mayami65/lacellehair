"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Crown,
  Package,
  Truck,
  ArrowRight,
  Copy,
  ExternalLink,
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

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || "";
  const [status, setStatus] = useState<
    "loading" | "success" | "failed" | "cancelled"
  >("loading");
  const [copied, setCopied] = useState(false);
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [lookupResult, setLookupResult] = useState<{
    reference: string;
    status: string;
    trackingNumber?: string | null;
    paidAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
    fullName?: string;
  } | null>(null);

  useEffect(() => {
    if (!reference) {
      router.push("/shop");
      return;
    }

    // Verify payment
    fetch(`/api/checkout/verify?reference=${reference}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === "success") setStatus("success");
        else if (data.status === "cancelled" || data.status === "abandoned")
          setStatus("cancelled");
        else setStatus("failed");
      })
      .catch(() => setStatus("failed"));
  }, [reference, router]);

  const handleCopyRef = () => {
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference || !lookupEmail.trim()) {
      setLookupError("Enter the email used for the order.");
      return;
    }

    setLookupLoading(true);
    setLookupError("");
    setLookupResult(null);

    try {
      const res = await fetch(
        `/api/orders/public?reference=${encodeURIComponent(reference)}&email=${encodeURIComponent(lookupEmail.trim())}`,
      );
      const data = await res.json();

      if (!res.ok) {
        setLookupError(data.error || "Order not found");
        return;
      }

      setLookupResult(data.order || null);
    } catch {
      setLookupError("Unable to look up order right now.");
    } finally {
      setLookupLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: "#0A0A0A" }}
      >
        <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-white text-lg font-medium">
          Verifying your payment...
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          Please wait a moment
        </p>
      </div>
    );
  }

  if (status === "failed" || status === "cancelled") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: "#0A0A0A" }}
      >
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
          <span className="text-4xl">&#10060;</span>
        </div>
        <h1
          className="text-2xl font-bold text-white mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {status === "cancelled" ? "Payment Cancelled" : "Payment Failed"}
        </h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          {status === "cancelled"
            ? "Your payment was cancelled or abandoned before completion. No charge was made. You can try again when ready."
            : "Unfortunately, your payment could not be completed. Your card has not been charged. Please try again or contact us for support."}
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => router.push("/checkout")}
            className="gold-gradient text-luxury-black font-semibold rounded-full px-6"
          >
            Try Again
          </Button>
          <Button
            onClick={() => router.push("/shop")}
            variant="outline"
            className="border-luxury-border text-white/70 rounded-full px-6 hover:border-gold hover:text-gold"
          >
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      {/* Top bar */}
      <div className="bg-gradient-to-r from-pink-dark via-pink to-pink-dark text-white text-center py-2 px-4 text-xs md:text-sm font-semibold tracking-wide">
        <div className="flex items-center justify-center gap-2">
          <Crown className="w-3.5 h-3.5" />
          <span>LACELLE HAIR</span>
          <Crown className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg w-full text-center"
        >
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(212,175,55,0.15))",
              border: "2px solid rgba(34,197,94,0.3)",
            }}
          >
            <CheckCircle className="w-14 h-14 text-green-400" />
          </motion.div>

          <h1
            className="text-3xl md:text-4xl font-bold text-white mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Thank you for shopping with LACELLE HAIR! Your payment was
            successful and your order is being processed. We&apos;ll send a
            confirmation to your email shortly.
          </p>

          {/* Order reference */}
          <div
            className="rounded-xl border border-luxury-border p-4 mb-8 inline-block"
            style={{ backgroundColor: "#111111" }}
          >
            <p className="text-xs text-muted-foreground mb-1">
              Order Reference
            </p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-gold font-mono">
                {reference}
              </p>
              <button
                onClick={handleCopyRef}
                className="p-1.5 rounded-lg hover:bg-luxury-gray transition-colors"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-white/50" />
                )}
              </button>
            </div>
          </div>

          {/* Tracking lookup */}
          <div
            className="rounded-xl border border-luxury-border p-5 mb-8 text-left"
            style={{ backgroundColor: "#111111" }}
          >
            <h3 className="text-white font-semibold text-sm mb-2">
              Track your order
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Use the email you entered at checkout to see the current order
              status and tracking number.
            </p>
            <form onSubmit={handleLookup} className="space-y-3">
              <div>
                <label className="text-xs text-white/70 mb-1 block">
                  Order Reference
                </label>
                <input
                  value={reference}
                  readOnly
                  className="w-full rounded-xl border border-luxury-border bg-luxury-gray px-3 py-2 text-white/80 font-mono text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-white/70 mb-1 block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={lookupEmail}
                  onChange={(e) => setLookupEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-luxury-border bg-luxury-gray px-3 py-2 text-white placeholder:text-white/30 text-sm outline-none focus:border-gold/50"
                />
              </div>
              <Button
                type="submit"
                disabled={lookupLoading}
                className="w-full gold-gradient text-luxury-black font-semibold rounded-full px-6 py-3"
              >
                {lookupLoading ? "Looking up..." : "Track Order"}
              </Button>
            </form>

            {lookupError && (
              <p className="text-sm text-red-400 mt-3">{lookupError}</p>
            )}

            {lookupResult && (
              <div className="mt-4 rounded-xl border border-gold/30 bg-gold/5 p-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-white font-medium">
                    {lookupResult.fullName || "Customer order"}
                  </p>
                  <span className="text-xs uppercase tracking-wide text-gold">
                    {lookupResult.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Created:{" "}
                  {lookupResult.createdAt
                    ? new Date(lookupResult.createdAt).toLocaleString()
                    : "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Paid:{" "}
                  {lookupResult.paidAt
                    ? new Date(lookupResult.paidAt).toLocaleString()
                    : "Not yet paid"}
                </p>
                <p className="text-sm text-white">
                  Tracking number:{" "}
                  {lookupResult.trackingNumber || "Not assigned yet"}
                </p>
              </div>
            )}
          </div>

          {/* What's next */}
          <div
            className="space-y-4 text-left rounded-xl border border-luxury-border p-5 mb-8"
            style={{ backgroundColor: "#111111" }}
          >
            <h3 className="text-white font-semibold text-sm mb-3">
              What happens next?
            </h3>
            {[
              {
                icon: Package,
                text: "We'll confirm your order and prepare your items",
                color: "text-gold",
              },
              {
                icon: Truck,
                text: "You'll receive shipping updates via email & WhatsApp",
                color: "text-pink",
              },
              {
                icon: CheckCircle,
                text: "Your order will arrive within 3-5 business days",
                color: "text-green-400",
              },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-luxury-gray flex items-center justify-center flex-shrink-0 mt-0.5">
                  <step.icon className={`w-4 h-4 ${step.color}`} />
                </div>
                <p className="text-sm text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push("/shop")}
              className="gold-gradient text-luxury-black font-semibold rounded-full px-8 py-3"
            >
              Continue Shopping <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={() =>
                router.push(
                  `/track-order?reference=${encodeURIComponent(reference)}`,
                )
              }
              variant="outline"
              className="border-luxury-border text-white/70 rounded-full px-8 py-3 hover:border-gold hover:text-gold"
            >
              Track Order <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-luxury-border text-white/70 rounded-full px-8 py-3 hover:border-gold hover:text-gold"
            >
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  );
}
