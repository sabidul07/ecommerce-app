"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Client-side email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') { // Unique violation
          throw new Error("This email is already subscribed.");
        }
        throw new Error(error.message || "Failed to subscribe. Please try again.");
      }

      setStatus("success");
      setEmail("");
    } catch (err: any) {
      console.error("Newsletter subscription error:", err);
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <section className="bg-[#fcfbf9] py-12 xl:py-20 border-t border-stone-light">
      <div className="max-w-xl mx-auto px-4 xl:px-6 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-light text-ink mb-4">
          Stay in the loop
        </h2>
        <p className="text-stone text-sm leading-relaxed mb-8">
          Subscribe to get special offers, early access to new collections, and behind-the-scenes stories from our artisans.
        </p>

        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="Your email address"
            required
            className="flex-1 border border-stone-light bg-white px-4 py-3 text-sm focus:outline-hidden focus:border-gold transition-colors"
            disabled={status === "loading" || status === "success"}
          />
          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className={`btn-gold whitespace-nowrap disabled:opacity-70 transition-all ${status === "success" ? "bg-green-700 text-white border-green-700 hover:bg-green-800" : ""}`}
          >
            {status === "loading" ? "Subscribing..." : status === "success" ? "You're in! ✓" : "Subscribe"}
          </button>
        </form>

        {status === "success" && (
          <p className="text-green-700 text-xs mt-4 text-left sm:text-center font-medium">
            You're in! ✓ Keep an eye on your inbox.
          </p>
        )}
        {status === "error" && (
          <p className="text-rust text-xs mt-4 text-left sm:text-center">
            {errorMessage}
          </p>
        )}
      </div>
    </section>
  );
}
