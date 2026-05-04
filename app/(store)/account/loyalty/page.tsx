import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { Sparkles, Star, Award, History, TrendingUp, Gift, ChevronRight, Check } from "lucide-react";
import { LoyaltyAccount } from "@/types";

const TIERS = [
  { name: 'Bronze', min: 0, color: 'text-stone', bg: 'bg-stone-light', benefits: ['Newsletter', 'Basic Support'] },
  { name: 'Silver', min: 500, color: 'text-slate-400', bg: 'bg-slate-100', benefits: ['Early Access', '5% Points Bonus', 'Silver Badge'] },
  { name: 'Gold', min: 2000, color: 'text-gold', bg: 'bg-gold/10', benefits: ['Free Global Shipping', 'Artisan Q&A', 'Gold Badge'] },
  { name: 'Platinum', min: 5000, color: 'text-ink', bg: 'bg-ink/5', benefits: ['Personal Concierge', 'Studio Tour Invites', 'Platinum Badge'] },
];

export default async function LoyaltyRewardsPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: loyalty } = await supabase
    .from("loyalty_points")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const typedLoyalty = loyalty as LoyaltyAccount;
  const currentTierIndex = TIERS.findIndex(t => t.name === (typedLoyalty?.tier || 'Bronze'));
  const nextTier = TIERS[currentTierIndex + 1];
  const progress = nextTier ? Math.min(100, (typedLoyalty?.points || 0) / nextTier.min * 100) : 100;

  return (
    <div className="space-y-12">
      {/* ── HEADER ── */}
      <div className="bg-ink text-white p-12 rounded-[40px] relative overflow-hidden">
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 text-gold mb-6">
              <Sparkles size={18} />
              <span className="text-[10px] tracking-[0.4em] font-bold uppercase">Atelier Rewards</span>
            </div>
            <h1 className="text-5xl font-bold italic mb-4">Your Collector Status</h1>
            <p className="text-stone-400 max-w-sm">Every piece you collect brings you closer to the inner circle of the world's finest artisans.</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Current Points</p>
                <p className="text-4xl font-bold text-gold">{typedLoyalty?.points || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Membership Tier</p>
                <p className="text-2xl font-bold text-white italic">{typedLoyalty?.tier || 'Bronze'}</p>
              </div>
            </div>
            
            {nextTier && (
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                  <span className="text-stone-400">Progress to {nextTier.name}</span>
                  <span className="text-gold">{nextTier.min - (typedLoyalty?.points || 0)} more points</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gold transition-all duration-1000" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* ── TIER BENEFITS ── */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-gold" />
            <h2 className="text-xl font-bold text-ink">Tier Privileges</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {TIERS.map((tier, idx) => (
              <div 
                key={tier.name} 
                className={`p-8 rounded-3xl border-2 transition-all ${
                  idx === currentTierIndex ? 'border-gold bg-white shadow-xl' : 'border-stone-light bg-parchment/50'
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-bold italic ${tier.color}`}>{tier.name}</h3>
                  {idx <= currentTierIndex && <Check className="text-gold" size={20} />}
                </div>
                <ul className="space-y-4">
                  {tier.benefits.map(benefit => (
                    <li key={benefit} className="flex items-center gap-3 text-sm text-stone">
                      <div className={`w-1.5 h-1.5 rounded-full ${idx <= currentTierIndex ? 'bg-gold' : 'bg-stone-light'}`} />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── RECENT HISTORY ── */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <History size={20} className="text-rust" />
            <h2 className="text-xl font-bold text-ink">Point Log</h2>
          </div>
          
          <div className="bg-white border border-stone-light rounded-3xl overflow-hidden shadow-sm">
            {typedLoyalty?.history && typedLoyalty.history.length > 0 ? typedLoyalty.history.map((log, i) => (
              <div key={i} className="p-6 border-b border-stone-light last:border-0 hover:bg-parchment transition-colors">
                <div className="flex justify-between mb-1">
                  <p className="text-sm font-bold text-ink">{log.reason || 'Point Accrual'}</p>
                  <p className="text-sm font-bold text-gold">+{log.points}</p>
                </div>
                <p className="text-[10px] text-stone uppercase tracking-widest">{new Date(log.date).toLocaleDateString()}</p>
              </div>
            )) : (
              <div className="p-12 text-center text-stone">
                <p className="text-sm italic">No recent transactions.</p>
              </div>
            )}
          </div>

          <div className="bg-parchment border border-stone-light p-8 rounded-3xl">
            <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
              <Gift size={18} className="text-gold" />
              Ways to Earn
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between group cursor-pointer">
                <span className="text-sm text-stone group-hover:text-ink">Complete Style Quiz</span>
                <p className="text-xs font-bold text-gold">100 pts</p>
              </div>
              <div className="flex items-center justify-between group cursor-pointer">
                <span className="text-sm text-stone group-hover:text-ink">Verify Profile</span>
                <p className="text-xs font-bold text-gold">250 pts</p>
              </div>
              <div className="flex items-center justify-between group cursor-pointer">
                <span className="text-sm text-stone group-hover:text-ink">Refer a Collector</span>
                <p className="text-xs font-bold text-gold">500 pts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
