import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin, User, Building2, Mail, Lock, ArrowRight,
  AlertCircle, CheckCircle2, KeyRound, Loader2, Shield
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useApp();

  // Active role tab: 'citizen' | 'authority'
  const [activeRole, setActiveRole] = useState('citizen');

  // Form inputs
  const [citizenEmail, setCitizenEmail] = useState('citizen@civicconnect.in');
  const [citizenPassword, setCitizenPassword] = useState('citizen123');

  const [authorityEmail, setAuthorityEmail] = useState('authority@civicconnect.in');
  const [authorityPassword, setAuthorityPassword] = useState('authority123');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCitizenSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(citizenEmail.trim(), citizenPassword);
      if (user.role === 'authority') {
        navigate('/authority');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Citizen login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthoritySubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(authorityEmail.trim(), authorityPassword);
      if (user.role !== 'authority') {
        setError('Access denied: Account does not have municipal authority role.');
        return;
      }
      navigate('/authority');
    } catch (err) {
      setError(err.message || 'Authority login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-700 text-white rounded-2xl shadow-lg shadow-green-100 mb-3.5">
            <MapPin size={28} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            CivicConnect
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Empowering residents and municipal authorities in Chennai.
          </p>
        </div>

        {/* Role Selector Tabs: Citizen vs Authority */}
        <div className="mt-6 grid grid-cols-2 gap-2 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
          <button
            type="button"
            id="tab-citizen-login"
            onClick={() => {
              setActiveRole('citizen');
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeRole === 'citizen'
                ? 'bg-white text-green-800 shadow-sm border border-gray-200/60'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <User size={15} className={activeRole === 'citizen' ? 'text-green-700' : 'text-gray-400'} />
            <span>Citizen</span>
          </button>

          <button
            type="button"
            id="tab-authority-login"
            onClick={() => {
              setActiveRole('authority');
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeRole === 'authority'
                ? 'bg-green-800 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Building2 size={15} className={activeRole === 'authority' ? 'text-green-300' : 'text-gray-400'} />
            <span>Authority</span>
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-shake">
              <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {activeRole === 'citizen' ? (
            /* Citizen Login Form */
            <form onSubmit={handleCitizenSubmit} className="space-y-4">
              <div className="border-b border-gray-100 pb-3 mb-1">
                <h2 className="text-base font-bold text-gray-900">Citizen Sign In</h2>
                <p className="text-xs text-gray-500">
                  Access your neighborhood reports, track civic repairs, and engage with community verifications.
                </p>
              </div>

              <div>
                <label htmlFor="citizen-login-email" className="block text-xs font-semibold text-gray-700 mb-1">
                  Citizen Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={16} />
                  </div>
                  <input
                    id="citizen-login-email"
                    type="email"
                    required
                    value={citizenEmail}
                    onChange={(e) => setCitizenEmail(e.target.value)}
                    placeholder="citizen@civicconnect.in"
                    className="input-field pl-10 text-sm py-2.5"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="citizen-login-password" className="block text-xs font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={16} />
                  </div>
                  <input
                    id="citizen-login-password"
                    type="password"
                    required
                    value={citizenPassword}
                    onChange={(e) => setCitizenPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10 text-sm py-2.5"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="citizen-login-submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 active:scale-98 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-green-100 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <User size={16} />
                      <span>Sign In as Citizen</span>
                    </>
                  )}
                </button>
              </div>

              {/* Demo Citizen Credentials Box */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <KeyRound size={13} className="text-emerald-700" />
                      Demo Citizen Credentials
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCitizenEmail('citizen@civicconnect.in');
                        setCitizenPassword('citizen123');
                        setError(null);
                      }}
                      className="text-[11px] font-bold text-green-700 hover:text-green-800 underline cursor-pointer"
                    >
                      Quick Fill
                    </button>
                  </div>
                  <div className="text-xs text-emerald-800 space-y-0.5">
                    <p>Email: <code className="bg-white/80 px-1.5 py-0.5 rounded text-emerald-900 font-mono font-semibold">citizen@civicconnect.in</code></p>
                    <p>Password: <code className="bg-white/80 px-1.5 py-0.5 rounded text-emerald-900 font-mono font-semibold">citizen123</code></p>
                  </div>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center pt-1">
                <p className="text-xs text-gray-500">
                  New resident in Chennai?{' '}
                  <Link
                    to="/register"
                    id="login-to-register-link"
                    className="font-bold text-green-700 hover:text-green-800 hover:underline"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            /* Authority Login Form */
            <form onSubmit={handleAuthoritySubmit} className="space-y-4">
              <div className="border-b border-gray-100 pb-3 mb-1">
                <h2 className="text-base font-bold text-gray-900">Municipal Authority Sign In</h2>
                <p className="text-xs text-gray-500">
                  Greater Chennai Municipal Corporation operations, report triaging, and dispatch dashboard.
                </p>
              </div>

              <div>
                <label htmlFor="authority-tab-email" className="block text-xs font-semibold text-gray-700 mb-1">
                  Authority Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={16} />
                  </div>
                  <input
                    id="authority-tab-email"
                    type="email"
                    required
                    value={authorityEmail}
                    onChange={(e) => setAuthorityEmail(e.target.value)}
                    placeholder="authority@civicconnect.in"
                    className="input-field pl-10 text-sm py-2.5"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="authority-tab-password" className="block text-xs font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={16} />
                  </div>
                  <input
                    id="authority-tab-password"
                    type="password"
                    required
                    value={authorityPassword}
                    onChange={(e) => setAuthorityPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10 text-sm py-2.5"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="authority-tab-submit"
                  disabled={loading}
                  className="w-full bg-green-800 hover:bg-green-900 active:scale-98 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Verifying Authority...</span>
                    </>
                  ) : (
                    <>
                      <Building2 size={16} />
                      <span>Sign In to Authority Dashboard</span>
                    </>
                  )}
                </button>
              </div>

              {/* Demo Authority Credentials Box */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <KeyRound size={13} className="text-emerald-700" />
                      Demo Authority Credentials
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthorityEmail('authority@civicconnect.in');
                        setAuthorityPassword('authority123');
                        setError(null);
                      }}
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

              <div className="text-center pt-2">
                <Link
                  to="/authority-login"
                  className="text-xs text-green-700 hover:underline font-semibold"
                >
                  Or open dedicated Authority Portal screen &rarr;
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
