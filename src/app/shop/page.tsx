"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  Star,
  Sparkles,
  Crown,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  SlidersHorizontal,
  ArrowUpDown,
  Package,
  MessageCircle,
  Send,
  Minus,
  Plus,
  Check,
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

interface CartItem {
  id: string;
  product: ProductType;
  quantity: number;
  variant?: VariantType;
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

function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, (val: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initial;
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

const CATEGORIES = ["All", "Bundles", "Frontals", "Closures", "Wigs"];
const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A-Z", value: "name-asc" },
  { label: "Rating", value: "rating" },
  { label: "Most Popular", value: "popular" },
];

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

/* ─────────── Star Rating ─────────── */

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

  const variantLengths = hasVariants
    ? [...new Set(product!.variants!.map((v) => v.length).filter(Boolean))]
    : product.lengths;
  const variantColors = hasVariants
    ? [...new Set(product!.variants!.map((v) => v.color).filter(Boolean))]
    : product.colors;
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
          <div className="flex flex-col">
            <DialogHeader className="mb-4">
              <DialogTitle
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {product.name}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {product.description}
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={Math.round(product.rating)} />
              <span className="text-sm text-muted-foreground">
                ({product.reviewCount} reviews)
              </span>
            </div>
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
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className={`text-sm font-medium ${stockColor}`}>
                {stockStatus}
              </span>
            </div>

            {hasVariants ? (
              <div className="space-y-4 mb-6">
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
                {product.lengths.length > 0 && (
                  <div className="mb-4">
                    <label className="text-sm text-white/80 mb-2 block">
                      Length
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.lengths.map((l) => (
                        <button
                          key={l}
                          className="px-3 py-1.5 rounded-full text-xs border border-luxury-border text-white/70 hover:border-gold hover:text-gold transition-all"
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
                          className="px-3 py-1.5 rounded-full text-xs border border-luxury-border text-white/70 hover:border-gold hover:text-gold transition-all"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

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

            <div className="flex gap-3 mt-3">
              <Button
                variant="outline"
                onClick={() => onToggleWishlist(product.id)}
                className={`flex-1 border-luxury-border rounded-full py-3 text-sm transition-all ${isWishlisted ? "border-pink text-pink hover:bg-pink/10" : "text-white/70 hover:text-gold hover:border-gold"}`}
              >
                <Heart
                  className={`w-4 h-4 mr-2 ${isWishlisted ? "fill-pink" : ""}`}
                />
                {isWishlisted ? "Wishlisted" : "Wishlist"}
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
            {preselectedProductId ? (
              <div className="bg-luxury-gray border border-luxury-border rounded-md px-3 py-2 text-white">
                {products.find((p) => p.id === preselectedProductId)?.name ||
                  "Selected product"}
              </div>
            ) : (
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
            )}
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

/* ─────────── Main Shop Page ─────────── */

export default function ShopPageWrapper() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: "#0A0A0A" }}
        >
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ShopPage />
    </Suspense>
  );
}

function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mobile = useIsMobile();

  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [wishlistIds, setWishlistIds] = useLocalStorage<string[]>(
    "lacelle-wishlist",
    [],
  );
  const [cart, setCart] = useLocalStorage<CartItem[]>("lacelle-cart", []);
  const [cartOpen, setCartOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<ProductType | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewProductId, setReviewProductId] = useState<string | undefined>();
  const [wishlistOpen, setWishlistOpen] = useState(false);

  // Site settings
  const [whatsappNumber, setWhatsappNumber] = useState("1234567890");

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistIds.length;

  // Fetch products
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
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Fetch settings
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object" && !data.error) {
          setWhatsappNumber(data.whatsapp_number || "1234567890");
        }
      })
      .catch(() => {});
  }, []);

  // URL category param
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && CATEGORIES.includes(cat)) {
      // schedule state update to avoid synchronous setState inside effect
      setTimeout(() => setActiveCategory(cat), 0);
    }
  }, [searchParams]);

  // Filter + sort products
  const filteredProducts = (() => {
    let result = [...products];

    // Category filter
    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.badge.toLowerCase().includes(q),
      );
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "newest":
      default:
        break;
    }

    return result;
  })();

  // Cart functions
  const addToCart = useCallback(
    (product: ProductType, variant?: VariantType, qty: number = 1) => {
      const cartId = variant ? `${product.id}-${variant.id}` : product.id;
      const price = variant ? variant.price : product.price;
      const variantLabel = variant
        ? [variant.length, variant.color].filter(Boolean).join(" / ")
        : "";
      setCart((prev: CartItem[]) => {
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
    [setCart],
  );

  const updateQuantity = useCallback(
    (id: string, qty: number) => {
      if (qty < 1)
        setCart((prev: CartItem[]) => prev.filter((item) => item.id !== id));
      else
        setCart((prev: CartItem[]) =>
          prev.map((item) =>
            item.id === id ? { ...item, quantity: qty } : item,
          ),
        );
    },
    [setCart],
  );

  const removeItem = useCallback(
    (id: string) => {
      setCart((prev: CartItem[]) => prev.filter((item) => item.id !== id));
      toast("Item removed from cart");
    },
    [setCart],
  );

  const handleProductClick = useCallback((product: ProductType) => {
    setDetailProduct(product);
    setDetailOpen(true);
  }, []);

  const handleWriteReview = useCallback((productId?: string) => {
    setReviewProductId(productId);
    setReviewOpen(true);
  }, []);

  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlistIds((prev: string[]) => {
        if (prev.includes(productId)) {
          toast("Removed from wishlist");
          return prev.filter((id) => id !== productId);
        } else {
          toast.success("Added to wishlist!");
          return [...prev, productId];
        }
      });
    },
    [setWishlistIds],
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      {/* Promo Bar */}
      <div className="bg-gradient-to-r from-pink-dark via-pink to-pink-dark text-white text-center py-2 px-4 text-xs md:text-sm font-semibold tracking-wide">
        <div className="flex items-center justify-center gap-2">
          <Crown className="w-3.5 h-3.5" />
          <span>FREE SHIPPING on orders over $200</span>
          <Crown className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-luxury-black/95 backdrop-blur-md border-b border-luxury-border shadow-lg shadow-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center">
                <Crown className="w-4 h-4 md:w-5 md:h-5 text-luxury-black" />
              </div>
              <h1
                className="text-xl md:text-2xl font-bold text-white tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                LACELLE <span className="pink-shimmer">HAIR</span>
              </h1>
            </button>

            {/* Back link */}
            <button
              onClick={() => router.push("/")}
              className="hidden md:flex items-center gap-2 text-sm text-white/60 hover:text-gold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>

            {/* Action icons */}
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-gold transition-colors"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-pink transition-colors relative hidden sm:flex"
                onClick={() => setWishlistOpen(true)}
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink text-white text-[10px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-gold transition-colors relative"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingBag className="w-5 h-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-pink text-white text-[10px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div
        className="relative overflow-hidden py-12 md:py-16"
        style={{
          background:
            "linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 50%, #0A0A0A 100%)",
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/10 rounded-full blur-[80px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <button
              onClick={() => router.push("/")}
              className="hover:text-gold transition-colors"
            >
              Home
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">All Products</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <motion.h1
                initial={mobile ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: mobile ? 0.1 : 0.6 }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                All Products
              </motion.h1>
              <p className="text-muted-foreground text-sm md:text-base">
                {filteredProducts.length} product
                {filteredProducts.length !== 1 ? "s" : ""}
                {activeCategory !== "All" && (
                  <span>
                    {" "}
                    in <span className="text-pink">{activeCategory}</span>
                  </span>
                )}
                {searchQuery && (
                  <span>
                    {" "}
                    matching &ldquo;
                    <span className="text-gold">{searchQuery}</span>&rdquo;
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div
        className="sticky top-16 md:top-20 z-40 border-b border-luxury-border"
        style={{
          backgroundColor: "rgba(10,10,10,0.95)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {/* Category pills */}
            <div className="flex gap-2 flex-shrink-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? "gold-gradient text-luxury-black border-0 shadow-lg shadow-gold/20"
                      : "border border-luxury-border text-white/70 hover:border-gold hover:text-gold"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-luxury-border flex-shrink-0 mx-1" />

            {/* Search */}
            <div className="relative flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-luxury-gray border border-luxury-border rounded-full text-sm text-white placeholder:text-white/30 outline-none focus:border-gold/50 transition-colors w-40 sm:w-56"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="w-px h-6 bg-luxury-border flex-shrink-0 mx-1 hidden sm:block" />

            {/* Sort */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <ArrowUpDown className="w-4 h-4 text-white/40 hidden sm:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-luxury-gray border border-luxury-border rounded-full px-3 py-2 text-sm text-white/80 outline-none focus:border-gold/50 transition-colors cursor-pointer appearance-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="bg-luxury-dark"
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex-shrink-0 flex items-center gap-1.5 px-3 py-2 border border-luxury-border rounded-full text-sm text-white/70 hover:border-pink hover:text-pink transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>

          {/* Active filter tags */}
          {(activeCategory !== "All" || searchQuery) && (
            <div className="flex items-center gap-2 mt-2">
              {activeCategory !== "All" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink/10 border border-pink/30 text-pink text-xs">
                  {activeCategory}
                  <button onClick={() => setActiveCategory("All")}>
                    <X className="w-3 h-3 ml-0.5" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs">
                  &ldquo;{searchQuery}&rdquo;
                  <button onClick={() => setSearchQuery("")}>
                    <X className="w-3 h-3 ml-0.5" />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setActiveCategory("All");
                  setSearchQuery("");
                }}
                className="text-xs text-muted-foreground hover:text-white transition-colors ml-2"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Search className="w-16 h-16 text-luxury-border mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                No products found
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Try adjusting your search or filter criteria to find what
                you&apos;re looking for.
              </p>
              <Button
                onClick={() => {
                  setActiveCategory("All");
                  setSearchQuery("");
                }}
                className="gold-gradient text-luxury-black font-semibold rounded-full px-6"
              >
                View All Products
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={(p) => addToCart(p)}
                    onClick={handleProductClick}
                    isWishlisted={wishlistIds.includes(product.id)}
                    onToggleWishlist={toggleWishlist}
                  />
                ))}
              </div>

              {/* Results summary */}
              <div className="text-center mt-10 text-sm text-muted-foreground">
                Showing {filteredProducts.length} of {products.length} products
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        className="border-t border-luxury-border"
        style={{ backgroundColor: "#111111" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center">
                <Crown className="w-3.5 h-3.5 text-luxury-black" />
              </div>
              <span className="text-sm font-bold text-white">
                LACELLE <span className="pink-shimmer">HAIR</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} LACELLE HAIR. All rights
              reserved.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => router.push("/")}
                className="text-xs text-muted-foreground hover:text-gold transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => router.push("/admin")}
                className="text-xs text-muted-foreground hover:text-gold transition-colors"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Button */}
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/40 transition-all ring-2 ring-pink/40 ring-offset-2"
        style={{ ringOffsetColor: "#0A0A0A" }}
      >
        <MessageCircle className="w-6 h-6" fill="white" />
      </a>

      {/* Drawers & Modals */}
      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
        whatsappNumber={whatsappNumber}
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

      {/* Wishlist Drawer */}
      <Sheet open={wishlistOpen} onOpenChange={setWishlistOpen}>
        <SheetContent className="w-full sm:max-w-md bg-luxury-dark border-luxury-border text-white">
          <div className="flex flex-col h-full">
            <SheetHeader className="pb-4">
              <SheetTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink" />
                Wishlist
                {wishlistIds.length > 0 && (
                  <Badge className="bg-pink text-white border-0 text-xs">
                    {wishlistIds.length} items
                  </Badge>
                )}
              </SheetTitle>
            </SheetHeader>
            {wishlistIds.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Heart className="w-16 h-16 text-luxury-border mb-4" />
                <p className="text-muted-foreground mb-2">
                  Your wishlist is empty
                </p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-4 -mx-6 px-6 py-4">
                  {products
                    .filter((p) => wishlistIds.includes(p.id))
                    .map((product) => (
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
                                addToCart(product);
                                toast.success(`${product.name} added to cart!`);
                              }}
                              className="gold-gradient text-luxury-black font-semibold text-xs rounded-full px-3 py-1 hover:opacity-90"
                            >
                              Add to Cart
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleWishlist(product.id)}
                              className="text-muted-foreground hover:text-pink text-xs px-2"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
