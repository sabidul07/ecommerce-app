"use client";

import { motion } from "framer-motion";
import { AlertCircle, RefreshCcw, Activity, Package } from "lucide-react";

interface OperationalAlertsProps {
  pendingOrders: number;
  conversionRate: number;
  refundsThisMonth: number;
  lowStockItems: number;
}

export default function OperationalAlerts({ 
  pendingOrders, 
  conversionRate, 
  refundsThisMonth, 
  lowStockItems 
}: OperationalAlertsProps) {
  const alerts = [
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: AlertCircle,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      description: "Needs attention"
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      icon: Activity,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      description: "Last 7 days"
    },
    {
      title: "Refunds",
      value: refundsThisMonth,
      icon: RefreshCcw,
      color: "text-rose-400",
      bg: "bg-rose-400/10",
      description: "This month"
    },
    {
      title: "Low Stock",
      value: lowStockItems,
      icon: Package,
      color: "text-red-400",
      bg: "bg-red-400/10",
      description: "Critically low"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {alerts.map((alert, index) => (
        <motion.div
          key={alert.title}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <div className={`p-3 rounded-lg ${alert.bg} ${alert.color}`}>
            <alert.icon size={20} />
          </div>
          <div>
            <p className="text-stone-400 text-xs font-medium uppercase tracking-wider">{alert.title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-white">{alert.value}</span>
              <span className="text-[10px] text-stone-500">{alert.description}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
