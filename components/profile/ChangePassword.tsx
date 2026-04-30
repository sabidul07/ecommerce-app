"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface Props {
  isOAuthUser: boolean;
}

export default function ChangePassword({ isOAuthUser }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isValid =
    form.next.length >= 8 &&
    form.next === form.confirm &&
    form.current.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: form.next });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Password updated successfully." });
      setForm({ current: "", next: "", confirm: "" });
    }
    setSaving(false);
  };

  if (isOAuthUser) {
    return (
      <div className="border border-stone-light p-5 bg-parchment/50">
        <p className="text-sm text-stone">
          You signed in with <span className="font-semibold text-ink">Google</span>. Password management is handled by Google — you don't have a local password set.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-stone-light">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-parchment/50 transition-colors text-left"
      >
        <span className="text-sm font-medium text-ink">Change Password</span>
        {open ? <ChevronUp size={16} className="text-stone" /> : <ChevronDown size={16} className="text-stone" />}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4 border-t border-stone-light pt-4">
          {[
            { id: "current", label: "Current password", key: "current" as const },
            { id: "next", label: "New password", key: "next" as const },
            { id: "confirm", label: "Confirm new password", key: "confirm" as const },
          ].map(({ id, label, key }) => (
            <div key={id}>
              <label className="block text-xs text-stone mb-1">{label}</label>
              <input
                id={id}
                type="password"
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                required
                className="input-field text-sm"
              />
            </div>
          ))}

          {/* Validation hints */}
          <div className="space-y-1">
            <p className={`text-xs flex items-center gap-1 ${form.next.length >= 8 ? "text-green-600" : "text-stone"}`}>
              <span>{form.next.length >= 8 ? "✓" : "○"}</span> At least 8 characters
            </p>
            <p className={`text-xs flex items-center gap-1 ${form.next && form.next === form.confirm ? "text-green-600" : "text-stone"}`}>
              <span>{form.next && form.next === form.confirm ? "✓" : "○"}</span> Passwords match
            </p>
          </div>

          {message && (
            <p className={`text-xs ${message.type === "success" ? "text-green-600" : "text-rust"}`}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={!isValid || saving}
            className="btn-primary text-sm py-2 px-5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Update password"}
          </button>
        </form>
      )}
    </div>
  );
}
