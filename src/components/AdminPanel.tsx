"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Star,
  Package,
  MessageSquare,
  Settings,
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  LogOut,
  Check,
  X,
  AlertTriangle,
  Image as ImageIcon,
  Send,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DateRangePicker from "@/components/ui/date-range-picker";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  image: string;
  category: string;
  badge: string;
  rating: number;
  reviewCount: number;
  stock: number;
  lowStockThreshold: number;
  featured: boolean;
  active: boolean;
  images?: { url: string; public_id: string | null }[];
  lengths?: string[];
  colors?: string[];
  variants?: ProductVariant[];
}

interface VariantFormState {
  length: string;
  color: string;
  price: number;
  originalPrice: number | "";
  stock: number;
  sku: string;
  active?: boolean;
}

interface ProductFormState {
  name: string;
  description: string;
  price: number;
  originalPrice: number | "";
  image: string;
  images: { url: string; public_id: string | null }[];
  category: string;
  badge: string;
  stock: number;
  lowStockThreshold: number;
  featured: boolean;
  active: boolean;
  lengths: string[];
  colors: string[];
}

interface ProductVariant {
  id: string;
  productId: string;
  length: string;
  color: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  sku: string;
  active: boolean;
}

interface Review {
  id: string;
  author: string;
  email: string;
  rating: number;
  title: string;
  text: string;
  approved: boolean;
  createdAt: string;
  product: { name: string };
}

interface ContactMsg {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface Order {
  id: string;
  reference: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  trackingNumber?: string | null;
  items: string;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  paidAt?: string | null;
  createdAt: string;
}

const ADMIN_PASSWORD = "LACELLE2024";

/* ─────────── Login Screen ─────────── */
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        const res = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        if (res.ok) {
          localStorage.setItem("lacelle_admin", "true");
          onLogin();
        } else {
          setError("Invalid password");
          setPassword("");
        }
      } catch {
        setError("Network error");
      }
    })();
  };

  return (
    <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-luxury-black" />
          </div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            LACELLE <span className="pink-shimmer">HAIR</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Admin Dashboard</p>
        </div>
        <form
          onSubmit={handleLogin}
          className="bg-luxury-dark border border-luxury-border rounded-2xl p-6 space-y-4"
        >
          <div>
            <label className="text-sm text-white/80 mb-1 block">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter admin password"
              className="bg-luxury-gray border-luxury-border text-white"
              autoFocus
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <Button
            type="submit"
            className="w-full gold-gradient text-luxury-black font-semibold py-3 rounded-full"
          >
            Sign In
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

/* ─────────── Dashboard Tab ─────────── */
function DashboardTab({
  products,
  reviews,
  messages,
}: {
  products: Product[];
  reviews: Review[];
  messages: ContactMsg[];
}) {
  const lowStock = products.filter(
    (p) => p.stock <= p.lowStockThreshold && p.stock > 0,
  );
  const outOfStock = products.filter((p) => p.stock <= 0);
  const totalRevenue = products.reduce(
    (s, p) => s + p.price * p.reviewCount,
    0,
  );
  const unreadMessages = messages.filter((m) => !m.read);

  const stats = [
    {
      label: "Total Products",
      value: products.length,
      icon: Package,
      color: "text-gold",
    },
    { label: "Reviews", value: reviews.length, icon: Star, color: "text-pink" },
    {
      label: "Low Stock",
      value: lowStock.length + outOfStock.length,
      icon: AlertTriangle,
      color: "text-orange-400",
    },
    {
      label: "Messages",
      value: unreadMessages.length,
      icon: MessageSquare,
      color: "text-blue-400",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Dashboard Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-luxury-dark border border-luxury-border rounded-xl p-4"
          >
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Low stock alerts */}
      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="bg-luxury-dark border border-orange-500/30 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Inventory Alerts
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {[...outOfStock, ...lowStock].map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-white/80">{p.name}</span>
                <Badge
                  variant="outline"
                  className={
                    p.stock <= 0
                      ? "border-red-500/50 text-red-400 text-[10px]"
                      : "border-orange-500/50 text-orange-400 text-[10px]"
                  }
                >
                  {p.stock <= 0 ? "Out of Stock" : `${p.stock} left`}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent messages */}
      {messages.length > 0 && (
        <div className="bg-luxury-dark border border-luxury-border rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gold" />
            Recent Messages
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {messages.slice(0, 5).map((m) => (
              <div
                key={m.id}
                className={`flex items-start gap-3 p-2 rounded-lg text-sm ${!m.read ? "bg-luxury-gray/50" : ""}`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-pink flex items-center justify-center text-luxury-black font-bold text-xs flex-shrink-0">
                  {m.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{m.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs truncate">
                    {m.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────── Variants Manager ─────────── */
function VariantsManager({ productId }: { productId: string }) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editVariant, setEditVariant] = useState<ProductVariant | null>(null);
  const [vForm, setVForm] = useState<VariantFormState>({
    length: "",
    color: "",
    price: 0,
    originalPrice: "",
    stock: 50,
    sku: "",
  });

  const fetchVariants = useCallback(async () => {
    try {
      const res = await fetch(`/api/variants?productId=${productId}`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }, [productId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await fetchVariants();
      if (!mounted) return;
      setVariants(data);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [fetchVariants]);

  const openNew = () => {
    setVForm({
      length: "",
      color: "",
      price: 0,
      originalPrice: "",
      stock: 50,
      sku: "",
    });
    setEditVariant(null);
    setShowAdd(true);
  };

  const openEditV = (v: ProductVariant) => {
    setVForm({
      length: v.length || "",
      color: v.color || "",
      price: v.price || 0,
      originalPrice: v.originalPrice ?? "",
      stock: v.stock || 0,
      sku: v.sku || "",
      active: v.active,
    });
    setEditVariant(v);
    setShowAdd(true);
  };

  const handleSaveVariant = async () => {
    if (!vForm.price || Number(vForm.price) <= 0) {
      toast.error("Price is required");
      return;
    }
    try {
      if (editVariant) {
        await fetch("/api/variants", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editVariant.id, ...vForm }),
        });
        toast.success("Variant updated");
      } else {
        await fetch("/api/variants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, ...vForm }),
        });
        toast.success("Variant created");
      }
      setShowAdd(false);
      fetchVariants();
    } catch {
      toast.error("Failed to save variant");
    }
  };

  const handleDeleteVariant = async (id: string) => {
    if (!confirm("Delete this variant?")) return;
    try {
      await fetch(`/api/variants?id=${id}`, { method: "DELETE" });
      toast.success("Variant deleted");
      fetchVariants();
    } catch {
      toast.error("Failed to delete variant");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-4">
        <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-white">Variant Prices</h4>
          <Badge
            variant="outline"
            className="text-[10px] border-pink/30 text-pink"
          >
            {variants.length} variants
          </Badge>
        </div>
        <Button
          size="sm"
          onClick={openNew}
          className="gold-gradient text-luxury-black font-semibold rounded-full px-3 text-xs h-7"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Variant
        </Button>
      </div>

      {variants.length === 0 && !showAdd && (
        <div className="text-center py-6 border border-dashed border-luxury-border rounded-xl">
          <p className="text-muted-foreground text-xs">
            No variants yet. Add variant prices for different lengths/colors.
          </p>
        </div>
      )}

      {variants.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {variants.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-3 bg-luxury-gray/50 rounded-lg p-3 border border-luxury-border"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {v.length && (
                    <Badge
                      variant="outline"
                      className="text-[10px] border-gold/30 text-gold"
                    >
                      {v.length}
                    </Badge>
                  )}
                  {v.color && (
                    <Badge
                      variant="outline"
                      className="text-[10px] border-pink/30 text-pink"
                    >
                      {v.color}
                    </Badge>
                  )}
                  {v.sku && (
                    <span className="text-[10px] text-muted-foreground">
                      SKU: {v.sku}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gold font-bold text-sm">
                    ${v.price}
                  </span>
                  {v.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      ${v.originalPrice}
                    </span>
                  )}
                  <span
                    className={`text-[10px] ${v.stock <= 5 ? "text-orange-400" : "text-green-400"}`}
                  >
                    Stock: {v.stock}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-luxury-border text-white/70 hover:text-gold hover:border-gold h-7 w-7 p-0"
                  onClick={() => openEditV(v)}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-luxury-border text-white/70 hover:text-red-400 h-7 w-7 p-0"
                  onClick={() => handleDeleteVariant(v.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Variant Inline Form */}
      {showAdd && (
        <div className="bg-luxury-gray/30 rounded-xl p-4 border border-gold/20 space-y-3">
          <h5 className="text-xs font-semibold text-gold">
            {editVariant ? "Edit Variant" : "New Variant"}
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-white/60 mb-1 block">Length</label>
              <Input
                value={String(vForm.length ?? "")}
                onChange={(e) => setVForm({ ...vForm, length: e.target.value })}
                className="bg-luxury-gray border-luxury-border text-white h-9 text-sm"
                placeholder='e.g. 18"'
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Color</label>
              <Input
                value={String(vForm.color ?? "")}
                onChange={(e) => setVForm({ ...vForm, color: e.target.value })}
                className="bg-luxury-gray border-luxury-border text-white h-9 text-sm"
                placeholder="e.g. #1B"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">SKU</label>
              <Input
                value={String(vForm.sku ?? "")}
                onChange={(e) => setVForm({ ...vForm, sku: e.target.value })}
                className="bg-luxury-gray border-luxury-border text-white h-9 text-sm"
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-white/60 mb-1 block">
                Price *
              </label>
              <Input
                type="number"
                value={vForm.price === 0 ? "" : String(vForm.price)}
                onChange={(e) =>
                  setVForm({ ...vForm, price: Number(e.target.value) })
                }
                className="bg-luxury-gray border-luxury-border text-white h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">
                Original Price
              </label>
              <Input
                type="number"
                value={
                  vForm.originalPrice === "" ? "" : String(vForm.originalPrice)
                }
                onChange={(e) =>
                  setVForm({
                    ...vForm,
                    originalPrice: e.target.value ? Number(e.target.value) : "",
                  })
                }
                className="bg-luxury-gray border-luxury-border text-white h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">Stock</label>
              <Input
                type="number"
                value={vForm.stock === 0 ? "" : String(vForm.stock)}
                onChange={(e) =>
                  setVForm({ ...vForm, stock: Number(e.target.value) })
                }
                className="bg-luxury-gray border-luxury-border text-white h-9 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSaveVariant}
              disabled={!vForm.price}
              className="gold-gradient text-luxury-black font-semibold rounded-full px-4 text-xs h-8"
            >
              {editVariant ? "Update" : "Add"} Variant
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAdd(false)}
              className="border-luxury-border text-white/70 rounded-full h-8"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────── Products Tab ─────────── */
function ProductsTab({
  products,
  onRefresh,
}: {
  products: Product[];
  onRefresh: () => void;
}) {
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<ProductFormState>({
    name: "",
    description: "",
    price: 0,
    originalPrice: "",
    image: "",
    images: [],
    category: "Bundles",
    badge: "",
    stock: 50,
    lowStockThreshold: 5,
    featured: false,
    active: true,
    lengths: [],
    colors: [],
  });
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setIsNew(true);
    setForm({
      name: "",
      description: "",
      price: 0,
      originalPrice: "",
      image: "",
      images: [],
      category: "Bundles",
      badge: "",
      stock: 50,
      lowStockThreshold: 5,
      featured: false,
      active: true,
      lengths: [],
      colors: [],
    });
    setEditProduct(null);
  };

  const openEdit = (p: Product) => {
    setIsNew(false);
    setEditProduct(p);
    setForm({
      name: p.name || "",
      description: p.description || "",
      price: Number(p.price) || 0,
      originalPrice: p.originalPrice ?? "",
      image: p.image || "",
      images: Array.isArray(p.images)
        ? p.images
        : p.image
          ? [{ url: p.image, public_id: null }]
          : [],
      category: p.category || "Bundles",
      badge: p.badge || "",
      stock: Number(p.stock) || 0,
      lowStockThreshold: Number(p.lowStockThreshold) || 5,
      featured: !!p.featured,
      active: p.active !== false,
      lengths: Array.isArray(p.lengths) ? p.lengths : [],
      colors: Array.isArray(p.colors) ? p.colors : [],
    });
  };

  const closeProductDialog = () => {
    setEditProduct(null);
    setIsNew(false);
    setForm({
      name: "",
      description: "",
      price: 0,
      originalPrice: "",
      image: "",
      images: [],
      category: "Bundles",
      badge: "",
      stock: 50,
      lowStockThreshold: 5,
      featured: false,
      active: true,
      lengths: [],
      colors: [],
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Try signed Cloudinary upload first
    try {
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "hair/uploads" }),
      });
      if (signRes.ok) {
        const { signature, timestamp, api_key, cloud_name } =
          await signRes.json();
        const fd = new FormData();
        fd.append("file", file);
        fd.append("api_key", api_key);
        fd.append("timestamp", String(timestamp));
        fd.append("signature", signature);
        fd.append("folder", "hair/uploads");
        const upRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
          { method: "POST", body: fd },
        );
        const json = await upRes.json();
        if (json.secure_url) {
          const imageObj = { url: json.secure_url, public_id: json.public_id };
          // If editing an existing product, append image on the server immediately
          if (editProduct && editProduct.id) {
            try {
              await fetch("/api/products/images", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  productId: editProduct.id,
                  url: imageObj.url,
                  public_id: imageObj.public_id,
                }),
              });
              // refresh product list
              onRefresh();
            } catch (err) {
              console.warn("Failed to append image to product:", err);
            }
          }
          setForm((f) => ({
            ...f,
            image: json.secure_url,
            images: [{ url: json.secure_url, public_id: json.public_id }],
          }));
          toast.success("Image uploaded");
          return;
        }
      }
    } catch (err) {
      console.warn("Signed upload failed, falling back:", err);
    }

    // Fallback to local /api/upload (or unsigned Cloudinary if configured)
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setForm((f) => ({
          ...f,
          image: data.url,
          images: [{ url: data.url, public_id: data.public_id || null }],
        }));
        toast.success("Image uploaded");
      }
    } catch {
      toast.error("Upload failed");
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    // Try signed Cloudinary upload first
    try {
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "hair/uploads" }),
      });
      if (signRes.ok) {
        const { signature, timestamp, api_key, cloud_name } =
          await signRes.json();
        const fd = new FormData();
        fd.append("file", file);
        fd.append("api_key", api_key);
        fd.append("timestamp", String(timestamp));
        fd.append("signature", signature);
        fd.append("folder", "hair/uploads");
        const upRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
          { method: "POST", body: fd },
        );
        const json = await upRes.json();
        if (json.secure_url) {
          const imageObj = { url: json.secure_url, public_id: json.public_id };
          if (editProduct && editProduct.id) {
            try {
              await fetch("/api/products/images", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  productId: editProduct.id,
                  url: imageObj.url,
                  public_id: imageObj.public_id,
                }),
              });
              onRefresh();
            } catch (err) {
              console.warn("Failed to append image to product:", err);
            }
          }
          setForm((f) => ({
            ...f,
            image: json.secure_url,
            images: [{ url: json.secure_url, public_id: json.public_id }],
          }));
          toast.success("Image uploaded");
          return;
        }
      }
    } catch (err) {
      console.warn("Signed upload failed, falling back:", err);
    }

    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setForm((f) => ({
          ...f,
          image: data.url,
          images: [{ url: data.url, public_id: data.public_id || null }],
        }));
        toast.success("Image uploaded");
      }
    } catch {
      toast.error("Upload failed");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = isNew ? "/api/products" : "/api/products";
      const method = isNew ? "POST" : "PUT";
      const body = isNew ? form : { id: editProduct?.id, ...form };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("lacelle_admin");
        window.location.reload();
        return;
      }

      if (res.ok) {
        toast.success(isNew ? "Product created" : "Product updated");
        closeProductDialog();
        onRefresh();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to save");
      }
    } catch {
      toast.error("Network error");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Product deleted");
        onRefresh();
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const toggleActive = async (p: Product) => {
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, active: !p.active }),
      });
      if (res.ok) onRefresh();
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Products</h2>
        <Button
          onClick={openNew}
          className="gold-gradient text-luxury-black font-semibold rounded-full px-4 text-sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-luxury-dark border border-luxury-border rounded-xl overflow-hidden"
          >
            <div className="relative aspect-video bg-luxury-gray">
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-luxury-border" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                <Badge
                  className={`text-[10px] ${p.active ? "bg-green-600 text-white" : "bg-luxury-gray text-muted-foreground"}`}
                >
                  {p.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <div className="p-3">
              <h3 className="text-sm font-semibold text-white truncate">
                {p.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gold font-bold">${p.price}</span>
                {p.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    ${p.originalPrice}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="text-[10px] border-luxury-border text-muted-foreground"
                >
                  {p.category}
                </Badge>
                {p.variants && p.variants.length > 0 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] border-pink/30 text-pink"
                  >
                    {p.variants.length} variant
                    {p.variants.length > 1 ? "s" : ""}
                  </Badge>
                )}
                <span
                  className={`text-xs ${p.stock <= p.lowStockThreshold ? "text-orange-400" : "text-green-400"}`}
                >
                  Stock: {p.stock}
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-luxury-border text-white/70 hover:text-gold hover:border-gold text-xs h-8"
                  onClick={() => openEdit(p)}
                >
                  <Pencil className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-luxury-border text-white/70 hover:text-pink h-8 w-8 p-0"
                  onClick={() => toggleActive(p)}
                >
                  {p.active ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-luxury-border text-white/70 hover:text-red-400 h-8 w-8 p-0"
                  onClick={() => handleDelete(p.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={editProduct !== null || isNew}
        onOpenChange={(open) => {
          if (!open) closeProductDialog();
        }}
      >
        <DialogContent className="bg-luxury-dark border-luxury-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {isNew ? "Add Product" : "Edit Product"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {isNew ? "Create a new product" : "Update product details"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Image Upload */}
            <div>
              <label className="text-sm text-white/80 mb-1 block">
                Product Image
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="relative border-2 border-dashed border-luxury-border rounded-xl p-6 text-center hover:border-gold/50 transition-colors cursor-pointer"
                onClick={() =>
                  document.getElementById("admin-img-upload")?.click()
                }
              >
                {form.image ? (
                  <img
                    src={form.image as string}
                    alt=""
                    className="max-h-40 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="py-4">
                    <Upload className="w-8 h-8 text-luxury-border mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop or click to upload
                    </p>
                  </div>
                )}
                <input
                  id="admin-img-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/80 mb-1 block">
                  Name *
                </label>
                <Input
                  value={String(form.name ?? "")}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-luxury-gray border-luxury-border text-white"
                />
              </div>
              <div>
                <label className="text-sm text-white/80 mb-1 block">
                  Category
                </label>
                <Select
                  value={String(form.category ?? "Bundles")}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger className="bg-luxury-gray border-luxury-border text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-luxury-dark border-luxury-border">
                    {["Bundles", "Frontals", "Closures", "Wigs"].map((c) => (
                      <SelectItem key={c} value={c} className="text-white">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm text-white/80 mb-1 block">
                Description
              </label>
              <Textarea
                value={String(form.description ?? "")}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="bg-luxury-gray border-luxury-border text-white"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-white/80 mb-1 block">
                  Price *
                </label>
                <Input
                  type="number"
                  value={form.price === 0 ? "" : String(form.price)}
                  onChange={(e) =>
                    setForm({ ...form, price: Number(e.target.value) })
                  }
                  className="bg-luxury-gray border-luxury-border text-white"
                />
              </div>
              <div>
                <label className="text-sm text-white/80 mb-1 block">
                  Original Price
                </label>
                <Input
                  type="number"
                  value={
                    form.originalPrice === "" || form.originalPrice === null
                      ? ""
                      : String(form.originalPrice)
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      originalPrice: e.target.value
                        ? Number(e.target.value)
                        : "",
                    })
                  }
                  className="bg-luxury-gray border-luxury-border text-white"
                />
              </div>
              <div>
                <label className="text-sm text-white/80 mb-1 block">
                  Stock
                </label>
                <Input
                  type="number"
                  value={form.stock === 0 ? "" : String(form.stock)}
                  onChange={(e) =>
                    setForm({ ...form, stock: Number(e.target.value) })
                  }
                  className="bg-luxury-gray border-luxury-border text-white"
                />
              </div>
              <div>
                <label className="text-sm text-white/80 mb-1 block">
                  Low Stock At
                </label>
                <Input
                  type="number"
                  value={
                    form.lowStockThreshold === 0
                      ? ""
                      : String(form.lowStockThreshold)
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lowStockThreshold: Number(e.target.value),
                    })
                  }
                  className="bg-luxury-gray border-luxury-border text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/80 mb-1 block">
                  Badge
                </label>
                <Input
                  value={String(form.badge ?? "")}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  className="bg-luxury-gray border-luxury-border text-white"
                  placeholder="Best Seller"
                />
              </div>
              <div className="flex items-end gap-4 pb-1">
                <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.featured}
                    onChange={(e) =>
                      setForm({ ...form, featured: e.target.checked })
                    }
                    className="accent-gold"
                  />
                  Featured
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={saving || !form.name || !form.price}
                className="flex-1 gold-gradient text-luxury-black font-semibold rounded-full py-3"
              >
                {saving
                  ? "Saving..."
                  : isNew
                    ? "Create Product"
                    : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={closeProductDialog}
                className="border-luxury-border text-white/70 rounded-full"
              >
                Cancel
              </Button>
            </div>
            {/* Variant Prices - only show for existing products */}
            {!isNew && editProduct && (
              <div className="pt-4 border-t border-luxury-border">
                <VariantsManager productId={editProduct.id} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─────────── Reviews Tab ─────────── */
function ReviewsTab({ onRefresh }: { onRefresh: () => void }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/reviews?limit=100");
      const data = await res.json();
      return data.reviews || [];
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await fetchReviews();
      if (!mounted) return;
      setReviews(data);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [fetchReviews]);

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      await fetch("/api/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approved }),
      });
      toast.success(approved ? "Review approved" : "Review hidden");
      fetchReviews();
      onRefresh();
    } catch {
      toast.error("Failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
      toast.success("Review deleted");
      fetchReviews();
      onRefresh();
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Reviews</h2>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No reviews yet
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className={`bg-luxury-dark border rounded-xl p-4 ${r.approved ? "border-luxury-border" : "border-orange-500/30"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold text-sm">
                      {r.author}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {r.email}
                    </span>
                    {!r.approved && (
                      <Badge className="bg-orange-500/20 text-orange-400 text-[10px] border-0">
                        Pending
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < r.rating ? "text-gold fill-gold" : "text-luxury-border"}`}
                      />
                    ))}
                  </div>
                  {r.title && (
                    <p className="text-white text-sm font-medium">{r.title}</p>
                  )}
                  <p className="text-muted-foreground text-sm">{r.text}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{r.product?.name}</span>
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-luxury-border text-white/70 hover:text-gold hover:border-gold h-7 w-7 p-0"
                    onClick={() => handleApprove(r.id, !r.approved)}
                  >
                    {r.approved ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-luxury-border text-white/70 hover:text-red-400 h-7 w-7 p-0"
                    onClick={() => handleDelete(r.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────── Settings Tab ─────────── */
function SettingsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setSettings(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save");
    }
    setSaving(false);
  };

  const fields = [
    {
      key: "whatsapp_number",
      label: "WhatsApp Number",
      placeholder: "1234567890",
      icon: Send,
    },
    {
      key: "email",
      label: "Contact Email",
      placeholder: "hello@lacellehair.com",
      icon: null,
    },
    {
      key: "phone",
      label: "Phone Number",
      placeholder: "+1 (800) LACELLE-HR",
      icon: null,
    },
    {
      key: "promo_code",
      label: "Promo Code",
      placeholder: "LUXE20",
      icon: null,
    },
    {
      key: "instagram",
      label: "Instagram URL",
      placeholder: "https://instagram.com/lacellehair",
      icon: null,
    },
    {
      key: "facebook",
      label: "Facebook URL",
      placeholder: "https://facebook.com/lacellehair",
      icon: null,
    },
    {
      key: "tiktok",
      label: "TikTok URL",
      placeholder: "https://tiktok.com/@lacellehair",
      icon: null,
    },
    {
      key: "paystack_secret_key",
      label: "Paystack Secret Key",
      placeholder: "sk_test_xxxx or sk_live_xxxx",
      icon: null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gold-gradient text-luxury-black font-semibold rounded-full px-4 text-sm"
        >
          <Check className="w-4 h-4 mr-1" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-luxury-dark border border-luxury-border rounded-xl p-6 space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-sm text-white/80 mb-1 block">
                {f.label}
              </label>
              <Input
                value={settings[f.key] || ""}
                onChange={(e) =>
                  setSettings({ ...settings, [f.key]: e.target.value })
                }
                placeholder={f.placeholder}
                className="bg-luxury-gray border-luxury-border text-white"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────── Orders Tab ─────────── */
function OrdersTab({ onRefresh }: { onRefresh: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [total, setTotal] = useState(0);
  const [trackingInput, setTrackingInput] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const formatDate = (date: Date) => date.toISOString().slice(0, 10);

  const applyPreset = (preset: "today" | "7d" | "30d") => {
    const today = new Date();
    const end = formatDate(today);
    const start = new Date(today);
    if (preset === "today") {
      setFromDate(end);
      setToDate(end);
    } else {
      start.setDate(today.getDate() - (preset === "7d" ? 6 : 29));
      setFromDate(formatDate(start));
      setToDate(end);
    }
    setPage(1);
  };

  const fetchOrders = useCallback(
    async (
      p = page,
      l = limit,
      q = query,
      from = fromDate,
      to = toDate,
      status = statusFilter,
    ) => {
      try {
        const qs = [`page=${p}`, `limit=${l}`];
        if (q) qs.push(`q=${encodeURIComponent(q)}`);
        if (from) qs.push(`from=${encodeURIComponent(from)}`);
        if (to) qs.push(`to=${encodeURIComponent(to)}`);
        if (status && status !== "all")
          qs.push(`status=${encodeURIComponent(status)}`);
        const res = await fetch(`/api/orders?${qs.join("&")}`);
        const data = await res.json();
        return data || { orders: [], total: 0 };
      } catch {
        return { orders: [], total: 0 };
      }
    },
    [page, limit, query, fromDate, toDate, statusFilter],
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await fetchOrders(
        page,
        limit,
        query,
        fromDate,
        toDate,
        statusFilter,
      );
      if (!mounted) return;
      setOrders(data.orders || []);
      setTotal(data.total || 0);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [fetchOrders, page, limit, query, fromDate, toDate, statusFilter]);

  const updateStatus = async (
    id: string,
    status: string,
    trackingNumber?: string,
  ) => {
    try {
      const payload: any = { id, status };
      if (trackingNumber) payload.trackingNumber = trackingNumber;
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success("Order updated");
        const updated = await res.json();
        setOrders((s) => s.map((o) => (o.id === updated.id ? updated : o)));
        onRefresh();
      } else toast.error("Failed to update");
    } catch {
      toast.error("Network error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Orders</h2>
      </div>

      <div className="hidden md:flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by email, name or reference"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
        <DateRangePicker
          value={{ from: fromDate || null, to: toDate || null }}
          onChange={({ from, to }) => {
            setFromDate(from || "");
            setToDate(to || "");
            setPage(1);
          }}
          className="max-w-lg"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-luxury-border text-white/80 hover:text-white"
            onClick={() => applyPreset("today")}
          >
            Today
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-luxury-border text-white/80 hover:text-white"
            onClick={() => applyPreset("7d")}
          >
            Last 7 Days
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-luxury-border text-white/80 hover:text-white"
            onClick={() => applyPreset("30d")}
          >
            Last 30 Days
          </Button>
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-luxury-dark border-luxury-border">
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={String(limit)}
          onValueChange={(v) => {
            setLimit(Number(v));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-luxury-dark border-luxury-border">
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          className="border-luxury-border text-white/80 hover:text-white"
          onClick={() => {
            setQuery("");
            setFromDate("");
            setToDate("");
            setStatusFilter("all");
            setLimit(20);
            setPage(1);
          }}
        >
          Clear Filters
        </Button>
        <Button
          size="sm"
          className="ml-auto"
          onClick={async () => {
            const qs = [`format=csv`, `limit=${limit}`, `page=${page}`];
            if (query) qs.push(`q=${encodeURIComponent(query)}`);
            if (fromDate) qs.push(`from=${encodeURIComponent(fromDate)}`);
            if (toDate) qs.push(`to=${encodeURIComponent(toDate)}`);
            if (statusFilter && statusFilter !== "all")
              qs.push(`status=${encodeURIComponent(statusFilter)}`);
            const res = await fetch(`/api/orders?${qs.join("&")}`);
            if (!res.ok) {
              toast.error("Export failed");
              return;
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "orders.csv";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          }}
        >
          Export CSV
        </Button>
      </div>

      {/* Mobile: compact Filters button that opens a dialog */}
      <div className="flex md:hidden items-center gap-2">
        <Button
          size="sm"
          className="gold-gradient"
          onClick={() => setMobileFiltersOpen(true)}
        >
          Filters
        </Button>
        <Button
          size="sm"
          className="ml-auto"
          onClick={async () => {
            const qs = [`format=csv`, `limit=${limit}`, `page=${page}`];
            if (query) qs.push(`q=${encodeURIComponent(query)}`);
            if (fromDate) qs.push(`from=${encodeURIComponent(fromDate)}`);
            if (toDate) qs.push(`to=${encodeURIComponent(toDate)}`);
            if (statusFilter && statusFilter !== "all")
              qs.push(`status=${encodeURIComponent(statusFilter)}`);
            const res = await fetch(`/api/orders?${qs.join("&")}`);
            if (!res.ok) {
              toast.error("Export failed");
              return;
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "orders.csv";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          }}
        >
          Export CSV
        </Button>
      </div>

      <Dialog
        open={mobileFiltersOpen}
        onOpenChange={(open) => setMobileFiltersOpen(open)}
      >
        <DialogContent className="bg-luxury-dark border-luxury-border max-w-md fixed bottom-0 left-0 right-0 rounded-t-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Filters</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Refine orders
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <Input
              placeholder="Search by email, name or reference"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              onKeyDown={(e: any) => {
                if (e.key === "Enter") {
                  setMobileFiltersOpen(false);
                  setPage(1);
                }
              }}
            />
            <DateRangePicker
              value={{ from: fromDate || null, to: toDate || null }}
              onChange={({ from, to }) => {
                setFromDate(from || "");
                setToDate(to || "");
                setPage(1);
                setMobileFiltersOpen(false);
              }}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  applyPreset("today");
                  setMobileFiltersOpen(false);
                }}
              >
                Today
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  applyPreset("7d");
                  setMobileFiltersOpen(false);
                }}
              >
                Last 7 Days
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  applyPreset("30d");
                  setMobileFiltersOpen(false);
                }}
              >
                Last 30 Days
              </Button>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
                setMobileFiltersOpen(false);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-luxury-dark border-luxury-border">
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  setQuery("");
                  setFromDate("");
                  setToDate("");
                  setStatusFilter("all");
                  setLimit(20);
                  setPage(1);
                  setMobileFiltersOpen(false);
                }}
              >
                Clear Filters
              </Button>
              <Button
                className="ml-auto"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No orders found
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-luxury-dark border rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div className="text-white font-semibold">{o.fullName}</div>
                  <div className="text-xs text-muted-foreground">{o.email}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="text-gold font-bold">
                    {o.currency} {o.totalAmount}
                  </div>
                  <Badge
                    className={`text-[10px] ${o.status === "paid" ? "bg-green-600 text-white" : o.status === "pending" ? "bg-orange-500/30 text-orange-400" : "bg-luxury-gray text-muted-foreground"}`}
                  >
                    {o.status}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    Ref: {o.reference}{" "}
                    {o.trackingNumber ? `· Tracking: ${o.trackingNumber}` : ""}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setTrackingInput(o.trackingNumber || "");
                    setSelected(o);
                  }}
                  className="h-8"
                >
                  View
                </Button>
                {o.status !== "shipped" && (
                  <Button
                    size="sm"
                    className="gold-gradient"
                    onClick={() => {
                      setTrackingInput(o.trackingNumber || "");
                      setSelected(o);
                    }}
                  >
                    Mark Shipped
                  </Button>
                )}
                {o.status !== "delivered" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(o.id, "delivered")}
                  >
                    Mark Delivered
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-3">
        <div className="text-xs text-muted-foreground">
          Showing {orders.length} of {total} orders
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Prev
          </Button>
          <div className="text-sm text-white">Page {page}</div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={orders.length < limit}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="bg-luxury-dark border-luxury-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Order Details</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Manage order
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 mt-4">
              <div className="text-sm text-white">
                <strong>{selected.fullName}</strong> — {selected.email}
              </div>
              <div className="text-xs text-muted-foreground">
                Placed: {new Date(selected.createdAt).toLocaleString()}
              </div>
              <div className="bg-luxury-gray p-3 rounded-md text-sm">
                <div className="font-medium text-white">Items</div>
                <pre className="text-xs text-muted-foreground mt-2">
                  {selected.items}
                </pre>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-gold font-bold">
                  {selected.currency} {selected.totalAmount}
                </div>
                <Badge className="text-[10px]">{selected.status}</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-xs text-white/80 mb-1 block">
                    Tracking Number (required for shipping)
                  </label>
                  <Input
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    className="bg-luxury-gray border-luxury-border text-white"
                  />
                </div>
                <div className="flex gap-2 items-end">
                  <Button
                    onClick={() =>
                      updateStatus(selected.id, "shipped", trackingInput)
                    }
                    className="gold-gradient"
                    disabled={!trackingInput.trim()}
                  >
                    Mark Shipped
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      updateStatus(selected.id, "delivered", trackingInput)
                    }
                  >
                    Mark Delivered
                  </Button>
                  <Button variant="outline" onClick={() => setSelected(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─────────── Messages Tab ─────────── */
function MessagesTab({ onRefresh }: { onRefresh: () => void }) {
  const [messages, setMessages] = useState<ContactMsg[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/contact");
      const data = await res.json();
      return data || [];
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await fetchMessages();
      if (!mounted) return;
      setMessages(data);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [fetchMessages]);

  const markRead = async (id: string) => {
    try {
      await fetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: true }),
      });
      fetchMessages();
      onRefresh();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await fetch(`/api/contact?id=${id}`, { method: "DELETE" });
      toast.success("Message deleted");
      fetchMessages();
      onRefresh();
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Messages</h2>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No messages yet
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              onClick={() => !m.read && markRead(m.id)}
              className={`bg-luxury-dark border rounded-xl p-4 cursor-pointer transition-colors ${!m.read ? "border-gold/30 bg-gold/5" : "border-luxury-border"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!m.read && (
                      <div className="w-2 h-2 rounded-full bg-gold" />
                    )}
                    <span className="text-white font-semibold text-sm">
                      {m.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {m.email}
                    </span>
                  </div>
                  {m.subject && (
                    <p className="text-gold text-xs mb-1">{m.subject}</p>
                  )}
                  <p className="text-muted-foreground text-sm">{m.message}</p>
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-luxury-border text-white/70 hover:text-red-400 h-8 w-8 p-0 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(m.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────── Main Admin Panel ─────────── */
export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [messages, setMessages] = useState<ContactMsg[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  const fetchAll = useCallback(async () => {
    try {
      const [pRes, rRes, mRes] = await Promise.all([
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/reviews?limit=100").then((r) => r.json()),
        fetch("/api/contact").then((r) => r.json()),
      ]);
      setProducts(Array.isArray(pRes) ? pRes : []);
      setReviews(rRes.reviews || []);
      setMessages(Array.isArray(mRes) ? mRes : []);
    } catch {}
  }, []);

  useEffect(() => {
    // Read localStorage only after mount to keep server/client initial HTML identical.
    const timer = setTimeout(() => {
      (async () => {
        try {
          const res = await fetch("/api/admin/session");
          const data = await res.json().catch(() => ({}));
          setAuthenticated(Boolean(data.authenticated && res.ok));
        } catch {
          setAuthenticated(false);
        } finally {
          setAuthChecked(true);
        }
      })();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!authenticated) return;
    (async () => {
      if (!mounted) return;
      await fetchAll();
    })();
    return () => {
      mounted = false;
    };
  }, [authenticated, fetchAll]);

  const handleLogout = () => {
    (async () => {
      try {
        await fetch("/api/admin/logout", { method: "POST" });
      } catch {}
      localStorage.removeItem("lacelle_admin");
      setAuthenticated(false);
    })();
  };

  if (!authChecked)
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!authenticated)
    return <AdminLogin onLogin={() => setAuthenticated(true)} />;

  const tabs = [
    { value: "dashboard", label: "Dashboard", icon: BarChart3 },
    { value: "products", label: "Products", icon: Package },
    { value: "orders", label: "Orders", icon: ShoppingBag },
    { value: "reviews", label: "Reviews", icon: Star },
    { value: "messages", label: "Messages", icon: MessageSquare },
    { value: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-luxury-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-luxury-dark border-b border-luxury-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="flex items-center gap-2 text-white/70 hover:text-gold transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Store
              </a>
              <Separator
                orientation="vertical"
                className="h-6 bg-luxury-border"
              />
              <h1
                className="text-lg font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                LACELLE <span className="text-pink">HAIR</span>
              </h1>
              <Badge
                variant="outline"
                className="border-pink/30 text-pink text-[10px]"
              >
                Admin
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-pink"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Desktop Tabs */}
        <div className="hidden md:block">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-luxury-dark border border-luxury-border rounded-xl p-1 mb-6">
              {tabs.map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="data-[state=active]:bg-pink data-[state=active]:text-white text-white/70 rounded-lg px-4 flex items-center gap-2 text-sm"
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="dashboard">
              <DashboardTab
                products={products}
                reviews={reviews}
                messages={messages}
              />
            </TabsContent>
            <TabsContent value="products">
              <ProductsTab products={products} onRefresh={fetchAll} />
            </TabsContent>
            <TabsContent value="orders">
              <OrdersTab onRefresh={fetchAll} />
            </TabsContent>
            <TabsContent value="reviews">
              <ReviewsTab onRefresh={fetchAll} />
            </TabsContent>
            <TabsContent value="messages">
              <MessagesTab onRefresh={fetchAll} />
            </TabsContent>
            <TabsContent value="settings">
              <SettingsTab />
            </TabsContent>
          </Tabs>
        </div>

        {/* Mobile Bottom Tabs */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-luxury-dark border-t border-luxury-border z-50 flex safe-area-inset-bottom">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setActiveTab(t.value)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${activeTab === t.value ? "text-pink" : "text-muted-foreground"}`}
            >
              <t.icon className="w-5 h-5" />
              <span className="text-[10px]">{t.label}</span>
            </button>
          ))}
        </div>
        <div className="md:hidden pb-20">
          {activeTab === "dashboard" && (
            <DashboardTab
              products={products}
              reviews={reviews}
              messages={messages}
            />
          )}
          {activeTab === "products" && (
            <ProductsTab products={products} onRefresh={fetchAll} />
          )}
          {activeTab === "orders" && <OrdersTab onRefresh={fetchAll} />}
          {activeTab === "reviews" && <ReviewsTab onRefresh={fetchAll} />}
          {activeTab === "messages" && <MessagesTab onRefresh={fetchAll} />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}
