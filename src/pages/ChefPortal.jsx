import { useState } from 'react';
import { Clock, CheckCircle2, ChefHat, XCircle, Loader2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import ConfirmDialog from '../components/ConfirmDialog';

const statusConfig = {
  pending:   { label: 'Pending (New)',       icon: Clock,        textColor: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-200', dot: 'bg-amber-500' },
  preparing: { label: 'Preparing (Cooking)', icon: Loader2,      textColor: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-200',  dot: 'bg-blue-500'  },
  ready:     { label: 'Completed (Ready)',   icon: CheckCircle2, textColor: 'text-green-600',  bg: 'bg-green-50',   border: 'border-green-200', dot: 'bg-green-500' },
  cancelled: { label: 'Cancelled',           icon: XCircle,      textColor: 'text-red-500',    bg: 'bg-red-50',     border: 'border-red-200',   dot: 'bg-red-500'   },
};

export default function ChefPortal() {
  const { kitchenOrders, updateKitchenOrderStatus } = useStore();
  const { user } = useAuth();

  const [confirm, setConfirm] = useState(null);
  // confirm = { orderId, tableName, action: 'preparing' | 'ready' }

  const unbilledOrders = kitchenOrders.filter(o => !o.billed && o.status !== 'cancelled');
  const grouped = {
    pending:   unbilledOrders.filter(o => o.status === 'pending'),
    preparing: unbilledOrders.filter(o => o.status === 'preparing'),
    ready:     unbilledOrders.filter(o => o.status === 'ready'),
  };

  const confirmMessages = {
    preparing: (name) => ({
      title: 'Start preparing this order?',
      message: `Mark order for ${name} as "Preparing". This notifies staff that you've started cooking.`,
      confirmLabel: 'Start Preparing',
      variant: 'info',
    }),
    ready: (name) => ({
      title: 'Mark order as completed?',
      message: `Mark order for ${name} as "Completed / Ready". Staff will be notified to serve the table.`,
      confirmLabel: 'Mark Completed',
      variant: 'primary',
    }),
  };

  const handleConfirm = () => {
    if (!confirm) return;
    updateKitchenOrderStatus(confirm.orderId, confirm.action);
    setConfirm(null);
  };

  const cfgData = confirm ? confirmMessages[confirm.action]?.(confirm.tableName) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20">
        <p className="text-blue-100 text-sm font-medium">Kitchen Display System</p>
        <h2 className="text-xl font-bold mt-0.5">{user?.name || 'Chef'} 👨‍🍳</h2>
        <div className="flex flex-wrap items-center gap-2.5 mt-3">
          <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-100 border border-amber-300/30 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {grouped.pending.length} Pending
          </span>
          <span className="px-3 py-1 rounded-full bg-blue-400/20 text-blue-100 border border-blue-300/30 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-300" />
            {grouped.preparing.length} Preparing
          </span>
          <span className="px-3 py-1 rounded-full bg-green-400/20 text-green-100 border border-green-300/30 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            {grouped.ready.length} Completed
          </span>
        </div>
      </div>

      {/* Status columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['pending', 'preparing', 'ready']).map(status => {
          const cfg = statusConfig[status];
          const Icon = cfg.icon;
          const list = grouped[status];

          return (
            <div key={status}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <h3 className="font-semibold text-surface-800 capitalize text-sm">{cfg.label}</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-surface-100 text-surface-500 ml-auto">{list.length}</span>
              </div>

              <div className="space-y-3 min-h-24">
                {list.length === 0 && (
                  <div className={`p-6 rounded-xl border-2 border-dashed ${cfg.border} text-center`}>
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${cfg.textColor} opacity-40`} />
                    <p className="text-xs text-surface-400">No {cfg.label.toLowerCase()} orders</p>
                  </div>
                )}

                {list.map(order => (
                  <div
                    key={order.id}
                    className={`${cfg.bg} border ${cfg.border} rounded-xl p-4 animate-slide-up transition-all`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-surface-800">{order.tableName}</span>
                      <span className="text-xs text-surface-400">
                        {format(new Date(order.createdAt), 'hh:mm a')}
                      </span>
                    </div>

                    <ul className="space-y-1 mb-3">
                      {order.items.map((item, i) => (
                        <li key={i} className="flex justify-between text-sm">
                          <span className="text-surface-700">{item.name}</span>
                          <span className="font-semibold text-surface-600">×{item.qty}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex gap-2">
                      {status === 'pending' && (
                        <button
                          onClick={() => setConfirm({ orderId: order.id, tableName: order.tableName, action: 'preparing' })}
                          className="flex-1 py-2 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Start Preparing
                        </button>
                      )}
                      {status === 'preparing' && (
                        <button
                          onClick={() => setConfirm({ orderId: order.id, tableName: order.tableName, action: 'ready' })}
                          className="flex-1 py-2 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Mark Ready
                        </button>
                      )}
                      {status === 'ready' && (
                        <span className="flex-1 py-2 text-center text-xs font-semibold text-green-600 bg-green-50 rounded-lg border border-green-200">
                          ✓ Order Ready
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {kitchenOrders.length === 0 && (
        <div className="text-center py-20">
          <ChefHat className="w-12 h-12 mx-auto text-surface-300 mb-3" />
          <p className="text-surface-500 font-medium">No orders yet</p>
          <p className="text-surface-400 text-sm mt-1">Waiting for orders from the tables…</p>
        </div>
      )}

      {/* Confirm dialog */}
      {cfgData && (
        <ConfirmDialog
          open={!!confirm}
          title={cfgData.title}
          message={cfgData.message}
          confirmLabel={cfgData.confirmLabel}
          cancelLabel="Go Back"
          variant={cfgData.variant}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
