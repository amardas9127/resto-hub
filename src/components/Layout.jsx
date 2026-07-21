import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/tables': 'Table Management',
  '/menu': 'Menu Management',
  '/kitchen': 'Kitchen Display',
  '/bills': 'Billing History',
  '/users': 'User Management',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const baseTitle = Object.entries(pageTitles).find(
    ([path]) => location.pathname === path || location.pathname.startsWith(path + '/')
  );
  const title = baseTitle?.[1] || 'RestroHub';

  return (
    <div className="flex h-dvh overflow-hidden bg-surface-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
