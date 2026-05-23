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

const ADMIN_PASSWORD = "LACELLE2024";

/* ─────────── Login Screen ─────────── */
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("lacelle_admin", "true");
      onLogin();
    } else {
      setError("Invalid password");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-luxury-black" />
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>LACELLE <span className="pink-shimmer">HAIR</span></h1>
          <p className="text-muted-foreground text-sm mt-1">Admin Dashboard</p>
        </div>
        <form onSubmit={handleLogin} className="bg-luxury-dark border border-luxury-border rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm text-white/80 mb-1 block">Password</label>
            <Input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="Enter admin password" className="bg-luxury-gray border-luxury-border text-white" autoFocus />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <Button type="submit" className="w-full gold-gradient text-luxury-black font-semibold py-3 rounded-full">Sign In</Button>
        </form>
      </motion.div>
    </div>
  );
}

/* ─────────── Dashboard Tab ─────────── */
function DashboardTab({ products, reviews, messages }: { products: Product[]; reviews: Review[]; messages: ContactMsg[] }) {
  const lowStock = products.filter((p) => p.stock <= p.lowStockThreshold && p.stock > 0);
  const outOfStock = products.filter((p) => p.stock <= 0);
  const totalRevenue = products.reduce((s, p) => s + p.price * p.reviewCount, 0);
  const unreadMessages = messages.filter((m) => !m.read);

  const stats = [
    { label: "Total Products", value: products.length, icon: Package, color: "text-gold" },
    { label: "Reviews", value: reviews.length, icon: Star, color: "text-pink" },
    { label: "Low Stock", value: lowStock.length + outOfStock.length, icon: AlertTriangle, color: "text-orange-400" },
    { label: "Messages", value: unreadMessages.length, icon: MessageSquare, color: "text-blue-400" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Dashboard Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-luxury-dark border border-luxury-border rounded-xl p-4">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Low stock alerts */}
      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="bg-luxury-dark border border-orange-500/30 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Inventory Alerts</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {[...outOfStock, ...lowStock].map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-white/80">{p.name}</span>
                <Badge variant="outline" className={p.stock <= 0 ? "border-red-500/50 text-red-400 text-[10px]" : "border-orange-500/50 text-orange-400 text-[10px]"}>
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
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-gold" />Recent Messages</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {messages.slice(0, 5).map((m) => (
              <div key={m.id} className={`flex items-start gap-3 p-2 rounded-lg text-sm ${!m.read ? "bg-luxury-gray/50" : ""}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-pink flex items-center justify-center text-luxury-black font-bold text-xs flex-shrink-0">{m.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><span className="text-white font-medium">{m.name}</span><span className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleDateString()}</span></div>
                  <p className="text-muted-foreground text-xs truncate">{m.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────── Products Tab ─────────── */
function ProductsTab({ products, onRefresh }: { products: Product[]; onRefresh: () => void }) {
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<Record<string, string | number | boolean>>({});
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setIsNew(true);
    setForm({ name: "", description: "", price: 0, originalPrice: "", image: "", category: "Bundles", badge: "", stock: 50, lowStockThreshold: 5, featured: false, active: true, lengths: [], colors: [] });
    setEditProduct(null);
  };

  const openEdit = (p: Product) => {
    setIsNew(false);
    setEditProduct(p);
    setForm({ ...p });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setForm((f) => ({ ...f, image: data.url }));
        toast.success("Image uploaded");
      }
    } catch { toast.error("Upload failed"); }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) { setForm((f) => ({ ...f, image: data.url })); toast.success("Image uploaded"); }
    } catch { toast.error("Upload failed"); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = isNew ? "/api/products" : "/api/products";
      const method = isNew ? "POST" : "PUT";
      const body = isNew ? form : { id: editProduct?.id, ...form };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) { toast.success(isNew ? "Product created" : "Product updated"); setEditProduct(null); onRefresh(); }
      else toast.error("Failed to save");
    } catch { toast.error("Network error"); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Product deleted"); onRefresh(); }
    } catch { toast.error("Failed to delete"); }
  };

  const toggleActive = async (p: Product) => {
    try {
      const res = await fetch("/api/products", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id, active: !p.active }) });
      if (res.ok) onRefresh();
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Products</h2>
        <Button onClick={openNew} className="gold-gradient text-luxury-black font-semibold rounded-full px-4 text-sm"><Plus className="w-4 h-4 mr-1" />Add Product</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="bg-luxury-dark border border-luxury-border rounded-xl overflow-hidden">
            <div className="relative aspect-video bg-luxury-gray">
              {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-luxury-border" /></div>}
              <div className="absolute top-2 right-2 flex gap-1">
                <Badge className={`text-[10px] ${p.active ? "bg-green-600 text-white" : "bg-luxury-gray text-muted-foreground"}`}>{p.active ? "Active" : "Inactive"}</Badge>
              </div>
            </div>
            <div className="p-3">
              <h3 className="text-sm font-semibold text-white truncate">{p.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gold font-bold">${p.price}</span>
                {p.originalPrice && <span className="text-xs text-muted-foreground line-through">${p.originalPrice}</span>}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px] border-luxury-border text-muted-foreground">{p.category}</Badge>
                <span className={`text-xs ${p.stock <= p.lowStockThreshold ? "text-orange-400" : "text-green-400"}`}>Stock: {p.stock}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="flex-1 border-luxury-border text-white/70 hover:text-gold hover:border-gold text-xs h-8" onClick={() => openEdit(p)}><Pencil className="w-3 h-3 mr-1" />Edit</Button>
                <Button size="sm" variant="outline" className="border-luxury-border text-white/70 hover:text-pink h-8 w-8 p-0" onClick={() => toggleActive(p)}>{p.active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}</Button>
                <Button size="sm" variant="outline" className="border-luxury-border text-white/70 hover:text-red-400 h-8 w-8 p-0" onClick={() => handleDelete(p.id)}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editProduct !== null || isNew} onOpenChange={() => { setEditProduct(null); setIsNew(false); }}>
        <DialogContent className="bg-luxury-dark border-luxury-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{isNew ? "Add Product" : "Edit Product"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">{isNew ? "Create a new product" : "Update product details"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Image Upload */}
            <div>
              <label className="text-sm text-white/80 mb-1 block">Product Image</label>
              <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className="relative border-2 border-dashed border-luxury-border rounded-xl p-6 text-center hover:border-gold/50 transition-colors cursor-pointer" onClick={() => document.getElementById("admin-img-upload")?.click()}>
                {form.image ? <img src={form.image as string} alt="" className="max-h-40 mx-auto rounded-lg" /> : <div className="py-4"><Upload className="w-8 h-8 text-luxury-border mx-auto mb-2" /><p className="text-sm text-muted-foreground">Drag & drop or click to upload</p></div>}
                <input id="admin-img-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="text-sm text-white/80 mb-1 block">Name *</label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-luxury-gray border-luxury-border text-white" /></div>
              <div><label className="text-sm text-white/80 mb-1 block">Category</label><Select value={form.category as string} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger className="bg-luxury-gray border-luxury-border text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-luxury-dark border-luxury-border">{["Bundles", "Frontals", "Closures", "Wigs"].map((c) => <SelectItem key={c} value={c} className="text-white">{c}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><label className="text-sm text-white/80 mb-1 block">Description</label><Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-luxury-gray border-luxury-border text-white" rows={3} /></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div><label className="text-sm text-white/80 mb-1 block">Price *</label><Input type="number" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="bg-luxury-gray border-luxury-border text-white" /></div>
              <div><label className="text-sm text-white/80 mb-1 block">Original Price</label><Input type="number" value={form.originalPrice || ""} onChange={(e) => setForm({ ...form, originalPrice: e.target.value ? Number(e.target.value) : null })} className="bg-luxury-gray border-luxury-border text-white" /></div>
              <div><label className="text-sm text-white/80 mb-1 block">Stock</label><Input type="number" value={form.stock || ""} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="bg-luxury-gray border-luxury-border text-white" /></div>
              <div><label className="text-sm text-white/80 mb-1 block">Low Stock At</label><Input type="number" value={form.lowStockThreshold || ""} onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })} className="bg-luxury-gray border-luxury-border text-white" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm text-white/80 mb-1 block">Badge</label><Input value={form.badge || ""} onChange={(e) => setForm({ ...form, badge: e.target.value })} className="bg-luxury-gray border-luxury-border text-white" placeholder="Best Seller" /></div>
              <div className="flex items-end gap-4 pb-1">
                <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer"><input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-gold" />Featured</label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving || !form.name || !form.price} className="flex-1 gold-gradient text-luxury-black font-semibold rounded-full py-3">{saving ? "Saving..." : isNew ? "Create Product" : "Save Changes"}</Button>
              <Button variant="outline" onClick={() => { setEditProduct(null); setIsNew(false); }} className="border-luxury-border text-white/70 rounded-full">Cancel</Button>
            </div>
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
      setReviews(data.reviews || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      await fetch("/api/reviews", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, approved }) });
      toast.success(approved ? "Review approved" : "Review hidden");
      fetchReviews();
      onRefresh();
    } catch { toast.error("Failed"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
      toast.success("Review deleted");
      fetchReviews();
      onRefresh();
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Reviews</h2>
      {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div> :
      reviews.length === 0 ? <div className="text-center py-12 text-muted-foreground">No reviews yet</div> :
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className={`bg-luxury-dark border rounded-xl p-4 ${r.approved ? "border-luxury-border" : "border-orange-500/30"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-semibold text-sm">{r.author}</span>
                  <span className="text-xs text-muted-foreground">{r.email}</span>
                  {!r.approved && <Badge className="bg-orange-500/20 text-orange-400 text-[10px] border-0">Pending</Badge>}
                </div>
                <div className="flex gap-0.5 mb-2">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? "text-gold fill-gold" : "text-luxury-border"}`} />)}</div>
                {r.title && <p className="text-white text-sm font-medium">{r.title}</p>}
                <p className="text-muted-foreground text-sm">{r.text}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{r.product?.name}</span>
                  <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <Button size="sm" variant="outline" className="border-luxury-border text-white/70 hover:text-gold hover:border-gold h-7 w-7 p-0" onClick={() => handleApprove(r.id, !r.approved)}>
                  {r.approved ? <EyeOff className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                </Button>
                <Button size="sm" variant="outline" className="border-luxury-border text-white/70 hover:text-red-400 h-7 w-7 p-0" onClick={() => handleDelete(r.id)}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}

/* ─────────── Settings Tab ─────────── */
function SettingsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => { setSettings(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings }) });
      toast.success("Settings saved");
    } catch { toast.error("Failed to save"); }
    setSaving(false);
  };

  const fields = [
    { key: "whatsapp_number", label: "WhatsApp Number", placeholder: "1234567890", icon: Send },
    { key: "email", label: "Contact Email", placeholder: "hello@lacellehair.com", icon: null },
    { key: "phone", label: "Phone Number", placeholder: "+1 (800) LACELLE-HR", icon: null },
    { key: "promo_code", label: "Promo Code", placeholder: "LUXE20", icon: null },
    { key: "instagram", label: "Instagram URL", placeholder: "https://instagram.com/lacellehair", icon: null },
    { key: "facebook", label: "Facebook URL", placeholder: "https://facebook.com/lacellehair", icon: null },
    { key: "tiktok", label: "TikTok URL", placeholder: "https://tiktok.com/@lacellehair", icon: null },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <Button onClick={handleSave} disabled={saving} className="gold-gradient text-luxury-black font-semibold rounded-full px-4 text-sm"><Check className="w-4 h-4 mr-1" />{saving ? "Saving..." : "Save"}</Button>
      </div>
      {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div> :
      <div className="bg-luxury-dark border border-luxury-border rounded-xl p-6 space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-sm text-white/80 mb-1 block">{f.label}</label>
            <Input value={settings[f.key] || ""} onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })} placeholder={f.placeholder} className="bg-luxury-gray border-luxury-border text-white" />
          </div>
        ))}
      </div>}
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
      setMessages(data || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const markRead = async (id: string) => {
    try {
      await fetch("/api/contact", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, read: true }) });
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
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Messages</h2>
      {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div> :
      messages.length === 0 ? <div className="text-center py-12 text-muted-foreground">No messages yet</div> :
      <div className="space-y-3">
        {messages.map((m) => (
          <div key={m.id} onClick={() => !m.read && markRead(m.id)} className={`bg-luxury-dark border rounded-xl p-4 cursor-pointer transition-colors ${!m.read ? "border-gold/30 bg-gold/5" : "border-luxury-border"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {!m.read && <div className="w-2 h-2 rounded-full bg-gold" />}
                  <span className="text-white font-semibold text-sm">{m.name}</span>
                  <span className="text-xs text-muted-foreground">{m.email}</span>
                </div>
                {m.subject && <p className="text-gold text-xs mb-1">{m.subject}</p>}
                <p className="text-muted-foreground text-sm">{m.message}</p>
                <p className="text-xs text-muted-foreground/60 mt-2">{new Date(m.createdAt).toLocaleString()}</p>
              </div>
              <Button size="sm" variant="outline" className="border-luxury-border text-white/70 hover:text-red-400 h-8 w-8 p-0 flex-shrink-0" onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }}><Trash2 className="w-3 h-3" /></Button>
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}

/* ─────────── Main Admin Panel ─────────── */
export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [messages, setMessages] = useState<ContactMsg[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (localStorage.getItem("lacelle_admin") === "true") setAuthenticated(true);
  }, []);

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

  useEffect(() => { if (authenticated) fetchAll(); }, [authenticated, fetchAll]);

  const handleLogout = () => {
    localStorage.removeItem("lacelle_admin");
    setAuthenticated(false);
  };

  if (!authenticated) return <AdminLogin onLogin={() => setAuthenticated(true)} />;

  const tabs = [
    { value: "dashboard", label: "Dashboard", icon: BarChart3 },
    { value: "products", label: "Products", icon: Package },
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
              <a href="/" className="flex items-center gap-2 text-white/70 hover:text-gold transition-colors text-sm">
                <ChevronLeft className="w-4 h-4" />Store
              </a>
              <Separator orientation="vertical" className="h-6 bg-luxury-border" />
              <h1 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                LACELLE <span className="text-pink">HAIR</span>
              </h1>
              <Badge variant="outline" className="border-pink/30 text-pink text-[10px]">Admin</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-pink">
              <LogOut className="w-4 h-4 mr-1" />Logout
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
                <TabsTrigger key={t.value} value={t.value} className="data-[state=active]:bg-pink data-[state=active]:text-white text-white/70 rounded-lg px-4 flex items-center gap-2 text-sm">
                  <t.icon className="w-4 h-4" />{t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="dashboard"><DashboardTab products={products} reviews={reviews} messages={messages} /></TabsContent>
            <TabsContent value="products"><ProductsTab products={products} onRefresh={fetchAll} /></TabsContent>
            <TabsContent value="reviews"><ReviewsTab onRefresh={fetchAll} /></TabsContent>
            <TabsContent value="messages"><MessagesTab onRefresh={fetchAll} /></TabsContent>
            <TabsContent value="settings"><SettingsTab /></TabsContent>
          </Tabs>
        </div>

        {/* Mobile Bottom Tabs */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-luxury-dark border-t border-luxury-border z-50 flex safe-area-inset-bottom">
          {tabs.map((t) => (
            <button key={t.value} onClick={() => setActiveTab(t.value)} className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${activeTab === t.value ? "text-pink" : "text-muted-foreground"}`}>
              <t.icon className="w-5 h-5" />
              <span className="text-[10px]">{t.label}</span>
            </button>
          ))}
        </div>
        <div className="md:hidden pb-20">
          {activeTab === "dashboard" && <DashboardTab products={products} reviews={reviews} messages={messages} />}
          {activeTab === "products" && <ProductsTab products={products} onRefresh={fetchAll} />}
          {activeTab === "reviews" && <ReviewsTab onRefresh={fetchAll} />}
          {activeTab === "messages" && <MessagesTab onRefresh={fetchAll} />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}
