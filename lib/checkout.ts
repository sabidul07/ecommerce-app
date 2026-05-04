import { createServerSupabaseClient } from "@/lib/supabase-server";

export type CheckoutItem = {
  productId: string;
  quantity: number;
};

export type CheckoutRequest = {
  items?: CheckoutItem[];
  deliveryMethod?: string;
};

export class CheckoutError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "CheckoutError";
    this.status = status;
  }
}

export async function getVerifiedCheckout(items: CheckoutItem[] = [], deliveryMethod: string = "standard") {
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

  const subtotal = products.reduce((sum, product) => {
    const quantity = quantities.get(product.id) ?? 0;
    return sum + Number(product.price) * quantity;
  }, 0);

  // Calculate tax and shipping server-side to match frontend
  const tax = subtotal * 0.18;
  const shipping = deliveryMethod === "express" ? 250 : (subtotal > 2000 ? 0 : 150);
  const total = subtotal + tax + shipping;

  return {
    productIds,
    quantities,
    supabase,
    subtotal,
    tax,
    shipping,
    total,
    user,
  };
}

export async function createMarketplaceOrder(items: CheckoutItem[], deliveryMethod: string = "standard") {
  const { productIds, quantities, supabase, total, user } = await getVerifiedCheckout(items, deliveryMethod);

  // Insert order with 'Paid' status since this is called after payment verification
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ 
      user_id: user.id, 
      total,
      status: 'Paid' // Update status to Paid
    })
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

  // Record payment in the payments table for the admin dashboard
  await supabase.from("payments").insert({
    order_id: order.id,
    amount: total,
    status: 'Succeeded'
  });

  // Award Loyalty Points (1 point per ₹100)
  const earnedPoints = Math.floor(total / 100);
  const { data: loyalty } = await supabase
    .from("loyalty_points")
    .select("points, history")
    .eq("user_id", user.id)
    .single();

  const newPoints = (loyalty?.points || 0) + earnedPoints;
  let newTier = 'Bronze';
  if (newPoints >= 5000) newTier = 'Platinum';
  else if (newPoints >= 2000) newTier = 'Gold';
  else if (newPoints >= 500) newTier = 'Silver';

  await supabase.from("loyalty_points").upsert({
    user_id: user.id,
    points: newPoints,
    tier: newTier,
    updated_at: new Date().toISOString(),
    history: [
      ...(loyalty?.history || []),
      { order_id: order.id, points_earned: earnedPoints, date: new Date().toISOString() }
    ]
  });

  return { orderId: order.id, total };
}

