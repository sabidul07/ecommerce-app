import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

export const revalidate = 0;

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!product) notFound();

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <ProductForm initialData={product} isEditing={true} />
    </div>
  );
}
