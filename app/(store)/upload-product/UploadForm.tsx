"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { UploadCloud, X, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState("");

  // Compress image to max 800px width, JPEG 80% quality
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = document.createElement("img");
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => {
          resolve(new File([blob!], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
        }, "image/jpeg", 0.8);
      };
      img.src = url;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    setError("");
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const fakeEvent = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(fakeEvent);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Please enter a valid price.");
      setLoading(false);
      return;
    }

    let imageUrl: string | null = null;

    if (imageFile) {
      setUploadProgress("Compressing image…");
      const compressed = await compressImage(imageFile);
      setUploadProgress("Uploading image…");
      const fileName = `${user.id}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, compressed, { upsert: false, contentType: "image/jpeg" });

      if (uploadError) {
        setError(`Image upload failed: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);

      imageUrl = urlData.publicUrl;
    }

    const { error: insertError } = await supabase.from("products").insert({
      title,
      price: parsedPrice,
      image: imageUrl,
      user_id: user.id,
    });

    if (insertError) {
      setError(`Failed to create product: ${insertError.message}`);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="page-container max-w-2xl mx-auto">
      <div className="mb-10">
        <p className="text-gold tracking-[0.3em] text-xs mb-2">NEW LISTING</p>
        <h1 className="section-title">List a Product</h1>
        <p className="text-stone text-sm mt-2">
          Share something exceptional with the community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Image Upload */}
        <div>
          <label className="text-xs tracking-widest text-stone block mb-3">
            PRODUCT IMAGE
          </label>
          <div
            onClick={() => !imagePreview && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`relative border-2 border-dashed transition-colors ${imagePreview
                ? "border-stone-light"
                : "border-stone-light hover:border-stone cursor-pointer"
              }`}
          >
            {imagePreview ? (
              <div className="relative aspect-video">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute top-3 right-3 bg-ink text-parchment p-1.5 hover:bg-rust transition-colors"
                >
                  <X size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-3 right-3 bg-parchment text-ink text-xs px-3 py-1.5 hover:bg-stone-light transition-colors border border-stone-light"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center gap-3 text-stone">
                <UploadCloud size={36} className="opacity-40" />
                <div className="text-center">
                  <p className="text-sm font-medium text-ink">
                    Drop image here
                  </p>
                  <p className="text-xs mt-1">
                    or click to browse · PNG, JPG, WEBP up to 5MB
                  </p>
                </div>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Title */}
        <div>
          <label className="text-xs tracking-widest text-stone block mb-2">
            PRODUCT TITLE
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="e.g. Hand-thrown Ceramic Vase"
            required
            maxLength={120}
          />
          <p className="text-xs text-stone mt-1 text-right">
            {title.length}/120
          </p>
        </div>

        {/* Price */}
        <div>
          <label className="text-xs tracking-widest text-stone block mb-2">
            PRICE (INR)
          </label>
          <div className="relative">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-stone text-sm pb-px">
              ₹
            </span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input-field pl-5"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
            />
          </div>
        </div>

        {error && (
          <div className="bg-rust/10 border border-rust/20 text-rust text-sm px-4 py-3">
            {error}
          </div>
        )}

        <div className="flex gap-4 pt-4 border-t border-stone-light">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-parchment/30 border-t-parchment rounded-full animate-spin" />
                {uploadProgress || "Publishing…"}
              </span>
            ) : (
              <>
                Publish Product <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
