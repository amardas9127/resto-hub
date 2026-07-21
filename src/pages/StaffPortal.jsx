import { Clock, CheckCircle2, XCircle, Activity, Loader2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const statusConfig = {
  pending:   { label: 'Pending',   icon: Clock,        textColor: 'text-amber-600', bg: 'bg-amber-50',  border: 'border-amber-200',  badgeBg: 'bg-amber-100 text-amber-700' },
  preparing: { label: 'Preparing', icon: Loader2,      textColor: 'text-blue-600',  bg: 'bg-blue-50',   border: 'border-blue-200',   badgeBg: 'bg-blue-100 text-blue-700'   },
  ready:     { label: 'Ready',     icon: CheckCircle2, textColor: 'text-green-600', bg: 'bg-green-50',  border: 'border-green-200',  badgeBg: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', icon: XCircle,      textColor: 'text-red-500',   bg: 'bg-red-50',    border: 'border-red-200',    badgeBg: 'bg-red-100 text-red-600'     },
};

export default function StaffPortal() {
  const { kitchenOrders, tables } = useStore();
  const { user } = useAuth();

  const allOrders = [...kitchenOrders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg shadow-green-500/20">
        <p className="text-green-100 text-sm font-medium">Order Status Board</p>
        <h2 className="text-xl font-bold mt-0.5">{user?.name} 👤</h2>
        <p className="text-green-100 text-sm mt-2">
          {kitchenOrders.filter(o => o.status === 'pending').length} pending &nbsp;·&nbsp;
          {kitchenOrders.filter(o => o.status === 'preparing').length} preparing &nbsp;·&nbsp;
          {kitchenOrders.filter(o => o.status === 'ready').length} ready
        </p>
      </div>

      {/* Orders list */}
      {allOrders.length === 0 ? (
        <div className="text-center py-20">
          <Activity className="w-12 h-12 mx-auto text-surface-300 mb-3" />
          <p className="text-surface-500 font-medium">No orders yet</p>
          <p className="text-surface-400 text-sm mt-1">Order status will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allOrders.map(order => {
            const cfg = statusConfig[order.status] || statusConfig.pending;
            const Icon = cfg.icon;
            return (
              <div
                key={order.id}
                className={`${cfg.bg} border ${cfg.border} rounded-xl p-4 flex items-start gap-4 animate-slide-up`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg} border ${cfg.border}`}>
                  <Icon className={`w-5 h-5 ${cfg.textColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-surface-800">{order.tableName}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badgeBg}`}>
                      {cfg.label}
                    </span>
                    <span className="text-xs text-surface-400 ml-auto">
                      {format(new Date(order.createdAt), 'hh:mm a')}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-0.5">
                    {order.items.map((item, i) => (
                      <li key={i} className="text-xs text-surface-600">
                        {item.name} <span className="font-semibold">×{item.qty}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
