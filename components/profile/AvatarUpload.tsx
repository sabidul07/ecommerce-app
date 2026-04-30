"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Trash2, User } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface Props {
  userId: string;
  avatarUrl: string | null;
  fullName: string;
  onUpdate?: (url: string | null) => void;
}

export default function AvatarUpload({ userId, avatarUrl, fullName, onUpdate = () => { } }: Props) {
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Only JPG and PNG files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB.");
      return;
    }

    // Instant circular preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setError("");
    setUploading(true);

    const supabase = createClient();
    const path = `${userId}/avatar.${file.name.split(".").pop()}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError("Upload failed. Please try again.");
      setPreview(avatarUrl);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = data.publicUrl + `?t=${Date.now()}`; // cache-bust

    // Save to profile
    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    onUpdate(publicUrl);
    setPreview(publicUrl);
    setUploading(false);
  };

  const handleRemove = async () => {
    const supabase = createClient();
    setUploading(true);

    await supabase.storage
      .from("avatars")
      .remove([`${userId}/avatar.jpg`, `${userId}/avatar.png`]);

    await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", userId);

    onUpdate(null);
    setPreview(null);
    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar circle */}
      <div className="relative w-24 h-24">
        {preview ? (
          <Image
            src={preview}
            alt="Avatar"
            fill
            unoptimized
            className="rounded-full object-cover ring-2 ring-gold/30"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center">
            <span className="font-display text-2xl text-gold font-medium">{initials}</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-ink/50 flex items-center justify-center">
            <span className="w-5 h-5 border-2 border-parchment/30 border-t-parchment rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 text-sm border border-stone-light px-3 py-1.5 hover:border-gold hover:text-gold transition-colors disabled:opacity-50"
        >
          <Camera size={14} />
          {preview ? "Change photo" : "Upload photo"}
        </button>
        {preview && (
          <button
            onClick={handleRemove}
            disabled={uploading}
            className="flex items-center gap-2 text-sm text-rust hover:text-rust/70 transition-colors disabled:opacity-50"
          >
            <Trash2 size={14} />
            Remove
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="text-rust text-xs">{error}</p>}
      <p className="text-stone text-xs">JPG or PNG, max 5MB</p>
    </div>
  );
}
