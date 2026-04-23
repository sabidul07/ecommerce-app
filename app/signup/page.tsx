"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    // Debug: log signup response to help diagnose confirmation vs session behavior
    // (useful during development to see if email confirmation is required)
    // eslint-disable-next-line no-console
    console.log("signup response:", { data, authError });

    // If no session returned, try an immediate sign-in for developer convenience.
    // This will fail if email confirmations are required by Supabase (expected).
    if (data && !data.session) {
      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!signInError) {
          router.push("/dashboard");
          router.refresh();
          return;
        }
        // eslint-disable-next-line no-console
        console.log(
          "auto sign-in failed:",
          signInError?.message ?? signInError,
        );
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("auto sign-in exception:", e);
      }
    }

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        name,
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }
    }

    setSuccess(true);
    setLoading(false);

    // If email confirmation is disabled, redirect to dashboard
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    }
  };

  if (success && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-sage"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="font-display text-3xl mb-3">Account Created</h2>
          <p className="text-stone text-sm mb-6">
            Check your email to confirm your account, then sign in.
          </p>
          <Link href="/login" className="btn-primary inline-block">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-stone-dark text-parchment flex-col justify-between p-16">
        <Link href="/" className="font-display text-2xl tracking-widest">
          ATELIER
        </Link>
        <div>
          <p className="text-gold tracking-[0.3em] text-xs mb-4">JOIN US</p>
          <h2 className="font-display text-5xl font-light leading-tight mb-6">
            Start selling
            <br />
            <em className="italic text-gold-light">extraordinary</em>
            <br />
            things.
          </h2>
          <p className="text-stone-light text-sm leading-relaxed max-w-xs">
            List your products, reach discerning buyers, and grow your brand on
            a platform built for quality.
          </p>
        </div>
        <p className="text-stone text-xs">
          © 2024 Atelier. All rights reserved.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <Link
              href="/"
              className="lg:hidden font-display text-2xl tracking-widest block mb-8"
            >
              ATELIER
            </Link>
            <h1 className="font-display text-4xl font-light mb-2">
              Create Account
            </h1>
            <p className="text-stone text-sm">
              Already have one?{" "}
              <Link
                href="/login"
                className="text-ink underline underline-offset-2 hover:text-gold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="text-xs tracking-widest text-stone block mb-2">
                FULL NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Your Name"
                required
              />
            </div>

            <div>
              <label className="text-xs tracking-widest text-stone block mb-2">
                EMAIL
              </label>
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
              <label className="text-xs tracking-widest text-stone block mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Min. 6 characters"
                  required
                  autoComplete="new-password"
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
                  Creating account…
                </span>
              ) : (
                <>
                  Create Account <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
