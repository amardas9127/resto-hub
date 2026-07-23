import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ArrowLeft, Delete, User, ChefHat, Users, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const roleColors = {
  waiter: { bg: 'from-amber-400 to-amber-600', light: 'bg-amber-500/10 border-amber-500/20', icon: 'text-amber-400', hover: 'hover:border-amber-500/60 hover:bg-amber-500/10' },
  chef:   { bg: 'from-blue-400 to-blue-600',   light: 'bg-blue-500/10 border-blue-500/20',   icon: 'text-blue-400',   hover: 'hover:border-blue-500/60 hover:bg-blue-500/10'   },
  staff:  { bg: 'from-green-400 to-green-600', light: 'bg-green-500/10 border-green-500/20', icon: 'text-green-400', hover: 'hover:border-green-500/60 hover:bg-green-500/10' },
};

const roleIcons = { waiter: User, chef: ChefHat, staff: Users };

export default function StaffLoginPage() {
  const { loginAsSubUser, getSubUsers } = useAuth();
  const navigate = useNavigate();
  const [step, setStep]               = useState('select'); // 'select' | 'pin'
  const [selectedUser, setSelectedUser] = useState(null);
  const [pin, setPin]                 = useState('');
  const [shake, setShake]             = useState(false);
  const [subUsers, setSubUsers]       = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [verifying, setVerifying]     = useState(false);

  // Load staff list from Supabase on mount
  useEffect(() => {
    async function load() {
      setLoadingUsers(true);
      const users = await getSubUsers();
      setSubUsers(users);
      setLoadingUsers(false);
    }
    load();
  }, [getSubUsers]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setPin('');
    setStep('pin');
  };

  const handlePinDigit = (digit) => {
    if (pin.length >= 4 || verifying) return;
    const newPin = pin + digit;
    setPin(newPin);

    if (newPin.length === 4) {
      setTimeout(async () => {
        setVerifying(true);
        const result = await loginAsSubUser(selectedUser.id, newPin);
        setVerifying(false);
        if (!result.success) {
          setShake(true);
          setTimeout(() => {
            setShake(false);
            setPin('');
          }, 600);
        }
      }, 150);
    }
  };

  const handleBackspace = () => {
    if (verifying) return;
    setPin(p => p.slice(0, -1));
  };

  const pinKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'];

  const roleColor = selectedUser ? roleColors[selectedUser.role] || roleColors.staff : roleColors.waiter;
  const RoleIcon  = selectedUser ? (roleIcons[selectedUser.role] || User) : User;

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900 px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="glass-dark rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <img src="/icon.png" alt="BillXaro" className="w-16 h-16 rounded-2xl object-contain mb-4 drop-shadow-lg" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Bill<span className="text-amber-400">Xaro</span>
            </h1>
            <p className="text-surface-400 text-sm mt-1">Staff Portal</p>
          </div>

          {step === 'select' && (
            <>
              <p className="text-center text-surface-300 text-sm font-medium mb-5">
                Select your profile to continue
              </p>

              {loadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                  <span className="ml-2 text-surface-400 text-sm">Loading staff…</span>
                </div>
              ) : subUsers.length === 0 ? (
                <div className="text-center py-8 text-surface-400 text-sm">
                  No staff accounts found. Ask the manager to add users.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {subUsers.map((u) => {
                    const colors = roleColors[u.role] || roleColors.staff;
                    const Icon   = roleIcons[u.role] || User;
                    return (
                      <button
                        key={u.id}
                        id={`staff-select-${u.id}`}
                        onClick={() => handleSelectUser(u)}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-surface-800/60 border border-surface-700 ${colors.hover} text-left transition-all duration-200 group`}
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm">{u.username}</p>
                          <p className="text-surface-500 text-xs mt-0.5 capitalize">{u.role} · ID: {u.id}</p>
                        </div>
                        <div className="text-surface-600 group-hover:text-surface-300 transition-colors text-xl">›</div>
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => navigate('/login')}
                className="w-full mt-6 py-2.5 text-sm text-surface-400 hover:text-surface-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Manager Login
              </button>
            </>
          )}

          {step === 'pin' && (
            <>
              <button
                onClick={() => setStep('select')}
                className="flex items-center gap-1.5 text-sm text-surface-400 hover:text-surface-200 transition-colors mb-5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              {/* User info */}
              <div className={`flex items-center gap-3 p-3 rounded-xl border mb-6 ${roleColor.light}`}>
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${roleColor.bg} flex items-center justify-center flex-shrink-0`}>
                  <RoleIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{selectedUser?.username}</p>
                  <p className={`${roleColor.icon} text-xs capitalize`}>{selectedUser?.role} · Enter 4-digit PIN</p>
                </div>
              </div>

              {/* PIN dots */}
              <div className={`flex justify-center gap-4 mb-8 ${shake ? 'animate-shake' : ''}`}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                      i < pin.length
                        ? 'bg-amber-400 border-amber-400 scale-110'
                        : 'bg-transparent border-surface-600'
                    }`}
                  />
                ))}
              </div>

              {/* Verifying overlay */}
              {verifying && (
                <div className="flex items-center justify-center py-2 mb-4">
                  <Loader2 className="w-5 h-5 text-amber-400 animate-spin mr-2" />
                  <span className="text-surface-400 text-sm">Verifying…</span>
                </div>
              )}

              {/* PIN Pad */}
              <div className="grid grid-cols-3 gap-3">
                {pinKeys.map((key, idx) => {
                  if (key === null) {
                    return <div key={idx} />;
                  }
                  if (key === 'del') {
                    return (
                      <button
                        key="del"
                        id="pin-backspace"
                        onClick={handleBackspace}
                        disabled={verifying}
                        className="py-4 rounded-xl bg-surface-800/50 border border-surface-700 text-surface-400 hover:text-white hover:bg-surface-700/60 transition-all flex items-center justify-center active:scale-95 disabled:opacity-40"
                      >
                        <Delete className="w-5 h-5" />
                      </button>
                    );
                  }
                  return (
                    <button
                      key={key}
                      id={`pin-key-${key}`}
                      onClick={() => handlePinDigit(String(key))}
                      disabled={verifying}
                      className="py-4 rounded-xl bg-surface-800/50 border border-surface-700 text-white text-xl font-semibold hover:bg-amber-500/10 hover:border-amber-500/40 transition-all active:scale-95 disabled:opacity-40"
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.5s ease; }
      `}</style>
    </div>
  );
}
