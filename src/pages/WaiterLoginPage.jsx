import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Loader2, Utensils } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function WaiterLoginPage() {
  const navigate = useNavigate();
  const [pinCode, setPinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pinCode || pinCode.length !== 4 || !/^\d{4}$/.test(pinCode)) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Get user by email (waiter account in Supabase DB)
      const { data: userRes, error: userError } = await supabase
        .from('users')
        .select('id, pin')
        .eq('email', 'waiter@restrohub.com')
        .single();

      if (userError || !userRes) {
        throw new Error('Waiter account not found');
      }

      // 2. Verify PIN
      if (userRes.pin !== pinCode) {
        throw new Error('Invalid PIN');
      }

      // 3. Store user info in localStorage (so MenuPage knows who is ordering)
      localStorage.setItem('waiter_user', JSON.stringify({
        id: userRes.id,
        email: 'waiter@restrohub.com'
      }));

      // 4. Redirect to WaiterTablesPage
      navigate('/waiter-tables');
    } catch (err) {
      setError(err.message || 'Failed to log in. Please contact manager.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900 px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-scale-in">
        {/* Card */}
        <div className="glass-dark rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img src="/icon.png" alt="BillXaro" className="w-16 h-16 rounded-2xl object-contain mb-4 drop-shadow-lg" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Bill<span className="text-primary-400">Xaro</span>
            </h1>
            <p className="text-surface-400 text-sm mt-1">
              Waiter Login
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                4-Digit PIN
              </label>
              <input
                id="waiter-pin"
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={pinCode}
                onChange={e => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className="w-full px-4 py-3 text-center text-2xl tracking-[0.4em] bg-surface-800/50 border border-surface-700 rounded-xl text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                required
              />
              {error && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-1.5">
                  <span>{error}</span>
                </p>
              )}
            </div>

            <button
              id="waiter-login-submit"
              type="submit"
              disabled={loading || pinCode.length !== 4}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Back to Manager button */}
          <button
            id="back-to-manager-btn"
            type="button"
            onClick={() => navigate('/')}
            className="w-full mt-4 py-2 flex items-center justify-center gap-2 rounded-xl border border-surface-700 bg-surface-800/50 text-surface-400 font-medium text-sm hover:bg-surface-800 hover:border-surface-600 transition-all duration-200"
          >
            <Utensils className="w-4 h-4" />
            Back to Manager Login
          </button>

          {/* Info hint */}
          <div className="mt-6 p-3 rounded-xl bg-surface-800/50 border border-surface-700/50">
            <p className="text-xs text-surface-400 text-center leading-relaxed">
              This is a demo. The default waiter PIN is: <strong>1122</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
