import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import AvatarUpload from "@/components/profile/AvatarUpload";
import AddressManager from "@/components/profile/AddressManager";
import ChangePassword from "@/components/profile/ChangePassword";
import NotificationPrefs from "@/components/profile/NotificationPrefs";
import AccountSecurity from "@/components/profile/AccountSecurity";
import DangerZone from "@/components/profile/DangerZone";
import PersonalInfoForm from "@/components/profile/PersonalInfoForm";

export const metadata = {
  title: "My Profile — Atelier",
  description: "Manage your personal information, addresses, and account settings.",
};

const SECTION = "border border-stone-light p-4 lg:p-6 space-y-6";
const SECTION_TITLE = "font-display text-xl font-light text-ink";

import AccountLayout from "@/app/account/layout";

export default async function ProfilePage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Load profile + addresses in parallel
  const [{ data: profile }, { data: addresses }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("addresses").select("*").eq("user_id", user.id).order("created_at"),
  ]);

  const provider = user.app_metadata?.provider ?? "email";
  const isOAuthUser = provider !== "email";
  const lastLogin = user.last_sign_in_at ?? "";
  const memberSince = new Date(user.created_at).toLocaleDateString("en-IN", { dateStyle: "long" });

  const notificationPrefs = profile?.notification_preferences ?? {
    order_status: true,
    promotions: true,
    back_in_stock: false,
    newsletter: true,
  };

  const initials = (profile?.full_name || user.email || "?")
    .split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <AccountLayout>
      <div className="space-y-10 animate-fade-in">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-10 border-b border-stone-light">
          <div className="w-20 h-20 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="avatar" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <span className="font-display text-2xl text-gold font-medium">{initials}</span>
            )}
          </div>
          <div>
            <h1 className="font-display text-4xl font-light text-ink">
              {profile?.full_name || "Your Profile"}
            </h1>
            <p className="text-stone text-sm mt-0.5">{user.email}</p>
            <p className="text-stone text-xs mt-1 uppercase tracking-widest opacity-60">Member since {memberSince}</p>
          </div>
        </div>

        {/* ── Grid Layout for sections ── */}
        <div className="grid grid-cols-1 gap-12">
          {/* ── Personal Information ── */}
          <div className={SECTION}>
            <div>
              <h2 className={SECTION_TITLE}>Personal Information</h2>
              <p className="text-stone text-xs mt-1">Changes to your email will require re-verification.</p>
            </div>
            <AvatarUpload
              userId={user.id}
              avatarUrl={profile?.avatar_url ?? null}
              fullName={profile?.full_name ?? ""}
            />
            <PersonalInfoForm
              userId={user.id}
              initialData={{
                full_name: profile?.full_name ?? "",
                phone: profile?.phone ?? "",
                email: user.email ?? "",
              }}
            />
          </div>

          {/* ── Saved Addresses ── */}
          <div id="addresses" className={SECTION}>
            <h2 className={SECTION_TITLE}>Saved Addresses</h2>
            <AddressManager
              userId={user.id}
              initialAddresses={addresses ?? []}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* ── Notification Preferences ── */}
            <div className={SECTION}>
              <h2 className={SECTION_TITLE}>Notifications</h2>
              <NotificationPrefs
                userId={user.id}
                initialPrefs={notificationPrefs}
              />
            </div>

            {/* ── Account Security ── */}
            <div className={SECTION}>
              <h2 className={SECTION_TITLE}>Security</h2>
              <AccountSecurity
                provider={provider}
                lastLogin={lastLogin}
                email={user.email ?? ""}
              />
            </div>
          </div>

          {/* ── Change Password ── */}
          <div className="bg-parchment/50 border border-stone-light p-6 lg:p-8 rounded-2xl">
            <h2 className={SECTION_TITLE}>Update Password</h2>
            <p className="text-stone text-xs mb-6">Ensure your account is using a long, random password to stay secure.</p>
            <ChangePassword isOAuthUser={isOAuthUser} />
          </div>

          {/* ── Danger Zone ── */}
          <div className="pt-10 border-t border-rust/10">
            <h2 className={`${SECTION_TITLE} text-rust`}>Danger Zone</h2>
            <p className="text-stone text-xs mt-1 mb-6">Permanently delete your account and all associated data.</p>
            <DangerZone email={user.email ?? ""} />
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
