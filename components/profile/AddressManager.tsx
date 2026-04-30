"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { MapPin, Plus, Pencil, Trash2, Star } from "lucide-react";

interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

const EMPTY_FORM: Omit<Address, "id" | "is_default"> = {
  name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "",
};

interface Props {
  userId: string;
  initialAddresses: Address[];
}

export default function AddressManager({ userId, initialAddresses }: Props) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (addr: Address) => {
    setForm({ name: addr.name, phone: addr.phone, line1: addr.line1, line2: addr.line2, city: addr.city, state: addr.state, pincode: addr.pincode });
    setEditId(addr.id);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (editId) {
      const { error } = await supabase
        .from("addresses")
        .update({ ...form })
        .eq("id", editId);
      if (error) { setError(error.message); setSaving(false); return; }
      setAddresses((prev) => prev.map((a) => a.id === editId ? { ...a, ...form } : a));
    } else {
      const { data, error } = await supabase
        .from("addresses")
        .insert([{ ...form, user_id: userId, is_default: addresses.length === 0 }])
        .select()
        .single();
      if (error) { setError(error.message); setSaving(false); return; }
      setAddresses((prev) => [...prev, data]);
    }

    setSaving(false);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("addresses").delete().eq("id", id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSetDefault = async (id: string) => {
    // Unset all, then set this one
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })));
  };

  return (
    <div className="space-y-4">
      {/* Address list */}
      {addresses.length === 0 && !showForm && (
        <div className="text-center py-10 border border-dashed border-stone-light">
          <MapPin size={28} className="text-stone-300 mx-auto mb-2" />
          <p className="text-stone text-sm">No saved addresses yet.</p>
        </div>
      )}

      {addresses.map((addr) => (
        <div key={addr.id} className={`border p-4 flex justify-between items-start gap-4 ${addr.is_default ? "border-gold/40 bg-gold/5" : "border-stone-light"}`}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-sm text-ink">{addr.name}</p>
              {addr.is_default && (
                <span className="text-[10px] bg-gold text-ink px-2 py-0.5 font-semibold tracking-wide uppercase">Default</span>
              )}
            </div>
            <p className="text-stone text-xs leading-relaxed">
              {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
              {addr.city}, {addr.state} – {addr.pincode}<br />
              {addr.phone}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!addr.is_default && (
              <button onClick={() => handleSetDefault(addr.id)} title="Set as default" className="p-1.5 hover:text-gold transition-colors text-stone">
                <Star size={14} />
              </button>
            )}
            <button onClick={() => openEdit(addr)} className="p-1.5 hover:text-ink transition-colors text-stone">
              <Pencil size={14} />
            </button>
            <button onClick={() => handleDelete(addr.id)} className="p-1.5 hover:text-rust transition-colors text-stone">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}

      {/* Inline form */}
      {showForm && (
        <form onSubmit={handleSave} className="border border-gold/30 p-5 space-y-4 bg-gold/5">
          <h4 className="font-medium text-sm text-ink">{editId ? "Edit address" : "New address"}</h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "name", label: "Full name", colSpan: "col-span-1" },
              { name: "phone", label: "Phone", colSpan: "col-span-1" },
              { name: "line1", label: "Address line 1", colSpan: "col-span-2" },
              { name: "line2", label: "Address line 2 (optional)", colSpan: "col-span-2" },
              { name: "city", label: "City", colSpan: "col-span-1" },
              { name: "state", label: "State", colSpan: "col-span-1" },
              { name: "pincode", label: "Pincode", colSpan: "col-span-1" },
            ].map(({ name, label, colSpan }) => (
              <div key={name} className={colSpan}>
                <label className="block text-xs text-stone mb-1">{label}</label>
                <input
                  value={(form as any)[name]}
                  onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
                  required={name !== "line2"}
                  className="input-field text-xs py-2"
                />
              </div>
            ))}
          </div>
          {error && <p className="text-rust text-xs">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="btn-gold text-sm py-2 px-4 disabled:opacity-50">
              {saving ? "Saving..." : "Save address"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-stone hover:text-ink transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        <button onClick={openAdd} className="flex items-center gap-2 text-sm text-stone hover:text-ink border border-dashed border-stone-light hover:border-stone px-4 py-2 transition-colors w-full justify-center">
          <Plus size={14} /> Add new address
        </button>
      )}
    </div>
  );
}
