"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShoppingBag,
  Shield,
  Truck,
  Lock,
  ChevronRight,
  CreditCard,
  Smartphone,
  Building,
  CheckCircle,
  Loader2,
  Crown,
  Heart,
  MapPin,
  Phone,
  Mail,
  User,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

/* ─────────── Types ─────────── */

interface VariantInfo {
  id: string;
  length: string;
  color: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
  sku: string;
}

interface ProductInfo {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  category: string;
  badge: string;
}

interface CartItem {
  id: string;
  product: ProductInfo;
  quantity: number;
  variant?: VariantInfo;
}

/* ─────────── Loading Fallback ─────────── */

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

/* ─────────── Checkout Page ─────────── */

function CheckoutContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Customer info
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("Ghana");

  // Currency
  const [currency] = useState("GHS");

  // Cart from localStorage
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Shipping fee
  const SHIPPING_THRESHOLD = 200;
  const SHIPPING_FEE = 15;
  const subtotal = cart.reduce((sum, item) => {
    const price = item.variant ? item.variant.price : item.product.price;
    return sum + price * item.quantity;
  }, 0);
  const shippingFee = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem("lacelle-cart");
        if (saved) setCart(JSON.parse(saved));
      } catch {}
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      toast.error("Please fill in your name, email, and phone number");
      return;
    }

    setProcessing(true);

    try {
      const items = cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        image: item.product.image,
        variantId: item.variant?.id || null,
        length: item.variant?.length || null,
        color: item.variant?.color || null,
        price: item.variant ? item.variant.price : item.product.price,
        quantity: item.quantity,
      }));

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
          items,
          subtotal,
          shippingFee,
          totalAmount: total,
          currency,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Checkout failed. Please try again.");
        setProcessing(false);
        return;
      }

      if (data.authorization_url) {
        // Redirect to Paystack payment page
        localStorage.removeItem("lacelle-cart");
        window.location.assign(data.authorization_url);
      } else {
        toast.error("Failed to initialize payment");
        setProcessing(false);
      }
    } catch {
      toast.error("Network error. Please try again.");
      setProcessing(false);
    }
  };

  if (!mounted) return <LoadingFallback />;

  if (cart.length === 0) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: "#0A0A0A" }}
      >
        <ShoppingBag className="w-20 h-20 text-luxury-border mb-6" />
        <h2
          className="text-2xl font-bold text-white mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Your cart is empty
        </h2>
        <p className="text-muted-foreground mb-8 text-center">
          Add some luxurious hair products to your cart before checking out.
        </p>
        <button
          onClick={() => router.push("/shop")}
          className="gold-gradient text-luxury-black font-semibold rounded-full px-8 py-3 hover:opacity-90 transition-all"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0A0A" }}>
      {/* Top bar */}
      <div className="bg-gradient-to-r from-pink-dark via-pink to-pink-dark text-white text-center py-2 px-4 text-xs md:text-sm font-semibold tracking-wide">
        <div className="flex items-center justify-center gap-2">
          <Crown className="w-3.5 h-3.5" />
          <span>Secure Checkout — 256-bit SSL Encrypted</span>
          <Crown className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-luxury-black/95 backdrop-blur-md border-b border-luxury-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push("/shop")}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-gold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Shop</span>
            </button>
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center">
                <Crown className="w-4 h-4 text-luxury-black" />
              </div>
              <span
                className="text-lg font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                LACELLE <span className="pink-shimmer">HAIR</span>
              </span>
            </button>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="w-3.5 h-3.5 text-green-400" />
              <span className="hidden sm:inline">Secure</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => router.push("/")}
            className="hover:text-gold transition-colors"
          >
            Home
          </button>
          <ChevronRight className="w-3 h-3" />
          <button
            onClick={() => router.push("/shop")}
            className="hover:text-gold transition-colors"
          >
            Shop
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white">Checkout</span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold text-white mb-8"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Checkout
        </motion.h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Form */}
            <div className="lg:col-span-3 space-y-6">
              {/* Customer Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="rounded-2xl border border-luxury-border p-6"
                style={{ backgroundColor: "#111111" }}
              >
                <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <User className="w-5 h-5 text-gold" />
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-sm text-white/70 mb-1.5 block">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <Input
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="pl-10 bg-luxury-gray border-luxury-border text-white placeholder:text-white/30 h-12 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-1.5 block">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 bg-luxury-gray border-luxury-border text-white placeholder:text-white/30 h-12 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-1.5 block">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <Input
                        type="tel"
                        placeholder="+233 XX XXX XXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="pl-10 bg-luxury-gray border-luxury-border text-white placeholder:text-white/30 h-12 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Shipping Address */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="rounded-2xl border border-luxury-border p-6"
                style={{ backgroundColor: "#111111" }}
              >
                <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-pink" />
                  Delivery Address
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-sm text-white/70 mb-1.5 block">
                      Street Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                      <Input
                        type="text"
                        placeholder="House number, street name"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="pl-10 bg-luxury-gray border-luxury-border text-white placeholder:text-white/30 h-12 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-1.5 block">
                      City
                    </label>
                    <Input
                      type="text"
                      placeholder="Accra"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="bg-luxury-gray border-luxury-border text-white placeholder:text-white/30 h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-1.5 block">
                      Region / State
                    </label>
                    <Input
                      type="text"
                      placeholder="Greater Accra"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="bg-luxury-gray border-luxury-border text-white placeholder:text-white/30 h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-1.5 block">
                      Country
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-luxury-gray border border-luxury-border rounded-xl h-12 px-3 text-white outline-none focus:border-gold/50 transition-colors cursor-pointer"
                    >
                      <option value="Ghana" className="bg-luxury-dark">
                        Ghana
                      </option>
                      <option value="Nigeria" className="bg-luxury-dark">
                        Nigeria
                      </option>
                      <option value="Kenya" className="bg-luxury-dark">
                        Kenya
                      </option>
                      <option value="South Africa" className="bg-luxury-dark">
                        South Africa
                      </option>
                      <option value="United States" className="bg-luxury-dark">
                        United States
                      </option>
                      <option value="United Kingdom" className="bg-luxury-dark">
                        United Kingdom
                      </option>
                      <option value="Canada" className="bg-luxury-dark">
                        Canada
                      </option>
                      <option value="Other" className="bg-luxury-dark">
                        Other
                      </option>
                    </select>
                  </div>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="rounded-2xl border border-luxury-border p-6"
                style={{ backgroundColor: "#111111" }}
              >
                <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gold" />
                  Payment Method
                </h2>
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gold/30 bg-gold/5">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6 text-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">
                      Pay with Paystack
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Mobile Money, Visa, Mastercard, Bank Transfer
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="px-2 py-1 rounded bg-luxury-gray border border-luxury-border text-[10px] text-white/60">
                      MTN
                    </div>
                    <div className="px-2 py-1 rounded bg-luxury-gray border border-luxury-border text-[10px] text-white/60">
                      Voda
                    </div>
                    <div className="px-2 py-1 rounded bg-luxury-gray border border-luxury-border text-[10px] text-white/60">
                      Visa
                    </div>
                    <div className="hidden sm:block px-2 py-1 rounded bg-luxury-gray border border-luxury-border text-[10px] text-white/60">
                      MC
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-green-400" />
                  <span>Your payment is encrypted and secure</span>
                </div>
              </motion.div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="sticky top-24 rounded-2xl border border-luxury-border p-6"
                style={{ backgroundColor: "#111111" }}
              >
                <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <Package className="w-5 h-5 text-pink" />
                  Order Summary
                  <Badge className="bg-pink text-white border-0 text-xs ml-auto">
                    {cartCount} item{cartCount !== 1 ? "s" : ""}
                  </Badge>
                </h2>

                {/* Items */}
                <div className="space-y-4 mb-6 max-h-72 overflow-y-auto pr-1">
                  {cart.map((item) => {
                    const price = item.variant
                      ? item.variant.price
                      : item.product.price;
                    return (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-luxury-gray">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">
                            {item.product.name}
                          </p>
                          {item.variant && (
                            <div className="flex gap-1 mt-0.5">
                              {item.variant.length && (
                                <span className="text-[10px] text-gold">
                                  {item.variant.length}
                                </span>
                              )}
                              {item.variant.length && item.variant.color && (
                                <span className="text-[10px] text-white/30">
                                  /
                                </span>
                              )}
                              {item.variant.color && (
                                <span className="text-[10px] text-pink">
                                  {item.variant.color}
                                </span>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-gold flex-shrink-0">
                          ${(price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <Separator className="bg-luxury-border my-4" />

                {/* Totals */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span
                      className={
                        shippingFee === 0
                          ? "text-green-400 font-medium"
                          : "text-white"
                      }
                    >
                      {shippingFee === 0
                        ? "FREE"
                        : `$${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  {shippingFee > 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      <Truck className="w-3 h-3 inline mr-1" />
                      Free shipping on orders over ${SHIPPING_THRESHOLD}
                    </p>
                  )}
                  <Separator className="bg-luxury-border" />
                  <div className="flex justify-between">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-xl font-bold text-gold">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={processing}
                  className="w-full mt-6 py-4 rounded-xl text-sm font-bold transition-all gold-gradient text-luxury-black hover:opacity-90 shadow-lg shadow-gold/20 disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Pay ${total.toFixed(2)}
                    </>
                  )}
                </Button>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-2 mt-5">
                  <div className="text-center p-2 rounded-lg bg-luxury-gray/50">
                    <Shield className="w-4 h-4 text-green-400 mx-auto mb-1" />
                    <p className="text-[10px] text-muted-foreground">
                      SSL Secure
                    </p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-luxury-gray/50">
                    <Truck className="w-4 h-4 text-gold mx-auto mb-1" />
                    <p className="text-[10px] text-muted-foreground">
                      Fast Delivery
                    </p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-luxury-gray/50">
                    <CheckCircle className="w-4 h-4 text-pink mx-auto mb-1" />
                    <p className="text-[10px] text-muted-foreground">
                      Quality Guarantee
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutContent />
    </Suspense>
  );
}
