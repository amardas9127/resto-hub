import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  ChefHat,
  Clock,
  CheckCircle2,
  CircleDashed,
  Flame,
  Utensils,
  BarChart3,
  CalendarDays,
  Star,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { format, formatDistanceToNow } from 'date-fns';

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, trend, trendUp, gradient, accentClass, delay = 0 }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-default"
      style={{
        background: gradient,
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -right-2 w-20 h-20 rounded-full bg-white/5" />

      <div className="relative flex items-start justify-between">
        <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span
            className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-1 rounded-full ${
              trendUp ? 'bg-white/25 text-white' : 'bg-white/15 text-white/80'
            }`}
          >
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </div>

      <div className="relative mt-5">
        <p className="text-3xl font-bold tracking-tight leading-none">{value}</p>
        <p className="text-sm text-white/75 mt-1.5 font-medium">{label}</p>
      </div>
    </div>
  );
}

// ── Kitchen Order Row ────────────────────────────────────────────────────────
function KitchenOrderRow({ order }) {
  const statusConfig = {
    pending:    { color: 'bg-amber-100 text-amber-700',   icon: Clock,         label: 'Pending' },
    preparing:  { color: 'bg-blue-100 text-blue-700',     icon: ChefHat,       label: 'Preparing' },
    ready:      { color: 'bg-green-100 text-green-700',   icon: CheckCircle2,  label: 'Ready' },
    delivered:  { color: 'bg-surface-100 text-surface-500', icon: CircleDashed, label: 'Delivered' },
  };
  const cfg = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = cfg.icon;

  return (
    <div className="flex items-center gap-3 py-3 px-4 hover:bg-surface-50 rounded-xl transition-colors group">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-sm">
        <span className="text-[11px] font-bold text-white">{order.tableName?.replace('Table ', 'T') || 'T?'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-surface-800 truncate">{order.tableName}</p>
        <p className="text-xs text-surface-400 truncate">{(order.items || []).map(i => `${i.qty}× ${i.name}`).join(', ')}</p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
          <StatusIcon className="w-3 h-3" />
          {cfg.label}
        </span>
        <span className="text-[10px] text-surface-400">
          {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}

// ── Recent Bill Row ──────────────────────────────────────────────────────────
function RecentBillRow({ bill, index }) {
  const paymentColors = {
    cash: 'bg-green-100 text-green-700',
    card: 'bg-blue-100 text-blue-700',
    upi:  'bg-purple-100 text-purple-700',
  };
  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-surface-50 rounded-xl transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0 font-bold text-xs text-surface-600">
          #{index + 1}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-surface-800 truncate">{bill.tableName}</p>
          <p className="text-xs text-surface-400">
            {bill.items?.length || 0} items
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-3">
        <p className="text-sm font-bold text-surface-900">₹{bill.total?.toLocaleString()}</p>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${paymentColors[bill.paymentMethod] || 'bg-surface-100 text-surface-500'}`}>
          {bill.paymentMethod?.toUpperCase() || 'CASH'}
        </span>
      </div>
    </div>
  );
}

// ── Table Cell ───────────────────────────────────────────────────────────────
function TableCell({ table }) {
  const occupied = table.status === 'occupied';
  return (
    <div
      className={`relative p-3 rounded-xl border-2 text-center transition-all duration-200 group cursor-default
        ${occupied
          ? 'border-primary-300 bg-gradient-to-br from-primary-50 to-amber-50 shadow-sm shadow-primary-100'
          : 'border-surface-200 bg-surface-50 hover:border-surface-300 hover:bg-white'
        }`}
    >
      {occupied && (
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
      )}
      <Utensils className={`w-4 h-4 mx-auto mb-1.5 ${occupied ? 'text-primary-500' : 'text-surface-300'}`} />
      <p className="text-xs font-bold text-surface-800 truncate leading-tight">{table.name}</p>
      <span
        className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide
          ${occupied ? 'bg-primary-200 text-primary-800' : 'bg-green-100 text-green-700'}`}
      >
        {occupied ? 'Busy' : 'Free'}
      </span>
    </div>
  );
}

// ── Mini Progress Bar ────────────────────────────────────────────────────────
function ProgressBar({ value, max, colorClass = 'bg-primary-500' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full bg-surface-100 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Quick Stat Strip ─────────────────────────────────────────────────────────
function QuickStat({ label, value, sub, icon: Icon, iconBg }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs text-surface-500 font-medium">{label}</span>
          <span className="text-sm font-bold text-surface-800">{value}</span>
        </div>
        {sub}
      </div>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { tables, orders, bills, employees, kitchenOrders } = useStore();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetingEmoji = hour < 12 ? '🌤️' : hour < 17 ? '☀️' : '🌙';

  const occupiedTables  = tables.filter(t => t.status === 'occupied').length;
  const freeTables      = tables.length - occupiedTables;
  const activeOrders    = Object.keys(orders).length;
  const pendingKitchen  = kitchenOrders.filter(o => o.status === 'pending').length;
  const preparingKitchen = kitchenOrders.filter(o => o.status === 'preparing').length;
  const readyKitchen    = kitchenOrders.filter(o => o.status === 'ready').length;

  const todayBills = bills.filter(b => {
    const d = new Date(b.createdAt);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });
  const todayRevenue  = todayBills.reduce((sum, b) => sum + (b.total || 0), 0);
  const totalRevenue  = bills.reduce((sum, b) => sum + (b.total || 0), 0);
  const avgBillValue  = todayBills.length > 0 ? Math.round(todayRevenue / todayBills.length) : 0;

  const liveKitchenOrders = kitchenOrders.filter(o => !o.billed).slice(0, 6);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">

      {/* ── Hero Greeting Banner ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1a1a2e 100%)' }}>
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-20 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', transform: 'translate(-20%, 30%)' }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-primary-400 text-sm font-semibold tracking-widest uppercase mb-1">
              {format(new Date(), 'EEEE, d MMMM yyyy')}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
              {greeting}, Manager! {greetingEmoji}
            </h1>
            <p className="text-surface-400 mt-1.5 text-sm md:text-base">
              Here's a live overview of your restaurant right now.
            </p>
          </div>

          <div className="flex gap-3 flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/10">
              <p className="text-2xl font-bold text-white">{tables.length}</p>
              <p className="text-[11px] text-surface-400 font-medium mt-0.5">Total Tables</p>
            </div>
            <div className="bg-primary-500/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-primary-500/30">
              <p className="text-2xl font-bold text-primary-300">{occupiedTables}</p>
              <p className="text-[11px] text-primary-400 font-medium mt-0.5">Occupied</p>
            </div>
            <div className="bg-green-500/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-green-500/30">
              <p className="text-2xl font-bold text-green-300">{employees.length}</p>
              <p className="text-[11px] text-green-400 font-medium mt-0.5">Staff</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Today's Revenue"
          value={`₹${todayRevenue.toLocaleString()}`}
          trend={todayBills.length > 0 ? `${todayBills.length} bills` : null}
          trendUp
          gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
          delay={0}
        />
        <StatCard
          icon={ShoppingCart}
          label="Active Orders"
          value={activeOrders}
          trend={pendingKitchen > 0 ? `${pendingKitchen} pending` : liveKitchenOrders.length > 0 ? `${liveKitchenOrders.length} live` : null}
          trendUp={false}
          gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
          delay={75}
        />
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          trend={bills.length > 0 ? `${bills.length} total bills` : null}
          trendUp
          gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
          delay={150}
        />
        <StatCard
          icon={Users}
          label="Tables Occupied"
          value={`${occupiedTables} / ${tables.length}`}
          trend={freeTables > 0 ? `${freeTables} free` : 'All full!'}
          trendUp={freeTables > 0}
          gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
          delay={225}
        />
      </div>

      {/* ── Middle Row: Quick Stats + Kitchen Live ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick Insights Panel */}
        <div className="bg-white rounded-2xl border border-surface-100 shadow-sm p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-surface-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary-500" />
              Today's Insights
            </h3>
            <span className="text-[11px] text-surface-400 bg-surface-50 px-2 py-1 rounded-full font-medium">
              {format(new Date(), 'dd MMM')}
            </span>
          </div>

          <div className="space-y-4">
            <QuickStat
              label="Bills Raised"
              value={todayBills.length}
              icon={CalendarDays}
              iconBg="bg-gradient-to-br from-green-400 to-emerald-600"
              sub={<ProgressBar value={todayBills.length} max={Math.max(todayBills.length, 20)} colorClass="bg-green-500" />}
            />
            <QuickStat
              label="Avg. Bill Value"
              value={avgBillValue > 0 ? `₹${avgBillValue}` : '—'}
              icon={Star}
              iconBg="bg-gradient-to-br from-primary-400 to-amber-600"
              sub={<ProgressBar value={avgBillValue} max={2000} colorClass="bg-primary-500" />}
            />
            <QuickStat
              label="Kitchen: Pending"
              value={pendingKitchen}
              icon={Clock}
              iconBg="bg-gradient-to-br from-rose-400 to-red-600"
              sub={<ProgressBar value={pendingKitchen} max={Math.max(pendingKitchen + preparingKitchen + readyKitchen, 1)} colorClass="bg-rose-500" />}
            />
            <QuickStat
              label="Kitchen: Preparing"
              value={preparingKitchen}
              icon={Flame}
              iconBg="bg-gradient-to-br from-blue-400 to-indigo-600"
              sub={<ProgressBar value={preparingKitchen} max={Math.max(pendingKitchen + preparingKitchen + readyKitchen, 1)} colorClass="bg-blue-500" />}
            />
            <QuickStat
              label="Kitchen: Ready"
              value={readyKitchen}
              icon={CheckCircle2}
              iconBg="bg-gradient-to-br from-teal-400 to-green-600"
              sub={<ProgressBar value={readyKitchen} max={Math.max(pendingKitchen + preparingKitchen + readyKitchen, 1)} colorClass="bg-teal-500" />}
            />
          </div>
        </div>

        {/* Live Kitchen Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-surface-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
            <h3 className="font-bold text-surface-800 flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-blue-500" />
              Live Kitchen Orders
            </h3>
            {liveKitchenOrders.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                {liveKitchenOrders.length} active
              </span>
            )}
          </div>
          <div className="divide-y divide-surface-50 max-h-72 overflow-y-auto">
            {liveKitchenOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-surface-400">
                <ChefHat className="w-10 h-10 mb-3 text-surface-200" />
                <p className="text-sm font-medium">All quiet in the kitchen!</p>
                <p className="text-xs mt-1">No active orders right now.</p>
              </div>
            ) : (
              liveKitchenOrders.map(order => (
                <KitchenOrderRow key={order.id} order={order} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Recent Bills + Table Map ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Bills */}
        <div className="bg-white rounded-2xl border border-surface-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
            <h3 className="font-bold text-surface-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Recent Bills
            </h3>
            {bills.length > 0 && (
              <span className="text-xs text-surface-400 bg-surface-50 px-2.5 py-1 rounded-full font-medium">
                ₹{totalRevenue.toLocaleString()} total
              </span>
            )}
          </div>
          <div className="divide-y divide-surface-50 max-h-80 overflow-y-auto">
            {bills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-surface-400">
                <DollarSign className="w-10 h-10 mb-3 text-surface-200" />
                <p className="text-sm font-medium">No bills yet</p>
                <p className="text-xs mt-1">Start taking orders to generate bills.</p>
              </div>
            ) : (
              bills.slice(0, 8).map((bill, i) => (
                <RecentBillRow key={bill.id} bill={bill} index={i} />
              ))
            )}
          </div>
        </div>

        {/* Table Map */}
        <div className="bg-white rounded-2xl border border-surface-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
            <h3 className="font-bold text-surface-800 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-primary-500" />
              Table Map
            </h3>
            <div className="flex items-center gap-3 text-xs text-surface-400 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-400" />
                Busy ({occupiedTables})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                Free ({freeTables})
              </span>
            </div>
          </div>
          <div className="p-5">
            {tables.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-surface-400">
                <Utensils className="w-10 h-10 mb-3 text-surface-200" />
                <p className="text-sm font-medium">No tables configured</p>
                <p className="text-xs mt-1">Add tables in the Tables section.</p>
              </div>
            ) : (
              <>
                {/* Occupancy bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-medium text-surface-500 mb-1.5">
                    <span>Occupancy</span>
                    <span>{tables.length > 0 ? Math.round((occupiedTables / tables.length) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-surface-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-700"
                      style={{ width: `${tables.length > 0 ? (occupiedTables / tables.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-2.5">
                  {tables.map(table => (
                    <TableCell key={table.id} table={table} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
