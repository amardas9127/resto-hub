import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';

import Layout from './components/Layout';
import StaffLayout from './components/StaffLayout';
import LoginPage from './pages/LoginPage';
import StaffLoginPage from './pages/StaffLoginPage';
import Dashboard from './pages/Dashboard';
import TablesPage from './pages/TablesPage';
import MenuPage from './pages/MenuPage';
import OrderPage from './pages/OrderPage';
import KitchenPage from './pages/KitchenPage';
import BillsPage from './pages/BillsPage';
import UsersPage from './pages/UsersPage';
import WaiterTablesPage from './pages/WaiterTablesPage';
import ChefPortal from './pages/ChefPortal';
import StaffPortal from './pages/StaffPortal';

import PublicMenuBook from './pages/PublicMenuBook';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-50">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
  </div>
);

/** Only accessible when NOT logged in */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) {
    if (user.role === 'admin') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/staff" replace />;
  }
  return children;
};

/** Only accessible when logged in as admin/manager */
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/staff" replace />;
  return children;
};

/** Only accessible for sub-users: waiter, chef, staff */
const StaffRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/staff-login" replace />;
  if (user.role === 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

/** Renders the correct portal page based on sub-user role */
function StaffHome() {
  const { user } = useAuth();
  if (user?.role === 'chef') return <ChefPortal />;
  if (user?.role === 'waiter') return <WaiterTablesPage />;
  return <StaffPortal />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 2500,
              style: {
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: 500,
              },
            }}
          />
          <Routes>
            {/* ── Public Digital Menu Book landing page ── */}
            <Route path="/" element={<PublicMenuBook />} />

            {/* ── Public auth routes ── */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/staff-login"
              element={
                <PublicRoute>
                  <StaffLoginPage />
                </PublicRoute>
              }
            />

            {/* ── Admin / Manager routes ── */}
            <Route
              element={
                <AdminRoute>
                  <Layout />
                </AdminRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tables" element={<TablesPage />} />
              <Route path="menu" element={<MenuPage />} />
              <Route path="orders/:tableId" element={<OrderPage />} />
              <Route path="kitchen" element={<KitchenPage />} />
              <Route path="bills" element={<BillsPage />} />
              <Route path="users" element={<UsersPage />} />
            </Route>

            {/* ── Staff routes (waiter / chef / staff) ── */}
            <Route
              path="/staff"
              element={
                <StaffRoute>
                  <StaffLayout />
                </StaffRoute>
              }
            >
              <Route index element={<StaffHome />} />
              <Route path="orders/:tableId" element={<OrderPage />} />
            </Route>

            {/* ── Catch-all ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
