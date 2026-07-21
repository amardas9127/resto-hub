import { useState } from 'react';
import { Plus, Trash2, X, ChefHat, User, Users, Edit2, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';

const ROLES = ['waiter', 'chef', 'staff'];

const roleConfig = {
  waiter: { icon: User,    bg: 'bg-amber-100',  text: 'text-amber-700',  badge: 'bg-amber-50 text-amber-700 border-amber-200'  },
  chef:   { icon: ChefHat, bg: 'bg-blue-100',   text: 'text-blue-700',   badge: 'bg-blue-50 text-blue-700 border-blue-200'     },
  staff:  { icon: Users,   bg: 'bg-green-100',  text: 'text-green-700',  badge: 'bg-green-50 text-green-700 border-green-200'  },
};

function AddUserModal({ open, onClose, onAdd }) {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState('waiter');
  const [pinError, setPinError] = useState('');

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    if (!/^\d{4}$/.test(pin)) { setPinError('PIN must be exactly 4 digits'); return; }
    onAdd({ username: username.trim(), pin, role });
    setUsername(''); setPin(''); setRole('waiter'); setPinError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h3 className="text-lg font-semibold text-surface-900">Add Staff Account</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Role selector */}
          <div>
            <label className="block text-sm font-medium text-surface-600 mb-2">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(r => {
                const cfg = roleConfig[r];
                const Icon = cfg.icon;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium capitalize transition-all border-2
                      ${role === r
                        ? `${cfg.bg} ${cfg.text} border-current shadow-sm`
                        : 'bg-surface-50 border-surface-200 text-surface-500 hover:border-surface-300'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-surface-600 mb-1.5">Full Name / Username</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. Amit Patel"
              className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
              autoFocus
              required
            />
          </div>

          {/* PIN */}
          <div>
            <label className="block text-sm font-medium text-surface-600 mb-1.5">
              <Key className="w-3.5 h-3.5 inline mr-1" />4-Digit PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={e => { setPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinError(''); }}
              placeholder="••••"
              className={`w-full px-4 py-2.5 border rounded-xl text-surface-800 focus:outline-none focus:ring-2 transition-all text-center text-xl tracking-widest font-mono
                ${pinError ? 'border-red-300 focus:ring-red-300/30' : 'border-surface-200 focus:ring-primary-500/30 focus:border-primary-400'}`}
              required
            />
            {pinError && <p className="text-xs text-red-500 mt-1">{pinError}</p>}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-surface-200 rounded-xl text-surface-600 font-medium hover:bg-surface-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/20">Add Account</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditPinModal({ open, user, onClose, onUpdate }) {
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  if (!open || !user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(pin)) { setPinError('PIN must be exactly 4 digits'); return; }
    onUpdate(user.id, { pin });
    setPin(''); setPinError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h3 className="text-base font-semibold text-surface-900">Change PIN — {user.username}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-600 mb-1.5">New 4-Digit PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={e => { setPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinError(''); }}
              placeholder="••••"
              className={`w-full px-4 py-2.5 border rounded-xl text-surface-800 focus:outline-none focus:ring-2 transition-all text-center text-xl tracking-widest font-mono
                ${pinError ? 'border-red-300 focus:ring-red-300/30' : 'border-surface-200 focus:ring-primary-500/30 focus:border-primary-400'}`}
              autoFocus
              required
            />
            {pinError && <p className="text-xs text-red-500 mt-1">{pinError}</p>}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-surface-200 rounded-xl text-surface-600 font-medium hover:bg-surface-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors">Update PIN</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { addSubUser, removeSubUser, updateSubUser, getSubUsers } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [editPinUser, setEditPinUser] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null); // user object

  const subUsers = getSubUsers();

  const byRole = ROLES.reduce((acc, r) => {
    acc[r] = subUsers.filter(u => u.role === r);
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-surface-500 text-sm">{subUsers.length} staff accounts</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-sm rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/20"
        >
          <Plus className="w-4 h-4" /> Add Staff Account
        </button>
      </div>

      {ROLES.map(role => {
        const cfg = roleConfig[role];
        const Icon = cfg.icon;
        const users = byRole[role] || [];

        return (
          <div key={role}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-6 h-6 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 ${cfg.text}`} />
              </div>
              <h3 className="font-semibold text-surface-800 capitalize">{role}s</h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-surface-100 text-surface-500">{users.length}</span>
            </div>

            {users.length === 0 ? (
              <div className="p-5 rounded-xl border-2 border-dashed border-surface-200 text-center">
                <p className="text-sm text-surface-400">No {role} accounts yet. Add one above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {users.map(u => (
                  <div key={u.id} className="bg-white rounded-xl border border-surface-200 p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${cfg.text}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-surface-800 truncate">{u.username}</p>
                          <p className="text-xs text-surface-400 mt-0.5">ID: {u.id}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setConfirmRemove(u)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-surface-300 hover:text-red-500 transition-colors flex-shrink-0"
                        title="Remove user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-surface-100 flex items-center justify-between">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${cfg.badge}`}>
                        {u.role}
                      </span>
                      <button
                        onClick={() => setEditPinUser(u)}
                        className="flex items-center gap-1 text-xs font-medium text-surface-400 hover:text-primary-600 transition-colors"
                      >
                        <Key className="w-3 h-3" />
                        Change PIN
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {subUsers.length === 0 && !showAdd && (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-surface-300" />
          </div>
          <h3 className="text-lg font-semibold text-surface-700">No staff accounts yet</h3>
          <p className="text-surface-400 mt-1 text-sm">Add waiters, chefs, and staff members.</p>
        </div>
      )}

      <AddUserModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={addSubUser} />
      <EditPinModal open={!!editPinUser} user={editPinUser} onClose={() => setEditPinUser(null)} onUpdate={updateSubUser} />

      {/* Confirm: Remove staff account */}
      <ConfirmDialog
        open={!!confirmRemove}
        title="Remove staff account?"
        message={`"${confirmRemove?.username}" (${confirmRemove?.role}) will lose access immediately. This cannot be undone.`}
        confirmLabel="Remove Account"
        variant="danger"
        onConfirm={() => { removeSubUser(confirmRemove.id); setConfirmRemove(null); }}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  );
}
