"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";

interface Prefs {
  order_status: boolean;
  promotions: boolean;
  back_in_stock: boolean;
  newsletter: boolean;
}

interface Props {
  userId: string;
  initialPrefs: Prefs;
}

const TOGGLES = [
  { key: "order_status" as const, label: "Order status emails", description: "Shipping updates, delivery confirmations" },
  { key: "promotions" as const, label: "Promotional emails", description: "Sales, discounts, and special offers" },
  { key: "back_in_stock" as const, label: "Back-in-stock alerts", description: "Notify when saved items are available" },
  { key: "newsletter" as const, label: "Newsletter", description: "Artisan stories and new collection highlights" },
];

export default function NotificationPrefs({ userId, initialPrefs }: Props) {
  const [prefs, setPrefs] = useState<Prefs>(initialPrefs);
  const [saving, setSaving] = useState<string | null>(null);

  const supabase = createClient();

  // Debounced save — fire immediately but debounce concurrent calls
  const savePrefs = useCallback(
    async (updated: Prefs) => {
      await supabase
        .from("profiles")
        .update({ notification_preferences: updated })
        .eq("id", userId);
    },
    [userId]
  );

  const handleToggle = async (key: keyof Prefs) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setSaving(key);
    await savePrefs(updated);
    setSaving(null);
  };

  return (
    <div className="divide-y divide-stone-light">
      {TOGGLES.map(({ key, label, description }) => (
        <div key={key} className="flex items-center justify-between py-4 gap-4">
          <div>
            <p className="text-sm font-medium text-ink">{label}</p>
            <p className="text-xs text-stone mt-0.5">{description}</p>
          </div>
          <button
            role="switch"
            aria-checked={prefs[key]}
            onClick={() => handleToggle(key)}
            className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-hidden ${
              prefs[key] ? "bg-gold" : "bg-stone-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-xs transform transition-transform duration-200 ${
                prefs[key] ? "translate-x-5" : "translate-x-0"
              }`}
            />
            {saving === key && (
              <span className="absolute inset-0 rounded-full ring-2 ring-gold/50 animate-pulse" />
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
