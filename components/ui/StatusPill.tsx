import { Clock, CheckCircle2, Truck, Package, XCircle } from "lucide-react";

interface StatusPillProps {
  status: string;
}

const statusConfig: Record<string, { color: string; icon: any }> = {
  Pending: { color: "text-amber-400 bg-amber-400/20 border-amber-400/30", icon: Clock },
  Paid: { color: "text-emerald-400 bg-emerald-400/20 border-emerald-400/30", icon: CheckCircle2 },
  Shipped: { color: "text-blue-400 bg-blue-400/20 border-blue-400/30", icon: Truck },
  Delivered: { color: "text-indigo-400 bg-indigo-400/20 border-indigo-400/30", icon: Package },
  Cancelled: { color: "text-rose-400 bg-rose-400/20 border-rose-400/30", icon: XCircle },
};

export default function StatusPill({ status }: StatusPillProps) {
  const config = statusConfig[status] || statusConfig.Pending;
  const Icon = config.icon;

  return (
    <div className={`status-badge ${config.color}`}>
      <Icon size={12} />
      {status}
    </div>
  );
}
