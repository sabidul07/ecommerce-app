"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function restockProduct(productId: string, amount: number = 10) {
  const supabase = createServerSupabaseClient();
  
  // Get current inventory
  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("inventory_count")
    .eq("id", productId)
    .single();
    
  if (fetchError) throw new Error("Product not found");

  const newCount = (product.inventory_count || 0) + amount;

  const { error } = await supabase
    .from("products")
    .update({ inventory_count: newCount })
    .eq("id", productId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  return { success: true, newCount };
}
