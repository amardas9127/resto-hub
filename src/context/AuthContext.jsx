import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

// Roles: admin | waiter | chef | staff
export const SUB_USER_ROLES = ['waiter', 'chef', 'staff'];

const DEFAULT_SUB_USERS = [
  { id: 'W1', username: 'Amit Patel',  pin: '1234', role: 'waiter' },
  { id: 'W2', username: 'Sneha Rao',   pin: '2222', role: 'waiter' },
  { id: 'C1', username: 'Ravi Kumar',  pin: '3333', role: 'chef'   },
  { id: 'C2', username: 'Priya Singh', pin: '4444', role: 'chef'   },
  { id: 'S1', username: 'Mohan Das',   pin: '5555', role: 'staff'  },
];

function getSubUsers() {
  try {
    const saved = localStorage.getItem('restrohub_sub_users');
    return saved ? JSON.parse(saved) : DEFAULT_SUB_USERS;
  } catch {
    return DEFAULT_SUB_USERS;
  }
}

export function saveSubUsers(users) {
  localStorage.setItem('restrohub_sub_users', JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('restrohub_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);

    // Sync sub_users from Supabase
    supabase.from('sub_users').select('*').then(({ data, error }) => {
      if (!error && data?.length) {
        saveSubUsers(data);
      }
    }).catch(() => {});
  }, []);

  // ── Admin login (Supabase email + password) ──────────────
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        // Demo fallback
        if (email === 'admin@restrohub.com' && password === 'admin123') {
          const u = { id: 'demo-admin', email, name: 'Admin', role: 'admin' };
          setUser(u);
          localStorage.setItem('restrohub_user', JSON.stringify(u));
          toast.success('Welcome, Admin! (demo mode)');
          return { success: true };
        }
        toast.error('Invalid credentials');
        return { success: false };
      }

      const u = {
        id:    data.user.id,
        email: data.user.email,
        name:  data.user.user_metadata?.name || 'Manager',
        role:  data.user.user_metadata?.role || 'admin',
      };
      setUser(u);
      localStorage.setItem('restrohub_user', JSON.stringify(u));
      toast.success(`Welcome back, ${u.name}!`);
      return { success: true };
    } catch {
      // Demo fallback on network error
      if (email === 'admin@restrohub.com' && password === 'admin123') {
        const u = { id: 'demo-admin', email, name: 'Admin', role: 'admin' };
        setUser(u);
        localStorage.setItem('restrohub_user', JSON.stringify(u));
        toast.success('Welcome, Admin! (demo mode)');
        return { success: true };
      }
      toast.error('Login failed');
      return { success: false };
    }
  };

  // ── Sub-user login (username + 4-digit PIN) ──────────────
  const loginAsSubUser = (userId, pin) => {
    const users = getSubUsers();
    const found = users.find(u => u.id === userId);
    if (!found) { toast.error('User not found'); return { success: false }; }
    if (found.pin !== pin) { toast.error('Incorrect PIN'); return { success: false }; }

    const u = { id: found.id, name: found.username, role: found.role };
    setUser(u);
    localStorage.setItem('restrohub_user', JSON.stringify(u));
    toast.success(`Welcome, ${found.username}!`);
    return { success: true };
  };

  // ── Admin helpers for managing sub-users ─────────────────
  const addSubUser = (userData) => {
    const users = getSubUsers();
    const id = `${userData.role.charAt(0).toUpperCase()}${Date.now()}`;
    const newUser = { ...userData, id };
    const updated = [...users, newUser];
    saveSubUsers(updated);
    toast.success(`${userData.username} added as ${userData.role}`);
    supabase.from('sub_users').insert(newUser).then(({ error }) => {
      if (error) console.warn('Supabase sub_users sync notice:', error.message);
    });
    return newUser;
  };

  const removeSubUser = (id) => {
    const users = getSubUsers().filter(u => u.id !== id);
    saveSubUsers(users);
    toast.success('User removed');
    supabase.from('sub_users').delete().eq('id', id).then(({ error }) => {
      if (error) console.warn('Supabase sub_users sync notice:', error.message);
    });
  };

  const updateSubUser = (id, updates) => {
    const users = getSubUsers().map(u => u.id === id ? { ...u, ...updates } : u);
    saveSubUsers(users);
    toast.success('User updated');
    supabase.from('sub_users').update(updates).eq('id', id).then(({ error }) => {
      if (error) console.warn('Supabase sub_users sync notice:', error.message);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('restrohub_user');
    supabase.auth.signOut().catch(() => {});
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider
      value={{
        user, loading,
        login, loginAsSubUser, logout,
        addSubUser, removeSubUser, updateSubUser,
        getSubUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
