"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData?.user) {
      // Check profile for admin status
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", authData.user.id)
        .single();

      if (profile?.is_admin) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink text-parchment flex-col justify-between p-16">
        <Link href="/" className="font-display text-2xl tracking-widest">
          ATELIER
        </Link>
        <div>
          <p className="text-gold tracking-[0.3em] text-xs mb-4">WELCOME BACK</p>
          <h2 className="font-display text-5xl font-light leading-tight mb-6">
            Your curated<br />
            <em className="italic text-gold-light">marketplace</em><br />
            awaits.
          </h2>
          <p className="text-stone-light text-sm leading-relaxed max-w-xs">
            Sign in to manage your listings, track orders, and discover new pieces.
          </p>
        </div>
        <p className="text-stone text-xs">© 2024 Atelier. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <Link href="/" className="lg:hidden font-display text-2xl tracking-widest block mb-8">
              ATELIER
            </Link>
            <h1 className="font-display text-4xl font-light mb-2">Sign In</h1>
            <p className="text-stone text-sm">
              No account?{" "}
              <Link href="/signup" className="text-ink underline underline-offset-2 hover:text-gold transition-colors">
                Create one
              </Link>
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-xs tracking-widest text-stone block mb-2">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-xs tracking-widest text-stone block mb-2">PASSWORD</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-stone hover:text-ink transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-rust/10 border border-rust/20 text-rust text-sm px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-parchment/30 border-t-parchment rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
