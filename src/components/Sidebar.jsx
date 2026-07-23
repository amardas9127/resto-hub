import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Grid3X3,
  ClipboardList,
  ChefHat,
  Receipt,
  Users,
  X,
  UserCog,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: UtensilsCrossed, label: 'Menu Book' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tables', icon: Grid3X3, label: 'Tables' },
  { to: '/menu', icon: UtensilsCrossed, label: 'Manage Menu' },
  { to: '/kitchen', icon: ChefHat, label: 'Kitchen' },
  { to: '/bills', icon: Receipt, label: 'Bills' },
  { to: '/users', icon: UserCog, label: 'Users' },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-dvh w-60 bg-white border-r border-surface-200
          flex flex-col transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-surface-200">
          <div className="flex items-center gap-2.5">
            <img src="/icon.png" alt="BillXaro" className="w-8 h-8 rounded-lg object-contain" />
            <span className="text-lg font-bold text-surface-900 tracking-tight">
              Bill<span className="text-primary-500">Xaro</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-surface-500 hover:bg-surface-50 hover:text-surface-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-[18px] h-[18px] transition-colors ${
                      isActive ? 'text-primary-600' : 'text-surface-400 group-hover:text-surface-600'
                    }`}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-surface-200">
          <p className="text-xs text-surface-400 text-center">
            BillXaro v1.0 · Admin
          </p>
        </div>
      </aside>
    </>
  );
}
