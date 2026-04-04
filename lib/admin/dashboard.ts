import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdminAccess } from "@/lib/auth/admin";

export type AdminDashboardMetrics = {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  preorderProducts: number;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  todayOrders: number;
};

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  await requireAdminAccess();
  const supabase = await createSupabaseServerClient();

  // Products metrics - cast to any to avoid strict type issues
  const productsTable = (supabase as any).from("products");
  const { data: products, error: productsError } = await productsTable
    .select("id, active, is_preorder")
    .order("created_at", { ascending: false });

  if (productsError) {
    console.error("[admin-dashboard] Error loading products:", productsError.message);
  }

  const productsList = (products ?? []) as Array<{
    id: string;
    active: boolean;
    is_preorder: boolean;
  }>;

  // Inventory out-of-stock count
  const inventoryTable = (supabase as any).from("inventory");
  const { data: inventory, error: inventoryError } = await inventoryTable
    .select("product_id, available_quantity");

  if (inventoryError) {
    console.error("[admin-dashboard] Error loading inventory:", inventoryError.message);
  }

  const inventoryMap = new Map<string, number>(
    ((inventory ?? []) as Array<{ product_id: string; available_quantity: number }>).map(
      (row) => [row.product_id, row.available_quantity],
    ),
  );

  const outOfStockProducts = productsList.filter((p) => {
    const stock = inventoryMap.get(p.id) ?? 0;
    return stock === 0 && p.active;
  }).length;

  // Orders metrics
  const ordersTable = (supabase as any).from("orders");
  const { data: orders, error: ordersError } = await ordersTable
    .select("id, status, created_at");

  if (ordersError) {
    console.error("[admin-dashboard] Error loading orders:", ordersError.message);
  }

  const ordersList = (orders ?? []) as Array<{
    id: string;
    status: string;
    created_at: string;
  }>;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayOrders = ordersList.filter((o) => {
    return new Date(o.created_at) >= todayStart;
  }).length;

  return {
    totalProducts: productsList.length,
    activeProducts: productsList.filter((p) => p.active).length,
    outOfStockProducts,
    preorderProducts: productsList.filter((p) => p.is_preorder && p.active).length,
    totalOrders: ordersList.length,
    paidOrders: ordersList.filter((o) => o.status === "paid").length,
    pendingOrders: ordersList.filter((o) =>
      o.status === "pending_checkout" || o.status === "checkout_created",
    ).length,
    todayOrders,
  };
}
