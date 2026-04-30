"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Chrome, Mail, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  provider: string;
  lastLogin: string;
  email: string;
}

export default function AccountSecurity({ provider, lastLogin, email }: Props) {
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  const handleSignOutAll = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "global" });
    router.replace("/login");
  };

  const formattedDate = lastLogin
    ? new Date(lastLogin).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Unknown";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Sign-in method */}
        <div className="border border-stone-light p-4">
          <p className="text-xs text-stone uppercase tracking-wider mb-2">Sign-in method</p>
          <div className="flex items-center gap-2">
            {provider === "google" ? (
              <Chrome size={16} className="text-gold" />
            ) : (
              <Mail size={16} className="text-gold" />
            )}
            <p className="text-sm font-medium text-ink capitalize">{provider}</p>
          </div>
        </div>

        {/* Last login */}
        <div className="border border-stone-light p-4">
          <p className="text-xs text-stone uppercase tracking-wider mb-2">Last login</p>
          <p className="text-sm font-medium text-ink">{formattedDate}</p>
        </div>

        {/* Email */}
        <div className="border border-stone-light p-4">
          <p className="text-xs text-stone uppercase tracking-wider mb-2">Email</p>
          <p className="text-sm font-medium text-ink truncate">{email}</p>
        </div>
      </div>

      <button
        onClick={handleSignOutAll}
        disabled={signingOut}
        className="flex items-center gap-2 text-sm border border-stone-light px-4 py-2 hover:border-rust hover:text-rust transition-colors disabled:opacity-50"
      >
        {signingOut ? (
          <span className="w-4 h-4 border-2 border-stone/30 border-t-stone rounded-full animate-spin" />
        ) : (
          <LogOut size={14} />
        )}
        Sign out of all devices
      </button>
    </div>
  );
}
