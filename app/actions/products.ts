"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function upsertProduct(formData: any, productId?: string) {
  const supabase = createServerSupabaseClient();
  
  // Basic product data
  const productData = {
    title: formData.title,
    slug: formData.slug || formData.title.toLowerCase().replace(/ /g, '-'),
    description: formData.description,
    price: formData.price,
    compare_at_price: formData.compare_at_price,
    sku: formData.sku,
    inventory_count: formData.inventory_count,
    status: formData.status,
    is_featured: formData.is_featured,
    category_id: formData.category_id,
    specifications: formData.specifications,
    seo_title: formData.seo_title,
    seo_description: formData.seo_description,
    user_id: (await supabase.auth.getUser()).data.user?.id
  };

  let result;
  if (productId) {
    result = await supabase
      .from("products")
      .update(productData)
      .eq("id", productId)
      .select()
      .single();
  } else {
    result = await supabase
      .from("products")
      .insert(productData)
      .select()
      .single();
  }

  if (result.error) throw new Error(result.error.message);

  revalidatePath("/admin/products");
  revalidatePath("/");
  
  return { success: true, product: result.data };
}

export async function deleteProduct(id: string) {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  return { success: true };
}
