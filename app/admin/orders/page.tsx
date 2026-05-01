import OrdersTable from "@/components/admin/OrdersTable";
import { ShoppingBag } from "lucide-react";

export const revalidate = 0;

export default function AdminOrdersPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20 shadow-lg shadow-gold/5">
          <ShoppingBag className="text-gold" size={24} />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white font-display">Orders Management</h1>
          <p className="text-stone-500 text-sm mt-1">Track payments, manage shipments, and handle cancellations.</p>
        </div>
      </div>

      <OrdersTable />
    </div>
  );
}
