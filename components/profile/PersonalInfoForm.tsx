"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

interface Props {
  userId: string;
  initialData: { full_name: string; phone: string; email: string };
}

export default function PersonalInfoForm({ userId, initialData }: Props) {
  const [form, setForm] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const nameParts = form.full_name.split(" ");
  const [firstName, setFirstName] = useState(nameParts[0] ?? "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const full_name = [firstName, lastName].filter(Boolean).join(" ");

    // Update profile fields
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name, phone: form.phone })
      .eq("id", userId);

    if (profileError) {
      setMessage({ type: "error", text: profileError.message });
      setSaving(false);
      return;
    }

    // Handle email change — triggers verification email
    const { data: { user } } = await supabase.auth.getUser();
    if (user && form.email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email: form.email });
      if (emailError) {
        setMessage({ type: "error", text: emailError.message });
        setSaving(false);
        return;
      }
      setMessage({ type: "success", text: "Profile saved. A verification email has been sent to your new address — click the link to confirm the change." });
    } else {
      setMessage({ type: "success", text: "Profile saved successfully." });
    }

    setSaving(false);
  };

  const fields = [
    { id: "firstName", label: "First name", value: firstName, onChange: setFirstName },
    { id: "lastName", label: "Last name", value: lastName, onChange: setLastName },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(({ id, label, value, onChange }) => (
          <div key={id}>
            <label htmlFor={id} className="block text-xs text-stone mb-1">{label}</label>
            <input
              id={id}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="input-field text-sm"
              required
            />
          </div>
        ))}

        <div>
          <label htmlFor="email" className="block text-xs text-stone mb-1">Email address</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="input-field text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-xs text-stone mb-1">Phone number</label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="input-field text-sm"
            placeholder="+91 XXXXX XXXXX"
          />
        </div>
      </div>

      {message && (
        <p className={`text-xs ${message.type === "success" ? "text-green-600" : "text-rust"}`}>
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="btn-primary text-sm py-2 px-5 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
