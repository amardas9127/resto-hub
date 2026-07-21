import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { format } from 'date-fns';

function StatCard({ icon: Icon, label, value, trend, trendUp, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-surface-200 hover:shadow-lg hover:shadow-surface-200/50 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div
          className={`p-2.5 rounded-xl ${color} transition-transform group-hover:scale-110 duration-300`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${
              trendUp
                ? 'bg-green-50 text-green-600'
                : 'bg-red-50 text-red-500'
            }`}
          >
            {trendUp ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-surface-900">{value}</p>
        <p className="text-sm text-surface-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function RecentBillRow({ bill }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-surface-50 rounded-xl transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-primary-600">
            {bill.tableName?.replace('Table ', 'T') || 'T?'}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-surface-800 truncate">
            {bill.tableName}
          </p>
          <p className="text-xs text-surface-400">
            {bill.items?.length || 0} items • {bill.paymentMethod}
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-3">
        <p className="text-sm font-semibold text-surface-900">₹{bill.total}</p>
        <p className="text-xs text-surface-400">
          {format(new Date(bill.createdAt), 'hh:mm a')}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { tables, orders, bills, employees, kitchenOrders } = useStore();

  const occupiedTables = tables.filter(t => t.status === 'occupied').length;
  const todayBills = bills.filter(b => {
    const d = new Date(b.createdAt);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  });
  const todayRevenue = todayBills.reduce((sum, b) => sum + b.total, 0);
  const totalRevenue = bills.reduce((sum, b) => sum + b.total, 0);
  const activeOrders = Object.keys(orders).length;
  const pendingKitchen = kitchenOrders.filter(o => o.status === 'pending').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-surface-900">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'} 👋
        </h2>
        <p className="text-surface-500 mt-1">
          Here's what's happening at your restaurant today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Today's Revenue"
          value={`₹${todayRevenue.toLocaleString()}`}
          trend="+12%"
          trendUp
          color="bg-gradient-to-br from-green-500 to-emerald-600"
        />
        <StatCard
          icon={ShoppingCart}
          label="Active Orders"
          value={activeOrders}
          trend={pendingKitchen > 0 ? `${pendingKitchen} pending` : null}
          trendUp={false}
          color="bg-gradient-to-br from-blue-500 to-indigo-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          trend={`${bills.length} bills`}
          trendUp
          color="bg-gradient-to-br from-primary-500 to-amber-600"
        />
        <StatCard
          icon={Users}
          label="Tables Occupied"
          value={`${occupiedTables} / ${tables.length}`}
          trend={`${employees.length} staff`}
          trendUp
          color="bg-gradient-to-br from-purple-500 to-violet-600"
        />
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bills */}
        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-100">
            <h3 className="font-semibold text-surface-800">Recent Bills</h3>
          </div>
          <div className="divide-y divide-surface-100 max-h-80 overflow-y-auto">
            {bills.length === 0 ? (
              <div className="px-5 py-10 text-center text-surface-400 text-sm">
                No bills generated yet. Start taking orders!
              </div>
            ) : (
              bills.slice(0, 8).map(bill => (
                <RecentBillRow key={bill.id} bill={bill} />
              ))
            )}
          </div>
        </div>

        {/* Quick Table Overview */}
        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-100">
            <h3 className="font-semibold text-surface-800">Table Overview</h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {tables.map(table => (
                <div
                  key={table.id}
                  className={`
                    relative p-3 rounded-xl border-2 text-center transition-all duration-200
                    ${
                      table.status === 'occupied'
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-surface-200 bg-surface-50 hover:border-surface-300'
                    }
                  `}
                >
                  <p className="text-sm font-bold text-surface-800 truncate">
                    {table.name}
                  </p>
                  <span
                    className={`
                      inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full
                      ${
                        table.status === 'occupied'
                          ? 'bg-primary-200 text-primary-800'
                          : 'bg-green-100 text-green-700'
                      }
                    `}
                  >
                    {table.status === 'occupied' ? 'Busy' : 'Free'}
                  </span>
                </div>
              ))}
            </div>
            {tables.length === 0 && (
              <p className="text-center text-surface-400 text-sm py-8">
                No tables configured yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
