import { db } from "@/lib/db";

const STALE_PENDING_MINUTES = 60;

export async function cancelStalePendingOrder(reference: string) {
  const order = await db.order.findFirst({
    where: { reference },
    select: { id: true, status: true, createdAt: true, paidAt: true },
  });

  if (!order) return null;
  if (order.status !== "pending" || order.paidAt) return order;

  const ageMs = Date.now() - order.createdAt.getTime();
  if (ageMs < STALE_PENDING_MINUTES * 60 * 1000) return order;

  return db.order.update({
    where: { id: order.id },
    data: { status: "cancelled" },
  });
}
