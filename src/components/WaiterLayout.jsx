import { Outlet } from 'react-router-dom';
import { UtensilsCrossed, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function WaiterLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-dvh bg-surface-50 flex flex-col">
      {/* Waiter top bar */}
      <header className="sticky top-0 z-30 h-14 bg-white/90 backdrop-blur-lg border-b border-surface-200 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-surface-900 tracking-tight">
            Restro<span className="text-amber-500">Hub</span>
          </span>
          <span className="hidden sm:inline text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full ml-1">
            Waiter
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-50 border border-surface-200">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0) || 'W'}
            </div>
            <span className="text-sm font-medium text-surface-700 max-w-[120px] truncate">
              {user?.name || 'Waiter'}
            </span>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-xl hover:bg-danger/10 text-surface-400 hover:text-danger transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 max-w-5xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
