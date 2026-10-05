import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2, ShieldCheck, Mail, Lock, ArrowRight,
  AlertCircle, CheckCircle2, User, KeyRound, Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AuthorityLogin() {
  const navigate = useNavigate();
  const { login } = useApp();

  const [email, setEmail] = useState('authority@civicconnect.in');
  const [password, setPassword] = useState('authority123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email.trim(), password);
      if (user.role !== 'authority') {
        setError('Access denied: This account does not have municipal authority privileges.');
        return;
      }
      navigate('/authority');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your authority credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('authority@civicconnect.in');
    setPassword('authority123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-gray-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Icon */}
        <div className="mx-auto w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-lg mb-4 backdrop-blur-xs">
          <Building2 size={30} className="text-white" />
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-center text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Municipal Authority Portal
        </h1>
        <p className="mt-2 text-center text-sm text-green-200">
          Sign in to manage and resolve civic reports.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-shake">
              <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="authority-login-email" className="block text-xs font-semibold text-gray-700 mb-1">
                Authority Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail size={16} />
                </div>
                <input
                  id="authority-login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="authority@civicconnect.in"
                  className="input-field pl-10 text-sm py-2.5"
                />
              </div>
            </div>

            <div>
              <label htmlFor="authority-login-password" className="block text-xs font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock size={16} />
                </div>
                <input
                  id="authority-login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10 text-sm py-2.5"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                id="authority-login-submit"
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 active:scale-98 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Demo Credentials Hint */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound size={13} className="text-emerald-700" />
                  Demo Authority Credentials
                </span>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="text-[11px] font-bold text-green-700 hover:text-green-800 underline cursor-pointer"
                >
                  Quick Fill
                </button>
              </div>
              <div className="text-xs text-emerald-800 space-y-0.5">
                <p>Email: <code className="bg-white/80 px-1.5 py-0.5 rounded text-emerald-900 font-mono font-semibold">authority@civicconnect.in</code></p>
                <p>Password: <code className="bg-white/80 px-1.5 py-0.5 rounded text-emerald-900 font-mono font-semibold">authority123</code></p>
              </div>
            </div>
          </div>

          {/* Switch to Citizen Login */}
          <div className="mt-5 text-center">
            <Link
              to="/login"
              id="switch-to-citizen-login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-green-700 transition-colors"
            >
              <User size={13} />
              <span>Citizen resident? Go to Citizen Login</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
