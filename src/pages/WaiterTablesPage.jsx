import { useNavigate } from 'react-router-dom';
import { Users as UsersIcon, UtensilsCrossed } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

export default function WaiterTablesPage() {
  const { tables, orders, kitchenOrders } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const available = tables.filter(t => t.status === 'available');
  const occupied = tables.filter(t => t.status === 'occupied');

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-5 text-white shadow-lg shadow-amber-500/20">
        <p className="text-amber-100 text-sm font-medium">Good day,</p>
        <h2 className="text-xl font-bold mt-0.5">{user?.name || 'Waiter'} 👋</h2>
        <p className="text-amber-100 text-sm mt-2">
          {tables.length} tables &nbsp;·&nbsp; {occupied.length} occupied &nbsp;·&nbsp; {available.length} available
        </p>
      </div>

      {/* Occupied tables first */}
      {occupied.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wide mb-3">
            🔴 Occupied Tables
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {occupied.map((table, idx) => {
              const tableOrder = orders[table.id] || [];
              const activeKos = kitchenOrders.filter(o => String(o.tableId) === String(table.id) && !o.billed);
              const koItemCount = activeKos.reduce((s, ko) => s + (ko.items || []).reduce((is, item) => is + item.qty, 0), 0);
              const koTotal = activeKos.reduce((s, ko) => s + (ko.items || []).reduce((is, item) => is + (item.price || 0) * item.qty, 0), 0);
              const cartItemCount = tableOrder.reduce((s, o) => s + o.qty, 0);
              const cartTotal = tableOrder.reduce((s, o) => s + o.item.price * o.qty, 0);

              const itemCount = koItemCount + cartItemCount;
              const orderTotal = koTotal + cartTotal;
              return (
                <button
                  key={table.id}
                  id={`waiter-table-${table.id}`}
                  onClick={() => navigate(`/staff/orders/${table.id}`)}
                  className="relative text-left bg-white border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white rounded-2xl p-5 shadow-md shadow-amber-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 animate-slide-up"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
                    <UtensilsCrossed className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-sm font-bold text-surface-800 truncate">{table.name}</p>
                  <div className="flex items-center gap-1 mt-1 text-surface-400">
                    <UsersIcon className="w-3 h-3" />
                    <span className="text-xs">{table.seats} seats</span>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-amber-200">
                    <p className="text-xs font-semibold text-amber-600">{itemCount} items · ₹{orderTotal}</p>
                    <p className="text-xs text-surface-400 mt-0.5">Tap to manage order</p>
                  </div>
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Available tables */}
      {available.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wide mb-3">
            🟢 Available Tables
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {available.map((table, idx) => (
              <button
                key={table.id}
                id={`waiter-table-${table.id}`}
                onClick={() => navigate(`/staff/orders/${table.id}`)}
                className="text-left bg-white border-2 border-surface-200 rounded-2xl p-5 hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-slide-up"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center mb-3 group-hover:bg-amber-50">
                  <UtensilsCrossed className="w-5 h-5 text-surface-400" />
                </div>
                <p className="text-sm font-bold text-surface-800 truncate">{table.name}</p>
                <div className="flex items-center gap-1 mt-1 text-surface-400">
                  <UsersIcon className="w-3 h-3" />
                  <span className="text-xs">{table.seats} seats</span>
                </div>
                <span className="inline-block mt-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-600">
                  Available
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {tables.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
            <UtensilsCrossed className="w-7 h-7 text-surface-300" />
          </div>
          <p className="text-surface-500 font-medium">No tables set up yet.</p>
          <p className="text-surface-400 text-sm mt-1">Ask an admin to add tables.</p>
        </div>
      )}
    </div>
  );
}
