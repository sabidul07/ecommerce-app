import { createServerSupabaseClient } from "@/lib/supabase-server";
import ProductForm from "@/components/admin/ProductForm";
import { redirect } from "next/navigation";

export default async function NewProductPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: categories } = await supabase.from("categories").select("*").order("name");

  return (
    <div className="bg-[#0A0A0A] min-h-screen">
      <ProductForm categories={categories || []} />
    </div>
  );
}
