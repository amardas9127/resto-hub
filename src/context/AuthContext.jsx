import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const SUB_USER_ROLES = ['waiter', 'chef', 'staff'];

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore admin session from Supabase Auth ──────────────
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(buildAdminUser(session.user));
      }
      setLoading(false);
    });

    // Listen for auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(buildAdminUser(session.user));
      } else {
        // Only clear if the user was an admin (sub-users don't use Supabase Auth)
        setUser(prev => (prev?.role === 'admin' ? null : prev));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  function buildAdminUser(supabaseUser) {
    return {
      id:    supabaseUser.id,
      email: supabaseUser.email,
      name:  supabaseUser.user_metadata?.name || 'Manager',
      role:  supabaseUser.user_metadata?.role || 'admin',
    };
  }

  // ── Admin login (Supabase email + password) ───────────────
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast.error(error.message || 'Invalid credentials');
        return { success: false };
      }

      const u = buildAdminUser(data.user);
      setUser(u);
      toast.success(`Welcome back, ${u.name}!`);
      return { success: true };
    } catch {
      toast.error('Login failed. Please try again.');
      return { success: false };
    }
  };

  // ── Sub-user login (username + 4-digit PIN via Supabase) ──
  const loginAsSubUser = async (userId, pin) => {
    try {
      const { data, error } = await supabase
        .from('sub_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        toast.error('User not found');
        return { success: false };
      }
      if (data.pin !== pin) {
        toast.error('Incorrect PIN');
        return { success: false };
      }

      const u = { id: data.id, name: data.username, role: data.role };
      setUser(u);
      toast.success(`Welcome, ${data.username}!`);
      return { success: true };
    } catch {
      toast.error('Login failed. Check your connection.');
      return { success: false };
    }
  };

  // ── Sub-user management (Supabase only, no localStorage) ──
  const getSubUsers = async () => {
    const { data, error } = await supabase.from('sub_users').select('*').order('role');
    if (error) { console.warn('getSubUsers error:', error.message); return []; }
    return data || [];
  };

  const addSubUser = async (userData) => {
    const id = `${userData.role.charAt(0).toUpperCase()}${Date.now()}`;
    const newUser = { ...userData, id };

    const { error } = await supabase.from('sub_users').insert(newUser);
    if (error) {
      toast.error(`Failed to add user: ${error.message}`);
      return null;
    }
    toast.success(`${userData.username} added as ${userData.role}`);
    return newUser;
  };

  const removeSubUser = async (id) => {
    const { error } = await supabase.from('sub_users').delete().eq('id', id);
    if (error) {
      toast.error(`Failed to remove user: ${error.message}`);
      return;
    }
    toast.success('User removed');
  };

  const updateSubUser = async (id, updates) => {
    const { error } = await supabase.from('sub_users').update(updates).eq('id', id);
    if (error) {
      toast.error(`Failed to update user: ${error.message}`);
      return;
    }
    toast.success('User updated');
  };

  // ── Logout ────────────────────────────────────────────────
  const logout = async () => {
    if (user?.role === 'admin') {
      await supabase.auth.signOut();
    }
    setUser(null);
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider
      value={{
        user, loading,
        login, loginAsSubUser, logout,
        getSubUsers, addSubUser, removeSubUser, updateSubUser,
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
