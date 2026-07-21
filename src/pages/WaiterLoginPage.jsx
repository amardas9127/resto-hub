import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ArrowLeft, Delete, User } from 'lucide-react';
import { useAuth, DEFAULT_WAITERS } from '../context/AuthContext';

export default function WaiterLoginPage() {
  const { loginAsWaiter } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('select'); // 'select' | 'pin'
  const [selectedWaiter, setSelectedWaiter] = useState(null);
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);

  const waiters = DEFAULT_WAITERS;

  const handleSelectWaiter = (waiter) => {
    setSelectedWaiter(waiter);
    setPin('');
    setStep('pin');
  };

  const handlePinDigit = (digit) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);

    if (newPin.length === 4) {
      // Auto-submit when 4 digits entered
      setTimeout(() => {
        const result = loginAsWaiter(selectedWaiter.id, newPin);
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
    setPin(p => p.slice(0, -1));
  };

  const pinKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'];

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
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/25">
              <UtensilsCrossed className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Restro<span className="text-amber-400">Hub</span>
            </h1>
            <p className="text-surface-400 text-sm mt-1">Waiter Portal</p>
          </div>

          {step === 'select' && (
            <>
              <p className="text-center text-surface-300 text-sm font-medium mb-5">
                Select your name to continue
              </p>
              <div className="space-y-2.5">
                {waiters.map((w) => (
                  <button
                    key={w.id}
                    id={`waiter-select-${w.id}`}
                    onClick={() => handleSelectWaiter(w)}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-surface-800/60 border border-surface-700 hover:border-amber-500/60 hover:bg-amber-500/10 text-left transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-amber-400/30 group-hover:to-amber-600/30 transition-all">
                      <User className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{w.name}</p>
                      <p className="text-surface-500 text-xs mt-0.5">Waiter • Enter PIN to login</p>
                    </div>
                    <div className="ml-auto text-surface-600 group-hover:text-amber-400 transition-colors text-xl">›</div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full mt-6 py-2.5 text-sm text-surface-400 hover:text-surface-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Admin Login
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

              {/* Waiter info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{selectedWaiter?.name}</p>
                  <p className="text-amber-400/70 text-xs">Enter your 4-digit PIN</p>
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
                        className="py-4 rounded-xl bg-surface-800/50 border border-surface-700 text-surface-400 hover:text-white hover:bg-surface-700/60 transition-all flex items-center justify-center active:scale-95"
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
                      className="py-4 rounded-xl bg-surface-800/50 border border-surface-700 text-white text-xl font-semibold hover:bg-amber-500/10 hover:border-amber-500/40 transition-all active:scale-95"
                    >
                      {key}
                    </button>
                  );
                })}
              </div>

              <p className="text-center text-surface-600 text-xs mt-6">
                Demo PINs: Amit → 1234 · Sneha → 2222 · Rahul → 3333
              </p>
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
