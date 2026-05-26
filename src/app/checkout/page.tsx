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
  const [processingMethod, setProcessingMethod] = useState<
    "paystack" | "stripe" | null
  >(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "paystack" | "stripe"
  >("paystack");

  // Customer info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [vatNumber, setVatNumber] = useState("");

  // Shipping address
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Belgium");

  // Currency
  const [currency] = useState("EUR");

  // Cart from localStorage
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Shipping fee
  const SHIPPING_THRESHOLD = 100;
  const SHIPPING_FEE = 6.95;
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

  const buildCheckoutPayload = () => {
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

    const fullAddress = [address.trim(), apartment.trim()].filter(Boolean).join(", ")

    return {
      email: email.trim(),
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      phone: phone.trim(),
      address: fullAddress,
      city: city.trim(),
      state: postalCode.trim(),
      country: country.trim(),
      items,
      subtotal,
      shippingFee,
      totalAmount: total,
      currency,
      company: company.trim(),
      vatNumber: vatNumber.trim(),
    };
  };

  const validateCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return false;
    }

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Please enter your first and last name");
      return false;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return false;
    }

    if (!address.trim() || !city.trim() || !postalCode.trim()) {
      toast.error("Please fill in your full delivery address");
      return false;
    }

    return true;
  };

  const handlePaystackCheckout = async () => {
    if (!validateCheckout()) return;

    setProcessingMethod("paystack");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildCheckoutPayload()),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Checkout failed. Please try again.");
        setProcessingMethod(null);
        return;
      }

      if (data.paymentUrl) {
        localStorage.removeItem("lacelle-cart");
        window.location.assign(data.paymentUrl);
        return;
      }

      toast.error("Failed to initialize Paystack payment");
      setProcessingMethod(null);
    } catch {
      toast.error("Network error. Please try again.");
      setProcessingMethod(null);
    }
  };

  const handleStripeCheckout = async () => {
    if (!validateCheckout()) return;

    setProcessingMethod("stripe");

    try {
      const res = await fetch("/api/stripe/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildCheckoutPayload()),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Stripe checkout failed. Please try again.");
        setProcessingMethod(null);
        return;
      }

      if (data.url) {
        localStorage.removeItem("lacelle-cart");
        window.location.assign(data.url);
        return;
      }

      toast.error("Failed to initialize Stripe payment");
      setProcessingMethod(null);
    } catch {
      toast.error("Network error. Please try again.");
      setProcessingMethod(null);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPaymentMethod === "stripe") {
      await handleStripeCheckout();
      return;
    }

    await handlePaystackCheckout();
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
              {/* Contact Information */}
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
                  <div>
                    <label className="text-sm text-white/70 mb-1.5 block">First Name *</label>
                    <Input
                      placeholder="Marie"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="bg-luxury-gray border-luxury-border text-white placeholder:text-white/30 h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-1.5 block">Last Name *</label>
                    <Input
                      placeholder="Dubois"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="bg-luxury-gray border-luxury-border text-white placeholder:text-white/30 h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-1.5 block">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <Input
                        type="email"
                        placeholder="marie@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 bg-luxury-gray border-luxury-border text-white placeholder:text-white/30 h-12 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-1.5 block">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <Input
                        type="tel"
                        placeholder="+32 470 12 34 56"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="pl-10 bg-luxury-gray border-luxury-border text-white placeholder:text-white/30 h-12 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Billing & Shipping Address */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="rounded-2xl border border-luxury-border p-6"
                style={{ backgroundColor: "#111111" }}
              >
                <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <Building className="w-5 h-5 text-gold" />
                  Billing &amp; Shipping Address
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-sm text-white/70 mb-1.5 block">Company (optional)</label>
                    <Input
                      placeholder="Company name"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="bg-luxury-gray border-luxury-border text-white placeholder:text-white/30 h-12 rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm text-white/70 mb-1.5 block">VAT Number (optional)</label>
                    <Input
                      placeholder="BE 0123.456.789"
                      value={vatNumber}
                      onChange={(e) => setVatNumber(e.target.value)}
                      className="bg-luxury-gray border-luxury-border text-white placeholder:text-white/30 h-12 rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm text-white/70 mb-1.5 block">Street Address *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                      <Input
                        placeholder="Rue de la Loi 16"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        className="pl-10 bg-luxury-gray border-luxury-border text-white placeholder:text-white/30 h-12 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-1.5 block">Apartment, Suite, etc.</label>
                    <Input
                      placeholder="Apt 4B"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      className="bg-luxury-gray border-luxury-border text-white placeholder:text-white/30 h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-1.5 block">Postal Code *</label>
                    <Input
                      placeholder="1000"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      required
                      className="bg-luxury-gray border-luxury-border text-white placeholder:text-white/30 h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-1.5 block">City *</label>
                    <Input
                      placeholder="Brussels"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="bg-luxury-gray border-luxury-border text-white placeholder:text-white/30 h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-1.5 block">Country *</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-luxury-gray border border-luxury-border rounded-xl h-12 px-3 text-white outline-none focus:border-gold/50 transition-colors cursor-pointer"
                    >
                      <option value="Belgium" className="bg-luxury-dark">Belgium</option>
                      <option value="Netherlands" className="bg-luxury-dark">Netherlands</option>
                      <option value="Luxembourg" className="bg-luxury-dark">Luxembourg</option>
                      <option value="France" className="bg-luxury-dark">France</option>
                      <option value="Germany" className="bg-luxury-dark">Germany</option>
                      <option value="Austria" className="bg-luxury-dark">Austria</option>
                      <option value="Switzerland" className="bg-luxury-dark">Switzerland</option>
                      <option value="Italy" className="bg-luxury-dark">Italy</option>
                      <option value="Spain" className="bg-luxury-dark">Spain</option>
                      <option value="United Kingdom" className="bg-luxury-dark">United Kingdom</option>
                      <option value="United States" className="bg-luxury-dark">United States</option>
                      <option value="Canada" className="bg-luxury-dark">Canada</option>
                      <option value="Other" className="bg-luxury-dark">Other</option>
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
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod("paystack")}
                    className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                      selectedPaymentMethod === "paystack"
                        ? "border-gold/40 bg-gold/5"
                        : "border-luxury-border bg-luxury-gray/30 hover:bg-luxury-gray/50"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#0BA4DB]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <svg viewBox="0 0 120 28" className="w-8 h-auto" fill="none">
                        <path d="M10.8 0h11.2L16.8 14.5 27.8 28H16.4L0 5.4V28h26.3V0H10.8z" fill="#0BA4DB" transform="scale(0.85) translate(4,0)" />
                        <text x="40" y="19" fill="#0BA4DB" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="14">paystack</text>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">
                        Paystack
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Mobile Money, Visa, Mastercard, Bank Transfer
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedPaymentMethod === "paystack"
                          ? "border-gold"
                          : "border-luxury-border"
                      }`}
                    >
                      {selectedPaymentMethod === "paystack" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-gold" />
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod("stripe")}
                    className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                      selectedPaymentMethod === "stripe"
                        ? "border-pink/40 bg-pink/5"
                        : "border-luxury-border bg-luxury-gray/30 hover:bg-luxury-gray/50"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#635BFF]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <svg viewBox="0 0 60 25" className="w-8 h-auto" fill="none">
                        <path fillRule="evenodd" clipRule="evenodd" d="M6.7 10.7h4.8c1.4 0 2.5.3 3.3 1 .7.6 1.1 1.5 1.1 2.6 0 1.1-.4 2-1.1 2.7-.8.7-1.9 1-3.3 1H8.8l-.7 3.3H5.3l1.4-6.6v-2zm1.5 3.7l-.5 2.2h2.4c.6 0 1-.1 1.3-.4.3-.3.5-.7.5-1.1 0-.4-.2-.8-.4-1-.3-.3-.7-.4-1.3-.4l-1.9.7zm9.5-3.7h2.7l-1.7 8h-2.7l1.7-8zm5.6 0h3.5c1.1 0 2 .3 2.6.9.6.6.9 1.4.9 2.4s-.3 1.8-.9 2.4c-.6.6-1.5.9-2.6.9h-1.8l-.7 3.4h-2.7l1.7-8zm1.2 3.7l-.4 2.1h1.1c.7 0 1.2-.1 1.5-.4.3-.3.5-.7.5-1.1 0-.4-.2-.7-.5-1-.3-.3-.8-.4-1.5-.4l-.7.8zm15.5-3.7l-3.3 8h-2.5l-1.6-6.4-1.6 6.4h-2.5l-2-8h2.6l1.1 5.4 1.5-5.4h2.3l1.5 5.4 1.1-5.4h2.9z" fill="#635BFF"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">Stripe</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        International cards and wallets
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedPaymentMethod === "stripe"
                          ? "border-pink"
                          : "border-luxury-border"
                      }`}
                    >
                      {selectedPaymentMethod === "stripe" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-pink" />
                      )}
                    </div>
                  </button>
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
                    <span className="text-white">&euro;{subtotal.toFixed(2)}</span>
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
                        : `&euro;{shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  {shippingFee > 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      <Truck className="w-3 h-3 inline mr-1" />
                      Free shipping on orders over &euro;{SHIPPING_THRESHOLD}
                    </p>
                  )}
                  <Separator className="bg-luxury-border" />
                  <div className="flex justify-between">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-xl font-bold text-gold">
                      &euro;{total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={processingMethod !== null}
                  className="w-full mt-6 py-4 rounded-xl text-sm font-bold transition-all gold-gradient text-luxury-black hover:opacity-90 shadow-lg shadow-gold/20 disabled:opacity-50"
                >
                  {processingMethod === "paystack" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redirecting to Paystack...
                    </>
                  ) : processingMethod === "stripe" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redirecting to Stripe...
                    </>
                  ) : selectedPaymentMethod === "stripe" ? (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay with Stripe &euro;{total.toFixed(2)}
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Pay with Paystack &euro;{total.toFixed(2)}
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
