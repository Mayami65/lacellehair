import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core"
import { relations } from "drizzle-orm"

const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID())
const now = () => new Date().toISOString()

export const Product = sqliteTable("Product", {
  id: id(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  price: real("price").notNull(),
  originalPrice: real("originalPrice"),
  image: text("image").notNull().default(""),
  images: text("images").notNull().default("[]"),
  category: text("category").notNull().default("Bundles"),
  badge: text("badge").notNull().default(""),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("reviewCount").notNull().default(0),
  stock: integer("stock").notNull().default(50),
  lowStockThreshold: integer("lowStockThreshold").notNull().default(5),
  lengths: text("lengths").notNull().default("[]"),
  colors: text("colors").notNull().default("[]"),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("createdAt").notNull().$defaultFn(now),
  updatedAt: text("updatedAt").notNull().$defaultFn(now),
})

export const ProductVariant = sqliteTable("ProductVariant", {
  id: id(),
  productId: text("productId").notNull().references(() => Product.id, { onDelete: "cascade" }),
  length: text("length").notNull().default(""),
  color: text("color").notNull().default(""),
  price: real("price").notNull(),
  originalPrice: real("originalPrice"),
  stock: integer("stock").notNull().default(50),
  sku: text("sku").notNull().default(""),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("createdAt").notNull().$defaultFn(now),
  updatedAt: text("updatedAt").notNull().$defaultFn(now),
})

export const Review = sqliteTable("Review", {
  id: id(),
  productId: text("productId").notNull().references(() => Product.id, { onDelete: "cascade" }),
  author: text("author").notNull(),
  email: text("email").notNull().default(""),
  rating: integer("rating").notNull(),
  title: text("title").notNull().default(""),
  text: text("text").notNull(),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  approved: integer("approved", { mode: "boolean" }).notNull().default(false),
  createdAt: text("createdAt").notNull().$defaultFn(now),
})

export const Settings = sqliteTable("Settings", {
  id: id(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: text("updatedAt").notNull().$defaultFn(now),
})

export const Order = sqliteTable("Order", {
  id: id(),
  reference: text("reference").notNull().unique(),
  email: text("email").notNull(),
  fullName: text("fullName").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull().default(""),
  city: text("city").notNull().default(""),
  state: text("state").notNull().default(""),
  country: text("country").notNull().default("Ghana"),
  items: text("items").notNull(),
  subtotal: real("subtotal").notNull(),
  shippingFee: real("shippingFee").notNull().default(0),
  totalAmount: real("totalAmount").notNull(),
  currency: text("currency").notNull().default("GHS"),
  paystackRef: text("paystackRef").notNull().default(""),
  status: text("status").notNull().default("pending"),
  trackingNumber: text("trackingNumber"),
  paymentMethod: text("paymentMethod").notNull().default("paystack"),
  paidAt: text("paidAt"),
  createdAt: text("createdAt").notNull().$defaultFn(now),
  updatedAt: text("updatedAt").notNull().$defaultFn(now),
})

export const ContactMessage = sqliteTable("ContactMessage", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  subject: text("subject").notNull().default(""),
  message: text("message").notNull(),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: text("createdAt").notNull().$defaultFn(now),
})

export const productRelations = relations(Product, ({ many }) => ({
  variants: many(ProductVariant),
  reviews: many(Review),
}))

export const productVariantRelations = relations(ProductVariant, ({ one }) => ({
  product: one(Product, { fields: [ProductVariant.productId], references: [Product.id] }),
}))

export const reviewRelations = relations(Review, ({ one }) => ({
  product: one(Product, { fields: [Review.productId], references: [Product.id] }),
}))
