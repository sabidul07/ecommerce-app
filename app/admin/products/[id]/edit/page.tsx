import { createServerSupabaseClient } from "@/lib/supabase-server";
import ProductForm from "@/components/admin/ProductForm";
import { redirect, notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: product },
    { data: categories }
  ] = await Promise.all([
    supabase.from("products").select("*").eq("id", params.id).single(),
    supabase.from("categories").select("*").order("name")
  ]);

  if (!product) notFound();

  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      <ProductForm initialData={product} categories={categories || []} />
    </div>
  );
}
