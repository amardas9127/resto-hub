import { Menu, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ onMenuClick, title }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-lg border-b border-surface-200 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-surface-100 text-surface-500 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg md:text-xl font-semibold text-surface-900 tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button className="relative p-2 rounded-xl hover:bg-surface-100 text-surface-500 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
        </button>

        {/* User pill */}
        <div className="hidden sm:flex items-center gap-2.5 pl-3 pr-1 py-1 rounded-full bg-surface-50 border border-surface-200">
          <span className="text-sm font-medium text-surface-700 truncate max-w-[120px]">
            {user?.name || 'Admin'}
          </span>
          <button
            onClick={logout}
            className="p-1.5 rounded-full hover:bg-danger/10 text-surface-400 hover:text-danger transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile logout */}
        <button
          onClick={logout}
          className="sm:hidden p-2 rounded-xl hover:bg-danger/10 text-surface-400 hover:text-danger transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
