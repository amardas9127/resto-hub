import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  UtensilsCrossed,
  LogOut,
  Menu,
  X,
  LayoutGrid,
  ChefHat,
  ClipboardList,
  Activity,
} from 'lucide-react';

const roleConfig = {
  waiter: {
    label: 'Waiter',
    accent: 'from-amber-400 to-amber-600',
    accentText: 'text-amber-400',
    accentBg: 'bg-amber-500/10 border-amber-500/20',
    nav: [
      { to: '/staff', icon: LayoutGrid, label: 'My Tables' },
    ],
  },
  chef: {
    label: 'Chef',
    accent: 'from-blue-400 to-blue-600',
    accentText: 'text-blue-400',
    accentBg: 'bg-blue-500/10 border-blue-500/20',
    nav: [
      { to: '/staff', icon: ChefHat, label: 'Kitchen Display' },
    ],
  },
  staff: {
    label: 'Staff',
    accent: 'from-green-400 to-green-600',
    accentText: 'text-green-400',
    accentBg: 'bg-green-500/10 border-green-500/20',
    nav: [
      { to: '/staff', icon: Activity, label: 'Order Status' },
    ],
  },
};

export default function StaffLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const config = roleConfig[user?.role] || roleConfig.staff;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-dvh bg-surface-50">
      {/* Top nav bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-surface-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.accent} flex items-center justify-center flex-shrink-0`}>
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-surface-900">
                Restro<span className={config.accentText}>Hub</span>
              </span>
              <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full border ${config.accentBg} ${config.accentText} capitalize`}>
                {config.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-surface-800">{user?.name}</p>
              <p className="text-xs text-surface-400 capitalize">{user?.role} · {user?.id}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-surface-500 hover:text-danger hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-6 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
