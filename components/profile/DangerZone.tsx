"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { AlertTriangle } from "lucide-react";

interface Props {
  email: string;
}

export default function DangerZone({ email }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmEmail !== email) {
      setError("Email doesn't match. Please try again.");
      return;
    }
    setDeleting(true);
    setError("");

    const res = await fetch("/api/account/delete", { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json();
      setError(body.error || "Deletion failed. Please try again.");
      setDeleting(false);
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <>
      <div className="border border-rust/30 p-5">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle size={18} className="text-rust mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-rust">Delete account</h3>
            <p className="text-xs text-stone mt-1 leading-relaxed">
              Permanently deletes your account and all associated data including orders, addresses, and product listings. This action cannot be undone and is compliant with DPDP data rights.
            </p>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="text-sm border border-rust text-rust px-4 py-2 hover:bg-rust hover:text-white transition-colors"
        >
          Delete my account
        </button>
      </div>

      {/* Confirmation modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-xs px-4">
          <div className="bg-white max-w-md w-full p-6 shadow-2xl">
            <h2 className="font-display text-xl font-light text-ink mb-2">Are you absolutely sure?</h2>
            <p className="text-sm text-stone mb-5">
              This will permanently delete your Atelier account. Type your email address <strong className="text-ink">{email}</strong> to confirm.
            </p>

            <div className="mb-4">
              <label className="block text-xs text-stone mb-1">Your email address</label>
              <input
                type="email"
                value={confirmEmail}
                onChange={(e) => { setConfirmEmail(e.target.value); setError(""); }}
                className="input-field text-sm"
                placeholder={email}
              />
            </div>

            {error && <p className="text-rust text-xs mb-3">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting || confirmEmail !== email}
                className="flex-1 bg-rust text-white text-sm py-2.5 font-medium hover:bg-rust/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Yes, delete my account"}
              </button>
              <button
                onClick={() => { setModalOpen(false); setConfirmEmail(""); setError(""); }}
                className="flex-1 border border-stone-light text-sm py-2.5 text-stone hover:text-ink transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
