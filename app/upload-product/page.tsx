import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import UploadForm from "./UploadForm";

export default async function UploadProductPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/dashboard");

  return <UploadForm />;
}
