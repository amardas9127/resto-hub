import { useState } from 'react';
import { Clock, CheckCircle2, ChefHat, XCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { format } from 'date-fns';
import ConfirmDialog from '../components/ConfirmDialog';

const statusConfig = {
  pending:   { label: 'Pending (New)',       icon: Clock,        color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  preparing: { label: 'Preparing (Cooking)', icon: ChefHat,      color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200'  },
  ready:     { label: 'Completed (Ready)',   icon: CheckCircle2, color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200' },
  cancelled: { label: 'Cancelled',           icon: XCircle,      color: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-200'   },
};

const actionConfig = {
  preparing: {
    title: 'Start preparing this order?',
    message: (name) => `Mark order for ${name} as "Preparing".`,
    confirmLabel: 'Start Preparing',
    variant: 'info',
  },
  ready: {
    title: 'Mark order as ready?',
    message: (name) => `Mark order for ${name} as "Ready". Staff will be notified to serve.`,
    confirmLabel: 'Mark Ready',
    variant: 'primary',
  },
  cancelled: {
    title: 'Cancel this order?',
    message: (name) => `This will permanently cancel the order for ${name}. This action cannot be undone.`,
    confirmLabel: 'Cancel Order',
    variant: 'danger',
  },
};

export default function KitchenPage() {
  const { kitchenOrders, updateKitchenOrderStatus } = useStore();
  const [confirm, setConfirm] = useState(null);
  // confirm = { orderId, tableName, action }

  const unbilledOrders = kitchenOrders.filter(o => !o.billed && o.status !== 'cancelled');
  const grouped = {
    pending:   unbilledOrders.filter(o => o.status === 'pending'),
    preparing: unbilledOrders.filter(o => o.status === 'preparing'),
    ready:     unbilledOrders.filter(o => o.status === 'ready'),
  };

  const handleConfirm = () => {
    if (!confirm) return;
    updateKitchenOrderStatus(confirm.orderId, confirm.action);
    setConfirm(null);
  };

  const cfgData = confirm ? actionConfig[confirm.action] : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          {grouped.pending.length} Pending
        </span>
        <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          {grouped.preparing.length} Preparing
        </span>
        <span className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          {grouped.ready.length} Completed
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['pending', 'preparing', 'ready'].map(status => {
          const config = statusConfig[status];
          const Icon = config.icon;
          const list = grouped[status];
          return (
            <div key={status}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-5 h-5 ${config.color}`} />
                <h3 className="font-semibold text-surface-800 capitalize">{config.label}</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-surface-100 text-surface-500">{list.length}</span>
              </div>
              <div className="space-y-3">
                {list.length === 0 && (
                  <div className={`p-6 rounded-xl border-2 border-dashed ${config.border} text-center`}>
                    <p className="text-sm text-surface-400">No {config.label.toLowerCase()} orders</p>
                  </div>
                )}
                {list.map(order => (
                  <div key={order.id} className={`${config.bg} border ${config.border} rounded-xl p-4 animate-slide-up transition-all`}>
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
                      {status !== 'ready' && (
                        <button
                          onClick={() => setConfirm({ orderId: order.id, tableName: order.tableName, action: 'cancelled' })}
                          className="py-2 px-3 border border-surface-200 text-xs font-medium text-surface-500 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm dialog */}
      {cfgData && (
        <ConfirmDialog
          open={!!confirm}
          title={cfgData.title}
          message={cfgData.message(confirm?.tableName)}
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
