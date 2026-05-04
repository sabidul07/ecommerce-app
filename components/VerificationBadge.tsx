import React from 'react';
import { ShieldCheck, Award, Star } from 'lucide-react';

interface VerificationBadgeProps {
  status?: 'Unverified' | 'Pending' | 'Verified';
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  className?: string;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ status, tier, className }) => {
  if (status !== 'Verified') return null;

  const config = {
    Bronze: { color: 'text-[#CD7F32]', icon: Star, label: 'Verified Artisan' },
    Silver: { color: 'text-[#C0C0C0]', icon: Award, label: 'Elite Artisan' },
    Gold: { color: 'text-[#D4AF37]', icon: ShieldCheck, label: 'Master Artisan' },
    Platinum: { color: 'text-[#E5E4E2]', icon: Award, label: 'Legendary Artisan' },
  };

  const current = config[tier || 'Bronze'];
  const Icon = current.icon;

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 ${className}`}>
      <Icon className={`w-3.5 h-3.5 ${current.color}`} />
      <span className={`text-[10px] font-bold uppercase tracking-wider ${current.color}`}>
        {current.label}
      </span>
    </div>
  );
};

export default VerificationBadge;
