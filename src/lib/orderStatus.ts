import { db, schema } from "@/lib/db"
import { eq } from "drizzle-orm"

const { Order: OrderTable } = schema

const STALE_PENDING_MINUTES = 60

export async function cancelStalePendingOrder(reference: string) {
  const [order] = await db.select({
    id: OrderTable.id,
    status: OrderTable.status,
    createdAt: OrderTable.createdAt,
    paidAt: OrderTable.paidAt,
  }).from(OrderTable).where(eq(OrderTable.reference, reference))

  if (!order) return null
  if (order.status !== "pending" || order.paidAt) return order

  const ageMs = Date.now() - new Date(order.createdAt).getTime()
  if (ageMs < STALE_PENDING_MINUTES * 60 * 1000) return order

  const [updated] = await db.update(OrderTable)
    .set({ status: "cancelled", updatedAt: new Date().toISOString() })
    .where(eq(OrderTable.id, order.id))
    .returning()

  return updated
}
