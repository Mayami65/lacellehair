"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  Star,
  Truck,
  Shield,
  Award,
  ChevronRight,
  Instagram,
  Facebook,
  Twitter,
  ArrowUp,
  Sparkles,
  Crown,
  Gem,
  Mail,
  ChevronDown,
  Minus,
  Plus,
  MessageCircle,
  Send,
  Package,
  Clock,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

/* ─────────── Types ─────────── */
interface VariantType {
  id: string;
  productId: string;
  length: string;
  color: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
  sku: string;
}

interface ProductType {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  category: string;
  badge: string;
  rating: number;
  reviewCount: number;
  lengths: string[];
  colors: string[];
  stock: number;
  lowStockThreshold: number;
  variants?: VariantType[];
}

interface ReviewType {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  text: string;
  createdAt: string;
  product?: { name: string };
}

interface CartItem {
  id: string;
  product: ProductType;
  quantity: number;
  variant?: VariantType;
}

/* ─────────── Static Data ─────────── */

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "#categories" },
  { label: "About", href: "#about" },
  { label: "Reviews", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

const FALLBACK_PRODUCTS: ProductType[] = [
  {
    id: "1",
    name: "Raw Indian Curly Bundle",
    price: 100,
    originalPrice: 140,
    image: "/images/product-curly.jpg",
    category: "Bundles",
    badge: "Best Seller",
    rating: 4.9,
    reviewCount: 234,
    lengths: [
      '12"',
      '14"',
      '16"',
      '18"',
      '20"',
      '22"',
      '24"',
      '26"',
      '28"',
      '30"',
    ],
    colors: ["#1B", "#1", "#2", "#4"],
    stock: 50,
    lowStockThreshold: 5,
  },
  {
    id: "2",
    name: "Raw Indian Straight Bundle",
    price: 95,
    originalPrice: 135,
    image: "/images/product-straight.jpg",
    category: "Bundles",
    badge: "New",
    rating: 4.8,
    reviewCount: 187,
    lengths: ['12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"'],
    colors: ["#1B", "#1", "#2"],
    stock: 35,
    lowStockThreshold: 5,
  },
  {
    id: "3",
    name: "Raw Indian Wavy Bundle",
    price: 105,
    originalPrice: 145,
    image: "/images/product-wavy.jpg",
    category: "Bundles",
    badge: "Popular",
    rating: 4.9,
    reviewCount: 298,
    lengths: ['12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"', '28"'],
    colors: ["#1B", "#1", "#2", "#4"],
    stock: 42,
    lowStockThreshold: 5,
  },
  {
    id: "4",
    name: "13x5 HD Lace Frontal",
    price: 185,
    originalPrice: 245,
    image: "/images/product-frontal.jpg",
    category: "Frontals",
    badge: "Premium",
    rating: 4.7,
    reviewCount: 156,
    lengths: ['12"', '14"', '16"', '18"', '20"'],
    colors: ["#1B", "#1", "#2"],
    stock: 20,
    lowStockThreshold: 5,
  },
  {
    id: "5",
    name: "5x5 HD Lace Closure",
    price: 125,
    originalPrice: 185,
    image: "/images/product-closure.jpg",
    category: "Closures",
    badge: "Top Rated",
    rating: 4.8,
    reviewCount: 203,
    lengths: ['12"', '14"', '16"', '18"'],
    colors: ["#1B", "#1", "#2"],
    stock: 28,
    lowStockThreshold: 5,
  },
  {
    id: "6",
    name: "Full Lace Luxury Wig",
    price: 350,
    originalPrice: 450,
    image: "/images/product-wig.jpg",
    category: "Wigs",
    badge: "Luxury",
    rating: 5.0,
    reviewCount: 89,
    lengths: ['16"', '18"', '20"', '22"', '24"'],
    colors: ["#1B", "#1", "#2", "#4"],
    stock: 3,
    lowStockThreshold: 5,
  },
];

const TESTIMONIALS = [
  {
    name: "Jasmine M.",
    location: "Atlanta, GA",
    rating: 5,
    text: "The quality of these extensions is absolutely unmatched! I have been wearing hair for over 10 years and this is by far the best I have ever purchased. The curls hold beautifully even after multiple washes.",
    avatar: "J",
    product: "Raw Indian Curly Bundle",
  },
  {
    name: "Aaliyah R.",
    location: "Houston, TX",
    rating: 5,
    text: "I am obsessed with my frontal! The HD lace melts so perfectly into my skin, it looks like my real hairline. Installation was seamless and the hair lasts for months with proper care.",
    avatar: "A",
    product: "13x5 HD Lace Frontal",
  },
  {
    name: "Destiny K.",
    location: "Los Angeles, CA",
    rating: 5,
    text: "Customer service was amazing and the shipping was super fast. The wig I ordered looks exactly like the photos. I get compliments everywhere I go. Will definitely be a repeat customer!",
    avatar: "D",
    product: "Full Lace Luxury Wig",
  },
  {
    name: "Taylor S.",
    location: "Chicago, IL",
    rating: 5,
    text: "Best hair investment I have ever made. The straight bundles are silky smooth, tangle-free, and the color match was perfect. This hair is worth every single penny!",
    avatar: "T",
    product: "Raw Indian Straight Bundle",
  },
];

const TRUST_ITEMS = [
  {
    icon: Award,
    title: "100% Raw & Unprocessed",
    description:
      "Our hair is sourced directly from ethical donors, ensuring the highest quality virgin hair with all cuticles intact and aligned in one direction.",
  },
  {
    icon: Truck,
    title: "Free Express Shipping",
    description:
      "Enjoy complimentary express shipping on all orders over $200. Your luxury hair will arrive at your doorstep within 3-5 business days, securely packaged.",
  },
  {
    icon: Shield,
    title: "30-Day Quality Guarantee",
    description:
      "We stand behind the quality of our products. If you are not completely satisfied, return your hair within 30 days for a full exchange or refund.",
  },
  {
    icon: Sparkles,
    title: "Long-Lasting Quality",
    description:
      "With proper care, our premium hair extensions can last 12-24 months. Each bundle is carefully selected and inspected to meet our rigorous quality standards.",
  },
];

/* ─────────── Helpers ─────────── */

function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const t = setTimeout(() => setPrefersReduced(mq.matches), 0);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => {
      mq.removeEventListener("change", handler);
      clearTimeout(t);
    };
  }, []);
  return prefersReduced;
}

function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, (val: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue];
}

/* ─────────── Components ─────────── */

function SectionHeading({
  subtitle,
  title,
  description,
}: {
  subtitle: string;
  title: string;
  description?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const mobile = useIsMobile();
  return (
    <motion.div
      ref={ref}
      initial={mobile ? false : { opacity: 0, y: 30 }}
      animate={isInView || mobile ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: mobile ? 0.2 : 0.7 }}
      className="text-center mb-12 md:mb-16"
    >
      <span className="text-sm tracking-[0.3em] uppercase text-gold font-medium">
        {subtitle}
      </span>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-3 mb-4 text-white">
        {title}
      </h2>
      {description && (
        <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          {description}
        </p>
      )}
      <div className="mt-6 mx-auto w-24 h-[2px] bg-gradient-to-r from-transparent via-pink to-transparent" />
    </motion.div>
  );
}

/* ─────────── Search Overlay ─────────── */

function SearchOverlay({
  open,
  onOpenChange,
  products,
  onProductClick,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  products: ProductType[];
  onProductClick: (p: ProductType) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setQuery("");
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const results =
    query.trim().length > 0
      ? products.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase()),
        )
      : [];

  const handleSelect = (product: ProductType) => {
    onOpenChange(false);
    onProductClick(product);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-luxury-dark border-luxury-border max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="sr-only">Search products</DialogTitle>
          <div className="flex items-center gap-3 p-4 border-b border-luxury-border">
            <Search className="w-5 h-5 text-gold flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-white text-lg outline-none placeholder:text-white/30"
              onKeyDown={(e) => {
                if (e.key === "Escape") onOpenChange(false);
              }}
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white/60 hover:text-white h-8 w-8"
                onClick={() => setQuery("")}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto">
          {query.trim().length > 0 && results.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-10 h-10 text-luxury-border mx-auto mb-3" />
              <p className="text-muted-foreground">
                No results found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Try searching for a different product name
              </p>
            </div>
          )}
          {results.map((product) => (
            <button
              key={product.id}
              onClick={() => handleSelect(product)}
              className="w-full flex items-center gap-4 p-4 hover:bg-luxury-gray/50 transition-colors border-b border-luxury-border/50 last:border-0 text-left"
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-luxury-gray">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {product.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {product.category}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-gold font-bold text-sm">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through ml-1">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-luxury-border flex-shrink-0" />
            </button>
          ))}
          {query.trim().length === 0 && (
            <div className="p-8 text-center">
              <p className="text-muted-foreground text-sm">
                Start typing to search products...
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {["Bundles", "Frontals", "Closures", "Wigs"].map((cat) => (
                  <Badge
                    key={cat}
                    variant="outline"
                    className="border-luxury-border text-muted-foreground cursor-default"
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────── Wishlist Drawer ─────────── */

function WishlistDrawer({
  open,
  onOpenChange,
  wishlistIds,
  products,
  onRemoveFromWishlist,
  onAddToCart,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  wishlistIds: string[];
  products: ProductType[];
  onRemoveFromWishlist: (id: string) => void;
  onAddToCart: (p: ProductType) => void;
}) {
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-luxury-dark border-luxury-border text-white">
        <div className="flex flex-col h-full">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink" />
              Wishlist
              {wishlistProducts.length > 0 && (
                <Badge className="bg-pink text-white border-0 text-xs">
                  {wishlistProducts.length} items
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>
          {wishlistProducts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Heart className="w-16 h-16 text-luxury-border mb-4" />
              <p className="text-muted-foreground mb-2">
                Your wishlist is empty
              </p>
              <p className="text-xs text-muted-foreground/60">
                Save your favorite items for later
              </p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-4 -mx-6 px-6 py-4">
                {wishlistProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex gap-4 p-3 bg-luxury-gray/50 rounded-xl border border-luxury-border"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {product.name}
                      </h4>
                      <p className="text-gold text-sm font-bold mt-1">
                        ${product.price}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            onAddToCart(product);
                            toast.success(`${product.name} added to cart!`);
                          }}
                          className="gold-gradient text-luxury-black font-semibold text-xs rounded-full px-3 py-1 hover:opacity-90"
                        >
                          Add to Cart
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemoveFromWishlist(product.id)}
                          className="text-muted-foreground hover:text-pink text-xs px-2"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-luxury-border pt-4">
                <Button
                  variant="link"
                  className="w-full text-muted-foreground text-sm hover:text-gold"
                  onClick={() => onOpenChange(false)}
                >
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ─────────── Navbar ─────────── */

function Navbar({
  cartCount,
  onCartOpen,
  onSearchOpen,
  wishlistCount,
  onWishlistOpen,
  promoCode,
  onNavigate,
}: {
  cartCount: number;
  onCartOpen: () => void;
  onSearchOpen: () => void;
  wishlistCount: number;
  onWishlistOpen: () => void;
  promoCode: string;
  onNavigate: (href: string) => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = useCallback(
    (href: string) => {
      setMobileOpen(false);
      if (href.startsWith("/")) {
        onNavigate(href);
      } else {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    },
    [onNavigate],
  );

  return (
    <>
      <div className="bg-gradient-to-r from-pink-dark via-pink to-pink-dark text-white text-center py-2 px-4 text-xs md:text-sm font-semibold tracking-wide">
        <div className="flex items-center justify-center gap-2">
          <Crown className="w-3.5 h-3.5" />
          <span>
            FREE SHIPPING on orders over $200 | Use code {promoCode} for 20% off
          </span>
          <Crown className="w-3.5 h-3.5" />
        </div>
      </div>
      <nav
        className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? "bg-luxury-black shadow-lg shadow-black/30 border-b border-luxury-border" : "bg-luxury-black/80 backdrop-blur-md border-b border-white/5"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="text-white hover:text-gold"
              >
                {mobileOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full gold-gradient flex items-center justify-center">
                <Crown className="w-4 h-4 md:w-5 md:h-5 text-luxury-black" />
              </div>
              <h1
                className="text-xl md:text-2xl font-bold text-white tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                LACELLE <span className="pink-shimmer">HAIR</span>
              </h1>
            </a>
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className="text-sm text-white/80 hover:text-pink transition-colors duration-300 tracking-wide uppercase relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-pink to-gold transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-gold transition-colors"
                onClick={onSearchOpen}
              >
                <Search className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-pink transition-colors relative hidden sm:flex"
                onClick={onWishlistOpen}
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink text-white text-[10px] font-bold flex items-center justify-center pink-glow">
                    {wishlistCount}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-gold transition-colors relative"
                onClick={onCartOpen}
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span
                    suppressHydrationWarning
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink text-white text-[10px] font-bold flex items-center justify-center pink-glow"
                  >
                    {cartCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-luxury-dark border-t border-luxury-border overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                    className="block py-3 px-4 text-white/80 hover:text-gold hover:bg-luxury-gray/50 rounded-lg transition-all text-sm uppercase tracking-wider"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex items-center gap-3 pt-2 border-t border-luxury-border mt-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/80 hover:text-gold"
                    onClick={() => {
                      onSearchOpen();
                      setMobileOpen(false);
                    }}
                  >
                    <Search className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/80 hover:text-pink relative"
                    onClick={() => {
                      onWishlistOpen();
                      setMobileOpen(false);
                    }}
                  >
                    <Heart className="w-5 h-5" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink text-white text-[10px] font-bold flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

/* ─────────── Hero Section ─────────── */

function HeroSection() {
  const mobile = useIsMobile();
  const slides = [
    {
      image: "/images/hero.jpg",
      headline: "Unleash Your",
      highlight: "Inner Royalty",
      subtext:
        "Premium Raw Indian Hair Extensions — Sourced for Excellence, Crafted for Perfection",
      cta: "Shop Collection",
      ctaLink: "/shop",
    },
  ];
  const d = mobile ? 0 : 0.2;
  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0">
          <img
            src={slides[0].image}
            alt="Luxury Hair"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-luxury-black via-luxury-black/80 to-luxury-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-luxury-black/40" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-pink/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gold/10 rounded-full blur-[80px]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={mobile ? false : { opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: mobile ? 0.1 : 0.8, delay: d }}
          className="max-w-2xl"
        >
          <motion.div
            initial={mobile ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: d + (mobile ? 0 : 0.2) }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6"
          >
            <Gem className="w-4 h-4 text-gold" />
            <span className="text-xs sm:text-sm text-white/90 tracking-wide">
              Premium Quality Since 2020
            </span>
          </motion.div>
          <motion.h1
            initial={mobile ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: d + (mobile ? 0 : 0.4),
              duration: mobile ? 0.1 : 0.6,
            }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {slides[0].headline}
            <br />
            <span className="gold-shimmer">{slides[0].highlight}</span>
          </motion.h1>
          <motion.p
            initial={mobile ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: d + (mobile ? 0 : 0.6) }}
            className="text-base sm:text-lg text-white/70 mb-8 max-w-lg leading-relaxed"
          >
            {slides[0].subtext}
          </motion.p>
          <motion.div
            initial={mobile ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: d + (mobile ? 0 : 0.8) }}
            className="flex flex-wrap gap-4"
          >
            <a href={slides[0].ctaLink}>
              <Button
                size="lg"
                className="gold-gradient text-luxury-black font-semibold px-8 py-6 text-sm sm:text-base rounded-full hover:opacity-90 transition-all shadow-lg shadow-gold/20 hover:shadow-gold/40"
              >
                {slides[0].cta}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
            <a
              href="#categories"
              onClick={(e) => {
                e.preventDefault();
                document
                  .querySelector("#categories")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Button
                size="lg"
                variant="outline"
                className="border-pink/40 text-pink-light hover:bg-pink/10 hover:border-pink px-8 py-6 text-sm sm:text-base rounded-full transition-all"
              >
                Browse Collections
              </Button>
            </a>
          </motion.div>
          <motion.div
            initial={mobile ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: d + (mobile ? 0 : 1) }}
            className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/10"
          >
            {[
              { value: "10K+", label: "Happy Customers" },
              { value: "100%", label: "Raw Virgin Hair" },
              { value: "4.9", label: "Average Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl sm:text-3xl font-bold text-gold">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-white/50 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
      <motion.div
        initial={mobile ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: d + (mobile ? 0 : 1.2) }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/40 text-xs tracking-widest uppercase">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-5 h-5 text-gold" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─────────── Stock Badge ─────────── */

function StockBadge({
  stock,
  lowThreshold,
}: {
  stock: number;
  lowThreshold: number;
}) {
  if (stock <= 0)
    return (
      <Badge className="bg-red-600 text-white text-[10px] px-2 py-0.5 border-0">
        Out of Stock
      </Badge>
    );
  if (stock <= lowThreshold)
    return (
      <Badge className="bg-orange-500 text-white text-[10px] px-2 py-0.5 border-0">
        Low Stock ({stock})
      </Badge>
    );
  return null;
}

/* ─────────── Product Card ─────────── */

function ProductCard({
  product,
  onAddToCart,
  onClick,
  isWishlisted,
  onToggleWishlist,
}: {
  product: ProductType;
  onAddToCart: (p: ProductType) => void;
  onClick: (p: ProductType) => void;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const mobile = useIsMobile();

  return (
    <motion.div
      ref={ref}
      initial={mobile ? false : { opacity: 0, y: 30 }}
      animate={isInView || mobile ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: mobile ? 0.1 : 0.5 }}
      className="group"
    >
      <div
        className="relative bg-luxury-dark rounded-2xl overflow-hidden border border-luxury-border hover:border-pink/30 transition-all duration-500 hover:shadow-xl hover:shadow-pink/5 cursor-pointer"
        onClick={() => onClick(product)}
      >
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 sm:group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-luxury-black/0 sm:group-hover:bg-luxury-black/20 transition-colors duration-500 bg-gradient-to-t from-luxury-black/40 via-transparent to-transparent sm:from-transparent" />
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Badge className="bg-gold text-luxury-black text-[10px] font-bold px-2.5 py-1 border-0">
              {product.badge}
            </Badge>
            <StockBadge
              stock={product.stock}
              lowThreshold={product.lowStockThreshold}
            />
          </div>
          <div className="absolute top-3 right-3 flex flex-col gap-2 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-2 sm:group-hover:translate-x-0 transition-all duration-300 opacity-100 translate-x-0">
            <Button
              size="icon"
              variant="secondary"
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border-white/20 hover:bg-pink hover:border-pink text-white hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product.id);
              }}
            >
              <Heart
                className={`w-4 h-4 ${isWishlisted ? "fill-pink text-pink" : ""}`}
              />
            </Button>
          </div>
          <div className="absolute bottom-3 left-3 right-3 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-2 sm:group-hover:translate-y-0 transition-all duration-300 opacity-100 translate-y-0">
            {product.variants && product.variants.length > 0 ? (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(product);
                }}
                className="w-full pink-gradient text-white font-semibold rounded-full py-4 sm:py-5 text-sm shadow-lg shadow-pink/20 hover:opacity-90"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Select Options
              </Button>
            ) : (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                className="w-full gold-gradient text-luxury-black font-semibold rounded-full py-4 sm:py-5 text-sm shadow-lg shadow-gold/20 hover:opacity-90"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Quick Add
              </Button>
            )}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.floor(product.rating) ? "text-gold fill-gold" : "text-luxury-border"}`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">
              ({product.reviewCount})
            </span>
          </div>
          <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-gold transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            {product.variants && product.variants.length > 0 ? (
              (() => {
                const prices = product.variants.map((v) => v.price);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                return minPrice !== maxPrice ? (
                  <>
                    <span className="text-lg font-bold text-gold">
                      ${minPrice} - ${maxPrice}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-lg font-bold text-gold">
                      ${minPrice}
                    </span>
                    {product.variants[0]?.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${product.variants[0].originalPrice}
                      </span>
                    )}
                  </>
                );
              })()
            ) : (
              <>
                <span className="text-lg font-bold text-gold">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </>
            )}
          </div>
          {product.variants && product.variants.length > 0 && (
            <p className="text-[10px] text-pink mt-1">
              {product.variants.length} length/color option
              {product.variants.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────── Products Section ─────────── */

function ProductsSection({
  products,
  onAddToCart,
  onProductClick,
  initialFilter,
  wishlistIds,
  onToggleWishlist,
}: {
  products: ProductType[];
  onAddToCart: (p: ProductType) => void;
  onProductClick: (p: ProductType) => void;
  initialFilter: string | null;
  wishlistIds: string[];
  onToggleWishlist: (id: string) => void;
}) {
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["All", "Bundles", "Frontals", "Closures", "Wigs"];
  const sectionRef = useRef<HTMLDivElement>(null);

  // Sync with initialFilter from parent
  useEffect(() => {
    if (initialFilter) {
      const timer = setTimeout(() => {
        setActiveFilter(initialFilter);
        sectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialFilter]);

  const filtered =
    activeFilter === "All"
      ? products
      : products.filter((p) => p.category === activeFilter);

  return (
    <section
      id="products"
      ref={sectionRef}
      className="py-20 md:py-28 luxury-gradient scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          subtitle="Our Collection"
          title="Featured Products"
          description="Each bundle is hand-selected and quality-tested to ensure you receive only the finest premium hair extensions"
        />
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {filters.map((f) => (
            <Button
              key={f}
              variant={activeFilter === f ? "default" : "outline"}
              onClick={() => setActiveFilter(f)}
              className={`rounded-full px-6 text-sm transition-all ${activeFilter === f ? "gold-gradient text-luxury-black border-0 shadow-lg shadow-gold/20" : "border-luxury-border text-white/70 hover:border-gold hover:text-gold"}`}
            >
              {f}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onClick={onProductClick}
              isWishlisted={wishlistIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
        <div className="text-center mt-12">
          <a href="/shop">
            <Button
              variant="outline"
              className="border-gold/50 text-gold hover:bg-gold hover:text-luxury-black rounded-full px-10 py-6 text-sm transition-all"
            >
              View All Products
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─────────── About Section ─────────── */

function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const mobile = useIsMobile();
  return (
    <section
      id="about"
      className="py-20 md:py-28 bg-luxury-black relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink/8 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink/5 rounded-full blur-[120px]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeading
          subtitle="Our Promise"
          title="Why Choose LACELLE HAIR"
          description="We believe every woman deserves to feel confident and beautiful. Our mission is to provide the highest quality hair at accessible prices"
        />
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {TRUST_ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={mobile ? false : { opacity: 0, y: 30 }}
              animate={isInView || mobile ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: mobile ? 0.15 : 0.5,
                delay: mobile ? 0 : i * 0.1,
              }}
              className={`group p-6 md:p-8 rounded-2xl border border-luxury-border bg-luxury-dark/50 hover:bg-luxury-dark transition-all duration-500 hover:shadow-lg ${i % 2 === 0 ? "hover:border-pink/30 hover:shadow-pink/5" : "hover:border-gold/30 hover:shadow-gold/5"}`}
            >
              <div
                className={`w-14 h-14 rounded-xl ${i % 2 === 0 ? "pink-gradient" : "gold-gradient"} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <h3
                className="text-lg font-bold text-white mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={mobile ? false : { opacity: 0, y: 30 }}
          animate={isInView || mobile ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: mobile ? 0.15 : 0.6,
            delay: mobile ? 0 : 0.5,
          }}
          className="mt-16 p-8 md:p-12 rounded-2xl border border-luxury-border bg-gradient-to-r from-luxury-dark via-luxury-gray/30 to-luxury-dark relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink/5 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-[80px]" />
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h3
                className="text-2xl md:text-3xl font-bold text-white mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Grade 12A Premium Virgin Hair
              </h3>
              <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-lg">
                Our hair is ethically sourced, double-drawn, and features intact
                cuticles for tangle-free, long-lasting wear. Each batch
                undergoes rigorous quality inspection before reaching your
                hands.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { icon: "✨", label: "Double Drawn" },
                { icon: "🌿", label: "Ethically Sourced" },
                { icon: "💎", label: "Cuticle Aligned" },
                { icon: "🔥", label: "Heat Resistant" },
              ].map((f) => (
                <div key={f.label} className="text-center">
                  <div className="text-3xl mb-2">{f.icon}</div>
                  <div className="text-xs text-white/70">{f.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────── Testimonials Section ─────────── */

function TestimonialsSection({ onWriteReview }: { onWriteReview: () => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const mobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length),
      5000,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="testimonials"
      className="py-20 md:py-28 luxury-gradient relative"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/50 via-transparent to-luxury-black/50" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeading
          subtitle="Testimonials"
          title="What Our Queens Say"
          description="Don't just take our word for it — hear from our amazing customers who have transformed their look with LACELLE HAIR"
        />
        <div ref={ref} className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={mobile ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={mobile ? {} : { opacity: 0, y: -20 }}
              transition={{ duration: mobile ? 0.15 : 0.5 }}
              className="bg-luxury-dark border border-luxury-border rounded-2xl p-6 sm:p-8 md:p-12 text-center relative"
            >
              <div className="absolute top-4 left-6 text-gold/20 text-7xl font-serif leading-none">
                &ldquo;
              </div>
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: TESTIMONIALS[activeIndex].rating }).map(
                  (_, i) => (
                    <Star key={i} className="w-5 h-5 text-gold fill-gold" />
                  ),
                )}
              </div>
              <p className="text-white/80 text-base md:text-lg leading-relaxed mb-8 italic max-w-2xl mx-auto">
                &ldquo;{TESTIMONIALS[activeIndex].text}&rdquo;
              </p>
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold to-pink flex items-center justify-center text-luxury-black font-bold text-lg">
                  {TESTIMONIALS[activeIndex].avatar}
                </div>
                <div>
                  <p className="text-white font-semibold">
                    {TESTIMONIALS[activeIndex].name}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {TESTIMONIALS[activeIndex].location}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-gold/30 text-gold text-xs"
                >
                  Purchased: {TESTIMONIALS[activeIndex].product}
                </Badge>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === activeIndex ? "bg-pink w-8" : "bg-luxury-border hover:bg-pink/50"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── Customer Reviews Section ─────────── */

function StarRating({
  rating,
  interactive,
  onChange,
}: {
  rating: number;
  interactive?: boolean;
  onChange?: (r: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(i + 1)}
          className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
        >
          <Star
            className={`w-5 h-5 ${i < rating ? "text-gold fill-gold" : "text-luxury-border"}`}
          />
        </button>
      ))}
    </div>
  );
}

function CustomerReviewsSection({
  products,
  onWriteReview,
}: {
  products: ProductType[];
  onWriteReview: (productId?: string) => void;
}) {
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const mobile = useIsMobile();

  useEffect(() => {
    fetch("/api/reviews?limit=10")
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-luxury-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            subtitle="Reviews"
            title="Customer Reviews"
            description="Real reviews from our amazing customers"
          />
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <section className="py-16 bg-luxury-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          subtitle="Reviews"
          title="Customer Reviews"
          description="Real reviews from our amazing customers"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={mobile ? false : { opacity: 0, y: 20 }}
              whileInView={mobile ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-luxury-dark border border-luxury-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-pink flex items-center justify-center text-luxury-black font-bold text-sm">
                    {review.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {review.author}
                    </p>
                    {review.product && (
                      <p className="text-muted-foreground text-xs">
                        {review.product.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <StarRating rating={review.rating} />
              {review.title && (
                <h4 className="text-white font-medium text-sm mt-3">
                  {review.title}
                </h4>
              )}
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                {review.text}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-3">
                {new Date(review.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button
            onClick={() => onWriteReview()}
            className="gold-gradient text-luxury-black font-semibold rounded-full px-8 py-3 text-sm hover:opacity-90 transition-all"
          >
            <Send className="w-4 h-4 mr-2" />
            Write a Review
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ─────────── Write Review Dialog ─────────── */

function WriteReviewDialog({
  open,
  onOpenChange,
  products,
  preselectedProductId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  products: ProductType[];
  preselectedProductId?: string;
}) {
  const [form, setForm] = useState({
    productId: "",
    author: "",
    email: "",
    rating: 0,
    title: "",
    text: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const prevOpenRef = useRef(open);

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      const timer = setTimeout(
        () =>
          setForm({
            productId: preselectedProductId || products[0]?.id || "",
            author: "",
            email: "",
            rating: 0,
            title: "",
            text: "",
          }),
        0,
      );
      prevOpenRef.current = open;
      return () => clearTimeout(timer);
    }
    prevOpenRef.current = open;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.rating === 0 || !form.author || !form.text || !form.productId) {
      toast.error("Please fill all required fields and select a rating");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(
          "Thank you! Your review has been submitted for approval.",
        );
        onOpenChange(false);
      } else {
        toast.error("Failed to submit review");
      }
    } catch {
      toast.error("Network error");
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-luxury-dark border-luxury-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-gold" />
            Write a Review
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Share your experience with our products
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-sm text-white/80 mb-1 block">
              Product *
            </label>
            <Select
              value={form.productId}
              onValueChange={(v) => setForm((f) => ({ ...f, productId: v }))}
            >
              <SelectTrigger className="bg-luxury-gray border-luxury-border text-white">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent className="bg-luxury-dark border-luxury-border">
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-white">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm text-white/80 mb-1 block">Name *</label>
              <Input
                value={form.author}
                onChange={(e) =>
                  setForm((f) => ({ ...f, author: e.target.value }))
                }
                className="bg-luxury-gray border-luxury-border text-white"
                required
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-white/80 mb-1 block">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className="bg-luxury-gray border-luxury-border text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-white/80 mb-1 block">Rating *</label>
            <StarRating
              rating={form.rating}
              interactive
              onChange={(r) => setForm((f) => ({ ...f, rating: r }))}
            />
          </div>
          <div>
            <label className="text-sm text-white/80 mb-1 block">
              Review Title
            </label>
            <Input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              className="bg-luxury-gray border-luxury-border text-white"
              placeholder="Summarize your experience"
            />
          </div>
          <div>
            <label className="text-sm text-white/80 mb-1 block">Review *</label>
            <Textarea
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
              className="bg-luxury-gray border-luxury-border text-white min-h-[100px]"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full gold-gradient text-luxury-black font-semibold py-3 rounded-full hover:opacity-90"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────── Product Detail Modal ─────────── */

function ProductDetailModal({
  product,
  open,
  onOpenChange,
  onAddToCart,
  onWriteReview,
  isWishlisted,
  onToggleWishlist,
}: {
  product: ProductType | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAddToCart: (p: ProductType, v?: VariantType, qty?: number) => void;
  onWriteReview: (productId: string) => void;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<VariantType | null>(
    null,
  );
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const prevOpenRef = useRef(open);

  const hasVariants = product?.variants && product.variants.length > 0;

  useEffect(() => {
    if (open && !prevOpenRef.current && product) {
      const timer = setTimeout(() => {
        setQuantity(1);
        setSelectedVariant(null);
      }, 0);
      fetch(`/api/reviews?productId=${product.id}&limit=5`)
        .then((r) => r.json())
        .then((d) => setReviews(d.reviews || []))
        .catch(() => {});
      prevOpenRef.current = open;
      return () => clearTimeout(timer);
    }
    prevOpenRef.current = open;
  });

  if (!product) return null;

  // Determine current price based on variant selection
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  const stockStatus =
    currentStock <= 0
      ? "Out of Stock"
      : currentStock <= product.lowStockThreshold
        ? `Low Stock (${currentStock} left)`
        : "In Stock";
  const stockColor =
    currentStock <= 0
      ? "text-red-400"
      : currentStock <= product.lowStockThreshold
        ? "text-orange-400"
        : "text-green-400";

  // Get unique lengths and colors from variants
  const variantLengths = hasVariants
    ? [...new Set(product!.variants!.map((v) => v.length).filter(Boolean))]
    : product.lengths;
  const variantColors = hasVariants
    ? [...new Set(product!.variants!.map((v) => v.color).filter(Boolean))]
    : product.colors;

  // Filter variants by selected length and color
  const selectedLength = selectedVariant?.length || "";
  const selectedColor = selectedVariant?.color || "";

  const handleVariantSelect = (v: VariantType) => {
    setSelectedVariant(v);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (hasVariants && !selectedVariant) {
      toast.error("Please select a length/color option");
      return;
    }
    onAddToCart(product, selectedVariant || undefined, quantity);
    onOpenChange(false);
  };

  // Price display for range
  const priceDisplay = (() => {
    if (!hasVariants) return null;
    const prices = product.variants!.map((v) => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return { min, max, isRange: min !== max };
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-luxury-dark border-luxury-border max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <Badge className="absolute top-3 left-3 bg-gold text-luxury-black text-xs font-bold border-0">
                {product.badge}
              </Badge>
            )}
          </div>
          {/* Details */}
          <div className="flex flex-col">
            <DialogHeader className="mb-4">
              <DialogTitle
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {product.name}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {product.category}
              </DialogDescription>
            </DialogHeader>
            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={Math.round(product.rating)} />
              <span className="text-sm text-muted-foreground">
                ({product.reviewCount} reviews)
              </span>
            </div>
            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              {selectedVariant ? (
                <>
                  <span className="text-3xl font-bold text-gold">
                    ${selectedVariant.price}
                  </span>
                  {selectedVariant.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      ${selectedVariant.originalPrice}
                    </span>
                  )}
                  {selectedVariant.originalPrice && (
                    <Badge className="bg-pink text-white text-xs border-0">
                      -
                      {Math.round(
                        (1 -
                          selectedVariant.price /
                            selectedVariant.originalPrice) *
                          100,
                      )}
                      %
                    </Badge>
                  )}
                </>
              ) : hasVariants ? (
                <>
                  <span className="text-3xl font-bold text-gold">
                    ${priceDisplay!.min}
                    {priceDisplay!.isRange ? ` - $${priceDisplay!.max}` : ""}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold text-gold">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                  {product.originalPrice && (
                    <Badge className="bg-pink text-white text-xs border-0">
                      -
                      {Math.round(
                        (1 - product.price / product.originalPrice) * 100,
                      )}
                      %
                    </Badge>
                  )}
                </>
              )}
            </div>
            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className={`text-sm font-medium ${stockColor}`}>
                {stockStatus}
              </span>
            </div>

            {/* Variant Selection - when product has variants */}
            {hasVariants ? (
              <div className="space-y-4 mb-6">
                {/* Length selector */}
                {variantLengths.length > 0 && (
                  <div>
                    <label className="text-sm text-white/80 mb-2 block">
                      Length{" "}
                      {selectedLength && (
                        <span className="text-gold text-xs ml-1">
                          ({selectedLength})
                        </span>
                      )}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {variantLengths.map((l) => {
                        const isSelected = selectedVariant?.length === l;
                        const hasOptions = product!.variants!.some(
                          (v) =>
                            v.length === l &&
                            (!selectedColor || v.color === selectedColor),
                        );
                        return (
                          <button
                            key={l}
                            onClick={() => {
                              // Find best matching variant
                              const match = product!.variants!.find(
                                (v) =>
                                  v.length === l &&
                                  (!selectedColor || v.color === selectedColor),
                              );
                              if (match) handleVariantSelect(match);
                            }}
                            disabled={!hasOptions}
                            className={`px-3 py-1.5 rounded-full text-xs border transition-all ${isSelected ? "bg-gold text-luxury-black border-gold" : hasOptions ? "border-luxury-border text-white/70 hover:border-gold hover:text-gold" : "border-luxury-border/30 text-white/30 cursor-not-allowed"}`}
                          >
                            {l}
                            {(() => {
                              const matchingVariants =
                                product!.variants!.filter(
                                  (v) => v.length === l,
                                );
                              const prices = matchingVariants.map(
                                (v) => v.price,
                              );
                              const min = Math.min(...prices);
                              const max = Math.max(...prices);
                              return min !== max
                                ? ` ($${min}-${max})`
                                : ` ($${min})`;
                            })()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* Color selector */}
                {variantColors.length > 0 && (
                  <div>
                    <label className="text-sm text-white/80 mb-2 block">
                      Color{" "}
                      {selectedColor && (
                        <span className="text-pink text-xs ml-1">
                          ({selectedColor})
                        </span>
                      )}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {variantColors.map((c) => {
                        const isSelected = selectedVariant?.color === c;
                        const hasOptions = product!.variants!.some(
                          (v) =>
                            v.color === c &&
                            (!selectedLength || v.length === selectedLength),
                        );
                        return (
                          <button
                            key={c}
                            onClick={() => {
                              const match = product!.variants!.find(
                                (v) =>
                                  v.color === c &&
                                  (!selectedLength ||
                                    v.length === selectedLength),
                              );
                              if (match) handleVariantSelect(match);
                            }}
                            disabled={!hasOptions}
                            className={`px-3 py-1.5 rounded-full text-xs border transition-all ${isSelected ? "bg-pink text-white border-pink" : hasOptions ? "border-luxury-border text-white/70 hover:border-pink hover:text-pink" : "border-luxury-border/30 text-white/30 cursor-not-allowed"}`}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* Selected variant info */}
                {selectedVariant && (
                  <div className="bg-gold/10 border border-gold/20 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {selectedVariant.length && (
                          <Badge
                            variant="outline"
                            className="text-xs border-gold/30 text-gold"
                          >
                            {selectedVariant.length}
                          </Badge>
                        )}
                        {selectedVariant.color && (
                          <Badge
                            variant="outline"
                            className="text-xs border-pink/30 text-pink"
                          >
                            {selectedVariant.color}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-gold font-bold">
                          ${selectedVariant.price}
                        </span>
                        {selectedVariant.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through ml-1">
                            ${selectedVariant.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-xs ${selectedVariant.stock <= 5 ? "text-orange-400" : "text-green-400"}`}
                      >
                        {selectedVariant.stock <= 0
                          ? "Out of stock"
                          : `${selectedVariant.stock} in stock`}
                      </span>
                      {selectedVariant.sku && (
                        <span className="text-xs text-muted-foreground">
                          | SKU: {selectedVariant.sku}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Fallback: original lengths/colors (no variants) */}
                {product.lengths.length > 0 && (
                  <div className="mb-4">
                    <label className="text-sm text-white/80 mb-2 block">
                      Length
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.lengths.map((l) => (
                        <button
                          key={l}
                          className={`px-3 py-1.5 rounded-full text-xs border border-luxury-border text-white/70 hover:border-gold hover:text-gold transition-all`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {product.colors.length > 0 && (
                  <div className="mb-6">
                    <label className="text-sm text-white/80 mb-2 block">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((c) => (
                        <button
                          key={c}
                          className={`px-3 py-1.5 rounded-full text-xs border border-luxury-border text-white/70 hover:border-gold hover:text-gold transition-all`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            {/* Quantity */}
            <div className="flex items-center gap-3 mb-6">
              <label className="text-sm text-white/80">Quantity:</label>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="w-8 h-8 border-luxury-border text-white"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-8 text-center text-white font-medium">
                  {quantity}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  className="w-8 h-8 border-luxury-border text-white"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              disabled={currentStock <= 0}
              className={`w-full font-semibold py-6 rounded-full text-sm transition-all ${currentStock <= 0 ? "bg-luxury-gray text-muted-foreground cursor-not-allowed" : "gold-gradient text-luxury-black hover:opacity-90 shadow-lg shadow-gold/20"}`}
            >
              {currentStock <= 0 ? (
                "Out of Stock"
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Add to Cart — ${(currentPrice * quantity).toFixed(2)}
                </>
              )}
            </Button>
            {/* Wishlist + Review buttons */}
            <div className="flex gap-3 mt-3">
              <Button
                variant="outline"
                onClick={() => onToggleWishlist(product.id)}
                className={`flex-1 border-luxury-border rounded-full py-3 text-sm transition-all ${isWishlisted ? "border-pink text-pink hover:bg-pink/10" : "text-white/70 hover:text-gold hover:border-gold"}`}
              >
                <Heart
                  className={`w-4 h-4 mr-2 ${isWishlisted ? "fill-pink" : ""}`}
                />
                {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  onWriteReview(product.id);
                }}
                className="flex-1 border-luxury-border text-white/70 hover:text-gold hover:border-gold rounded-full py-3 text-sm"
              >
                <Send className="w-4 h-4 mr-2" />
                Review
              </Button>
            </div>
          </div>
        </div>
        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mt-8 pt-6 border-t border-luxury-border">
            <h3 className="text-lg font-bold text-white mb-4">
              Customer Reviews ({reviews.length})
            </h3>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-luxury-gray/50 rounded-xl p-4 border border-luxury-border"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-pink flex items-center justify-center text-luxury-black font-bold text-xs">
                      {review.author.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-white">
                      {review.author}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <StarRating rating={review.rating} />
                  {review.title && (
                    <p className="text-white text-sm font-medium mt-2">
                      {review.title}
                    </p>
                  )}
                  <p className="text-muted-foreground text-sm mt-1">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ─────────── Newsletter ─────────── */

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const mobile = useIsMobile();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success(
        "Welcome to the LACELLE HAIR family! Check your inbox for a special surprise.",
      );
      setEmail("");
    }
  };
  return (
    <section className="py-20 md:py-24 bg-luxury-black relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink/10 rounded-full blur-[200px]" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[150px]" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <motion.div
          initial={mobile ? false : { opacity: 0, y: 30 }}
          whileInView={mobile ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: mobile ? 0.15 : 0.6 }}
        >
          <div className="inline-flex items-center gap-2 text-pink text-sm mb-4">
            <Mail className="w-4 h-4" />
            <span className="tracking-wide uppercase">Join the Club</span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Get <span className="pink-shimmer">15% Off</span> Your First Order
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Subscribe to our newsletter for exclusive deals, early access to new
            arrivals, hair care tips, and VIP-only promotions
          </p>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 bg-luxury-dark border-luxury-border rounded-full px-6 text-white placeholder:text-white/30 focus:border-pink focus:ring-pink/20"
              required
            />
            <Button
              type="submit"
              className="pink-gradient text-white font-semibold h-12 px-8 rounded-full hover:opacity-90 transition-all shadow-lg shadow-pink/20"
            >
              Subscribe
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-4">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────── Contact Form Section ─────────── */

function ContactSection({
  siteEmail,
  sitePhone,
}: {
  siteEmail: string;
  sitePhone: string;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Message sent successfully! We'll get back to you soon.");
        setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <section
      id="contact"
      className="py-20 md:py-28 bg-luxury-black relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-pink/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink/8 rounded-full blur-[120px]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeading
          subtitle="Get In Touch"
          title="Contact Us"
          description="Have a question or need help? We'd love to hear from you. Send us a message and we'll respond as soon as possible."
        />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl border border-luxury-border bg-luxury-dark/50 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl pink-gradient flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Email Us</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    {siteEmail}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-luxury-black" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Call Us</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    {sitePhone}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl pink-gradient flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">
                    Business Hours
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Mon – Fri: 9AM – 6PM EST
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Sat: 10AM – 4PM EST
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-luxury-black" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Location</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Serving customers nationwide
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 rounded-2xl border border-luxury-border bg-gradient-to-r from-luxury-dark via-luxury-gray/30 to-luxury-dark">
              <p className="text-pink font-semibold text-sm mb-2">
                Quick Response Promise
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We aim to respond to all inquiries within 24 hours during
                business days. For urgent matters, please call us directly.
              </p>
            </div>
          </div>
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="p-6 md:p-8 rounded-2xl border border-luxury-border bg-luxury-dark/50 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/80 mb-1.5 block">
                    Name *
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="bg-luxury-gray border-luxury-border text-white"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 mb-1.5 block">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="bg-luxury-gray border-luxury-border text-white"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-white/80 mb-1.5 block">
                    Phone (optional)
                  </label>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    className="bg-luxury-gray border-luxury-border text-white"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 mb-1.5 block">
                    Subject *
                  </label>
                  <Input
                    value={form.subject}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, subject: e.target.value }))
                    }
                    className="bg-luxury-gray border-luxury-border text-white"
                    placeholder="How can we help?"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-white/80 mb-1.5 block">
                  Message *
                </label>
                <Textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  className="bg-luxury-gray border-luxury-border text-white min-h-[140px]"
                  placeholder="Tell us more..."
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full pink-gradient text-white font-semibold py-3 rounded-full hover:opacity-90 transition-all"
              >
                {submitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── Track Order Dialog ─────────── */

function TrackOrderDialog({
  open,
  onOpenChange,
  whatsappNumber,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  whatsappNumber: string;
}) {
  const [form, setForm] = useState({ email: "", orderNumber: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.orderNumber) {
      toast.error("Please enter both email and order number");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.info(
        "Order tracking is currently available via WhatsApp. You will be redirected shortly.",
      );
      setSubmitting(false);
      onOpenChange(false);
      setTimeout(() => {
        const msg = encodeURIComponent(
          `Hi, I'd like to track my order.\n\nOrder Number: ${form.orderNumber}\nEmail: ${form.email}`,
        );
        window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, "_blank");
      }, 1000);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-luxury-dark border-luxury-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-gold" />
            Track Your Order
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your order details to get tracking information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-sm text-white/80 mb-1 block">Email *</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              className="bg-luxury-gray border-luxury-border text-white"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="text-sm text-white/80 mb-1 block">
              Order Number *
            </label>
            <Input
              value={form.orderNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, orderNumber: e.target.value }))
              }
              className="bg-luxury-gray border-luxury-border text-white"
              placeholder="e.g. LAC-12345"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full gold-gradient text-luxury-black font-semibold py-3 rounded-full hover:opacity-90"
          >
            {submitting ? "Looking up..." : "Track Order"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────── Legal Dialog ─────────── */

function LegalDialog({
  open,
  onOpenChange,
  title,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
}) {
  const contentMap: Record<string, string> = {
    "Privacy Policy":
      "LACELLE HAIR Privacy Policy\n\nLast updated: January 2025\n\nAt LACELLE HAIR, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.\n\nInformation We Collect:\n• Name and contact information when you place an order\n• Shipping and billing addresses\n• Email address for order updates and newsletters\n• Payment information (processed securely by our payment provider)\n• Browsing behavior on our website\n\nHow We Use Your Information:\n• Process and fulfill your orders\n• Send order confirmations and shipping updates\n• Improve our products and services\n• Send promotional emails (with your consent)\n• Provide customer support\n\nData Protection:\nWe use industry-standard encryption to protect your personal data. We never sell your personal information to third parties.\n\nYour Rights:\nYou have the right to access, correct, or delete your personal data at any time by contacting us at hello@lacellehair.com.\n\nContact:\nFor privacy-related questions, email us at privacy@lacellehair.com.",
    "Terms of Service":
      "LACELLE HAIR Terms of Service\n\nLast updated: January 2025\n\nBy using our website and purchasing our products, you agree to the following terms.\n\nProducts:\n• All products are described as accurately as possible. Slight variations may occur due to monitor settings and the nature of human hair.\n• Colors shown are representative; actual color may vary slightly.\n• Product images are for illustration purposes.\n\nPricing & Payment:\n• All prices are in USD unless otherwise stated.\n• We reserve the right to change prices at any time without prior notice.\n• Payment must be made in full at the time of purchase.\n\nShipping:\n• Free shipping on orders over $200 within the continental US.\n• Standard shipping takes 3-5 business days.\n• Express shipping options available at checkout.\n• We are not responsible for delays caused by shipping carriers.\n\nReturns & Exchanges:\n• Returns accepted within 30 days of delivery.\n• Products must be in original, unaltered condition.\n• Custom orders and sale items are final sale.\n• Contact us at hello@lacellehair.com to initiate a return.\n\nLimitation of Liability:\nLACELLE HAIR is not liable for any damages resulting from the use of our products. Our liability is limited to the purchase price of the product.",
    "Cookie Policy":
      "LACELLE HAIR Cookie Policy\n\nLast updated: January 2025\n\nThis policy explains how we use cookies on our website.\n\nWhat Are Cookies?\nCookies are small text files stored on your device when you visit our website.\n\nTypes of Cookies We Use:\n\nEssential Cookies:\nRequired for basic website functionality like shopping cart, checkout, and user sessions.\n\nAnalytics Cookies:\nHelp us understand how visitors interact with our website so we can improve the experience.\n\nMarketing Cookies:\nUsed to track visitors across websites to display relevant advertisements.\n\nManaging Cookies:\nYou can control or delete cookies through your browser settings. Note that disabling cookies may affect some website functionality.\n\nThird-Party Cookies:\nWe may use third-party services (analytics, payment processors) that set their own cookies.\n\nChanges:\nWe may update this policy from time to time. Changes will be posted on this page with an updated date.\n\nContact:\nFor cookie-related questions, email privacy@lacellehair.com.",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-luxury-dark border-luxury-border max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
          {contentMap[title] || "Content coming soon."}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────── Footer ─────────── */

function Footer({
  onShopLinkClick,
  onHelpLinkClick,
  onLegalClick,
  socialUrls,
  siteEmail,
  sitePhone,
}: {
  onShopLinkClick: (link: string) => void;
  onHelpLinkClick: (link: string) => void;
  onLegalClick: (link: string) => void;
  socialUrls: { instagram: string; facebook: string; tiktok: string };
  siteEmail: string;
  sitePhone: string;
}) {
  const shopLinks = [
    "Bundles",
    "Frontals",
    "Closures",
    "Wigs",
    "Accessories",
    "New Arrivals",
  ];
  const helpLinks = [
    "FAQ",
    "Shipping Info",
    "Returns & Exchanges",
    "Hair Care Guide",
    "Track Order",
    "Contact Us",
  ];

  return (
    <footer className="bg-luxury-dark border-t border-luxury-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center">
                <Crown className="w-4 h-4 text-luxury-black" />
              </div>
              <h3
                className="text-xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                LACELLE <span className="pink-shimmer">HAIR</span>
              </h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Premium hair extensions and wigs sourced from the finest donors
              around the world. Elevate your beauty with confidence.
            </p>
            <div className="flex gap-3">
              <a
                href={socialUrls.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-luxury-border flex items-center justify-center text-white/60 hover:text-pink hover:border-pink/50 hover:bg-pink/10 transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={socialUrls.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-luxury-border flex items-center justify-center text-white/60 hover:text-pink hover:border-pink/50 hover:bg-pink/10 transition-all"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={socialUrls.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-luxury-border flex items-center justify-center text-white/60 hover:text-pink hover:border-pink/50 hover:bg-pink/10 transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Shop
            </h4>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link}>
                  <button
                    onClick={() => onShopLinkClick(link)}
                    className="text-muted-foreground hover:text-pink text-sm transition-colors cursor-pointer"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Help
            </h4>
            <ul className="space-y-3">
              {helpLinks.map((link) => (
                <li key={link}>
                  <button
                    onClick={() => onHelpLinkClick(link)}
                    className="text-muted-foreground hover:text-pink text-sm transition-colors cursor-pointer"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>{siteEmail}</li>
              <li>{sitePhone}</li>
              <li>Mon - Fri: 9AM - 6PM EST</li>
              <li>Sat: 10AM - 4PM EST</li>
            </ul>
            <div className="mt-6">
              <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
                We Accept
              </h4>
              <div className="flex gap-2">
                {["Visa", "MC", "Amex", "PayPal"].map((method) => (
                  <div
                    key={method}
                    className="px-3 py-1.5 bg-luxury-gray border border-luxury-border rounded text-xs text-white/60"
                  >
                    {method}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Separator className="my-8 bg-luxury-border" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} LACELLE HAIR. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (link) => (
                <button
                  key={link}
                  onClick={() => onLegalClick(link)}
                  className="text-xs text-muted-foreground hover:text-pink transition-colors cursor-pointer"
                >
                  {link}
                </button>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────── WhatsApp Button ─────────── */

function WhatsAppButton({ whatsappNumber }: { whatsappNumber: string }) {
  const [tooltip, setTooltip] = useState(false);
  const mobile = useIsMobile();
  return (
    <div className="fixed bottom-6 left-6 z-40 group">
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute bottom-0 left-16 bg-white text-gray-800 text-sm font-medium px-4 py-2 rounded-lg shadow-lg whitespace-nowrap"
          >
            Chat with us on WhatsApp
            <div className="absolute bottom-3 left-0 w-2 h-2 bg-white transform rotate-45 -translate-x-1" />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        animate={mobile ? {} : { scale: [1, 1.05, 1] }}
        transition={
          mobile ? {} : { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }
        className="flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/40 transition-all ring-2 ring-pink/40 ring-offset-2 ring-offset-luxury-black"
      >
        <MessageCircle className="w-6 h-6" fill="white" />
      </motion.a>
    </div>
  );
}

/* ─────────── Cart Drawer ─────────── */

function CartDrawer({
  open,
  onOpenChange,
  items,
  onUpdateQuantity,
  onRemove,
  whatsappNumber,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  whatsappNumber: string;
}) {
  const total = items.reduce((sum, item) => {
    const price = item.variant ? item.variant.price : item.product.price;
    return sum + price * item.quantity;
  }, 0);
  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = () => {
    if (items.length === 0) return;
    onOpenChange(false);
    window.location.href = "/checkout";
  };

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;
    setCheckingOut(true);
    const lines = items.map((item) => {
      const price = item.variant ? item.variant.price : item.product.price;
      const variantInfo = item.variant
        ? [item.variant.length, item.variant.color].filter(Boolean).join(" / ")
        : "";
      const name = variantInfo
        ? `${item.product.name} (${variantInfo})`
        : item.product.name;
      return `• ${name} x${item.quantity} — $${(price * item.quantity).toFixed(2)}`;
    });
    const message = `Hi! I'd like to place an order:\n\n${lines.join("\n")}\n\nTotal: $${total.toFixed(2)}`;
    const encoded = encodeURIComponent(message);
    toast.success("Redirecting to WhatsApp...");
    setTimeout(() => {
      window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`, "_blank");
      setCheckingOut(false);
    }, 500);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-luxury-dark border-luxury-border text-white">
        <div className="flex flex-col h-full">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gold" />
              Your Cart
              {items.length > 0 && (
                <Badge className="bg-pink text-white border-0 text-xs">
                  {items.length} items
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <ShoppingBag className="w-16 h-16 text-luxury-border mb-4" />
              <p className="text-muted-foreground mb-2">Your cart is empty</p>
              <p className="text-xs text-muted-foreground/60">
                Add some luxurious hair to your cart
              </p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-4 -mx-6 px-6 py-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 bg-luxury-gray/50 rounded-xl border border-luxury-border"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {item.product.name}
                      </h4>
                      {item.variant && (
                        <div className="flex gap-1 mt-1">
                          {item.variant.length && (
                            <Badge
                              variant="outline"
                              className="text-[10px] border-gold/30 text-gold"
                            >
                              {item.variant.length}
                            </Badge>
                          )}
                          {item.variant.color && (
                            <Badge
                              variant="outline"
                              className="text-[10px] border-pink/30 text-pink"
                            >
                              {item.variant.color}
                            </Badge>
                          )}
                        </div>
                      )}
                      <p className="text-gold text-sm font-bold mt-1">
                        $
                        {item.variant ? item.variant.price : item.product.price}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="w-7 h-7 border-luxury-border text-white hover:bg-luxury-gray"
                          onClick={() =>
                            onUpdateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="w-7 h-7 border-luxury-border text-white hover:bg-luxury-gray"
                          onClick={() =>
                            onUpdateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-7 h-7 text-muted-foreground hover:text-pink ml-auto"
                          onClick={() => onRemove(item.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-luxury-border pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Subtotal
                  </span>
                  <span className="text-xl font-bold text-gold">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Shipping & taxes calculated at checkout
                </p>
                <Button
                  onClick={handleCheckout}
                  className="w-full gold-gradient text-luxury-black font-semibold py-6 rounded-full text-sm hover:opacity-90 transition-all shadow-lg shadow-gold/20"
                >
                  Checkout
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  onClick={handleWhatsAppCheckout}
                  disabled={checkingOut}
                  variant="outline"
                  className="w-full border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 hover:border-[#25D366] rounded-full py-3 text-sm transition-all"
                >
                  {checkingOut ? (
                    "Redirecting..."
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Order via WhatsApp
                    </>
                  )}
                </Button>
                <Button
                  variant="link"
                  className="w-full text-muted-foreground text-sm hover:text-gold"
                  onClick={() => onOpenChange(false)}
                >
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ─────────── Main Page ─────────── */

export default function Home() {
  const router = useRouter();
  const [cart, setCart] = useLocalStorage<CartItem[]>("lacelle-cart", []);
  const [cartOpen, setCartOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [products, setProducts] = useState<ProductType[]>(FALLBACK_PRODUCTS);
  const [detailProduct, setDetailProduct] = useState<ProductType | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewProductId, setReviewProductId] = useState<string | undefined>();

  // Feature 1: Search
  const [searchOpen, setSearchOpen] = useState(false);

  // Feature 3: Wishlist
  const [wishlistIds, setWishlistIds] = useLocalStorage<string[]>(
    "lacelle-wishlist",
    [],
  );
  const [wishlistOpen, setWishlistOpen] = useState(false);

  // Feature 2: Category click → filter
  const [initialFilter, setInitialFilter] = useState<string | null>(null);

  // Feature 5: Dialogs
  const [trackOrderOpen, setTrackOrderOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalTitle, setLegalTitle] = useState("");

  // Site-wide settings from admin
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [socialUrls, setSocialUrls] = useState({
    instagram: "https://instagram.com/lacellehair",
    facebook: "https://facebook.com/lacellehair",
    tiktok: "https://tiktok.com/@lacellehair",
  });

  const whatsappNumber = siteSettings.whatsapp_number || "1234567890";
  const siteEmail = siteSettings.email || "hello@lacellehair.com";
  const sitePhone = siteSettings.phone || "+1 (800) LACELLE-HR";
  const promoCode = siteSettings.promo_code || "LUXE20";

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistIds.length;

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch products from API
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(
            data.map((p: Record<string, unknown>) => ({
              id: p.id as string,
              name: p.name as string,
              price: p.price as number,
              originalPrice: p.originalPrice as number | null,
              image: p.image as string,
              category: p.category as string,
              badge: p.badge as string,
              rating: p.rating as number,
              reviewCount: p.reviewCount as number,
              lengths: JSON.parse((p.lengths as string) || "[]"),
              colors: JSON.parse((p.colors as string) || "[]"),
              stock: p.stock as number,
              lowStockThreshold: p.lowStockThreshold as number,
              variants: (p.variants || []) as VariantType[],
            })),
          );
        }
      })
      .catch(() => {});
  }, []);

  // Fetch ALL settings from API (used everywhere)
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object" && !data.error) {
          setSiteSettings(data);
          // Sync social URLs from settings
          setSocialUrls((prev) => ({
            instagram: data.instagram || prev.instagram,
            facebook: data.facebook || prev.facebook,
            tiktok: data.tiktok || prev.tiktok,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const addToCart = useCallback(
    (product: ProductType, variant?: VariantType, qty: number = 1) => {
      const cartId = variant ? `${product.id}-${variant.id}` : product.id;
      const price = variant ? variant.price : product.price;
      const variantLabel = variant
        ? [variant.length, variant.color].filter(Boolean).join(" / ")
        : "";
      setCart((prev) => {
        const existing = prev.find((item) => item.id === cartId);
        if (existing)
          return prev.map((item) =>
            item.id === cartId
              ? { ...item, quantity: item.quantity + qty }
              : item,
          );
        return [...prev, { id: cartId, product, quantity: qty, variant }];
      });
      toast.success(
        `${product.name}${variantLabel ? ` (${variantLabel})` : ""} added to cart!`,
        {
          description: `$${price} — View your cart`,
          action: { label: "View Cart", onClick: () => setCartOpen(true) },
        },
      );
    },
    [],
  );

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty < 1) setCart((prev) => prev.filter((item) => item.id !== id));
    else
      setCart((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: qty } : item,
        ),
      );
  }, []);

  const removeItem = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast("Item removed from cart");
  }, []);

  const handleProductClick = useCallback((product: ProductType) => {
    setDetailProduct(product);
    setDetailOpen(true);
  }, []);

  const handleWriteReview = useCallback((productId?: string) => {
    setReviewProductId(productId);
    setReviewOpen(true);
  }, []);

  // Feature 3: Toggle wishlist
  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlistIds((prev) => {
        if (prev.includes(productId)) {
          toast("Removed from wishlist");
          return prev.filter((id) => id !== productId);
        } else {
          toast.success("Added to wishlist! 💕");
          return [...prev, productId];
        }
      });
    },
    [setWishlistIds],
  );

  // Feature 2: Category click
  // Feature 5: Shop links
  const handleShopLinkClick = useCallback((link: string) => {
    const categoryMap: Record<string, string> = {
      Bundles: "Bundles",
      Frontals: "Frontals",
      Closures: "Closures",
      Wigs: "Wigs",
    };
    if (categoryMap[link]) {
      router.push(`/shop?category=${encodeURIComponent(link)}`);
    } else {
      toast.info(`${link} — Coming soon!`);
    }
  }, []);

  // Feature 5: Help links
  const handleHelpLinkClick = useCallback((link: string) => {
    if (link === "Contact Us") {
      document
        .querySelector("#contact")
        ?.scrollIntoView({ behavior: "smooth" });
    } else if (link === "Track Order") {
      setTrackOrderOpen(true);
    } else {
      toast.info(`${link} — Coming soon!`);
    }
  }, []);

  // Feature 5: Legal links
  const handleLegalClick = useCallback((title: string) => {
    setLegalTitle(title);
    setLegalOpen(true);
  }, []);

  // Clear initialFilter after ProductsSection consumes it
  const handleInitialFilterConsumed = useCallback(() => {
    // We use a key approach — but since we use effect in ProductsSection,
    // we just let the initialFilter remain and it only triggers once.
    // Reset after a timeout so re-clicking same category still works.
    setTimeout(() => setInitialFilter(null), 100);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-luxury-black">
      <Navbar
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        onSearchOpen={() => setSearchOpen(true)}
        wishlistCount={wishlistCount}
        onWishlistOpen={() => setWishlistOpen(true)}
        promoCode={promoCode}
        onNavigate={(href) => router.push(href)}
      />
      <main className="flex-1">
        <HeroSection />
        <ProductsSection
          products={products}
          onAddToCart={addToCart}
          onProductClick={handleProductClick}
          initialFilter={initialFilter}
          wishlistIds={wishlistIds}
          onToggleWishlist={toggleWishlist}
        />
        <AboutSection />
        <TestimonialsSection onWriteReview={handleWriteReview} />
        <CustomerReviewsSection
          products={products}
          onWriteReview={handleWriteReview}
        />
        <NewsletterSection />
        <ContactSection siteEmail={siteEmail} sitePhone={sitePhone} />
      </main>
      <Footer
        onShopLinkClick={handleShopLinkClick}
        onHelpLinkClick={handleHelpLinkClick}
        onLegalClick={handleLegalClick}
        socialUrls={socialUrls}
        siteEmail={siteEmail}
        sitePhone={sitePhone}
      />
      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
        whatsappNumber={whatsappNumber}
      />
      <WishlistDrawer
        open={wishlistOpen}
        onOpenChange={setWishlistOpen}
        wishlistIds={wishlistIds}
        products={products}
        onRemoveFromWishlist={toggleWishlist}
        onAddToCart={addToCart}
      />
      <SearchOverlay
        open={searchOpen}
        onOpenChange={setSearchOpen}
        products={products}
        onProductClick={handleProductClick}
      />
      <ProductDetailModal
        product={detailProduct}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onAddToCart={addToCart}
        onWriteReview={handleWriteReview}
        isWishlisted={
          detailProduct ? wishlistIds.includes(detailProduct.id) : false
        }
        onToggleWishlist={toggleWishlist}
      />
      <WriteReviewDialog
        key={reviewProductId || "new"}
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        products={products}
        preselectedProductId={reviewProductId}
      />
      <TrackOrderDialog
        open={trackOrderOpen}
        onOpenChange={setTrackOrderOpen}
        whatsappNumber={whatsappNumber}
      />
      <LegalDialog
        open={legalOpen}
        onOpenChange={setLegalOpen}
        title={legalTitle}
      />
      <WhatsAppButton whatsappNumber={whatsappNumber} />
      <AnimatePresence>
        {showBackToTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-12 h-12 rounded-full pink-gradient text-white shadow-lg shadow-pink/20 hover:opacity-90"
              size="icon"
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
