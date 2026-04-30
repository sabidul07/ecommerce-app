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
    <main className="bg-parchment min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-10">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="avatar" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <span className="font-display text-2xl text-gold font-medium">{initials}</span>
            )}
          </div>
          <div>
            <h1 className="font-display text-3xl font-light text-ink">
              {profile?.full_name || "Your Profile"}
            </h1>
            <p className="text-stone text-sm mt-0.5">{user.email}</p>
            <p className="text-stone text-xs mt-1">Member since {memberSince}</p>
          </div>
        </div>

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
        <div className={SECTION}>
          <h2 className={SECTION_TITLE}>Saved Addresses</h2>
          <AddressManager
            userId={user.id}
            initialAddresses={addresses ?? []}
          />
        </div>

        {/* ── Change Password ── */}
        <div className="space-y-2">
          <h2 className={SECTION_TITLE}>Change Password</h2>
          <ChangePassword isOAuthUser={isOAuthUser} />
        </div>

        {/* ── Notification Preferences ── */}
        <div className={SECTION}>
          <h2 className={SECTION_TITLE}>Notification Preferences</h2>
          <NotificationPrefs
            userId={user.id}
            initialPrefs={notificationPrefs}
          />
        </div>

        {/* ── Account Security ── */}
        <div className={SECTION}>
          <h2 className={SECTION_TITLE}>Account Security</h2>
          <AccountSecurity
            provider={provider}
            lastLogin={lastLogin}
            email={user.email ?? ""}
          />
        </div>

        {/* ── Danger Zone ── */}
        <div className="space-y-3">
          <h2 className={`${SECTION_TITLE} text-rust`}>Danger Zone</h2>
          <DangerZone email={user.email ?? ""} />
        </div>

      </div>
    </main>
  );
}
