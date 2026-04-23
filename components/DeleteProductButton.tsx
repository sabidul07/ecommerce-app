"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface Props {
  productId: string;
  imageUrl: string | null;
}

export default function DeleteProductButton({ productId, imageUrl }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setLoading(true);

    const supabase = createClient();

    // Remove image from storage if present
    if (imageUrl) {
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split("/object/public/images/");
      if (pathParts[1]) {
        await supabase.storage.from("images").remove([pathParts[1]]);
      }
    }

    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (!error) {
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-stone hover:text-rust transition-colors disabled:opacity-40 self-start"
      title="Delete product"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-stone/30 border-t-stone rounded-full animate-spin block" />
      ) : (
        <Trash2 size={16} />
      )}
    </button>
  );
}
