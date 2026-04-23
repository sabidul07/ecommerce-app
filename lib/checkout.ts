import { createServerSupabaseClient } from "@/lib/supabase-server";

export type CheckoutItem = {
  productId: string;
  quantity: number;
};

export type CheckoutRequest = {
  items?: CheckoutItem[];
};

export class CheckoutError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "CheckoutError";
    this.status = status;
  }
}

export async function getVerifiedCheckout(items: CheckoutItem[] = []) {
  const validItems = items.filter(
    (item) =>
      typeof item.productId === "string" &&
      item.productId.length > 0 &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0,
  );

  if (validItems.length === 0 || validItems.length !== items.length) {
    throw new CheckoutError("Your bag has invalid items. Please refresh and try again.");
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new CheckoutError("Please sign in again before placing the order.", 401);
  }

  const quantities = new Map<string, number>();
  for (const item of validItems) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }

  const productIds = Array.from(quantities.keys());
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, price")
    .in("id", productIds);

  if (productsError) {
    throw new CheckoutError(`Failed to verify products: ${productsError.message}`, 500);
  }

  if (!products || products.length !== productIds.length) {
    throw new CheckoutError("Some products in your bag are no longer available.");
  }

  const total = products.reduce((sum, product) => {
    const quantity = quantities.get(product.id) ?? 0;
    return sum + Number(product.price) * quantity;
  }, 0);

  return {
    productIds,
    quantities,
    supabase,
    total,
    user,
  };
}

export async function createMarketplaceOrder(items: CheckoutItem[]) {
  const { productIds, quantities, supabase, total, user } = await getVerifiedCheckout(items);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ user_id: user.id, total })
    .select("id")
    .single();

  if (orderError || !order) {
    throw new CheckoutError(
      `Failed to create order: ${orderError?.message ?? "No order returned."}`,
      500,
    );
  }

  const orderItems = productIds.map((productId) => ({
    order_id: order.id,
    product_id: productId,
    quantity: quantities.get(productId) ?? 0,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    throw new CheckoutError(`Failed to process order items: ${itemsError.message}`, 500);
  }

  return { orderId: order.id, total };
}
