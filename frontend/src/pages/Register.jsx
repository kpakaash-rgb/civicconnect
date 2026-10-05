import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin, User, Mail, Lock, CheckCircle2,
  AlertCircle, ArrowRight, Loader2, Calendar, MapPinCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Register() {
  const navigate = useNavigate();
  const { registerUser } = useApp();

  const [form, setForm] = useState({
    name: '',
    age: '',
    area: 'Anna Nagar',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validate = () => {
    if (!form.name.trim() || form.name.trim().length < 2) {
      setError('Please provide your full name (at least 2 characters).');
      return false;
    }
    const ageNum = parseInt(form.age, 10);
    if (!form.age || isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      setError('Please provide a valid age between 13 and 120.');
      return false;
    }
    if (!form.area.trim()) {
      setError('Please specify your residential area or locality.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email.trim())) {
      setError('Please provide a valid email address.');
      return false;
    }
    if (!form.password || form.password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setError(null);
    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        age: parseInt(form.age, 10),
        area: form.area.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: 'citizen',
        ward: 'Ward 104',
      };

      await registerUser(payload);
      // Automatically logged in -> navigate to Citizen Home
      navigate('/');
    } catch (err) {
      if (err.message && err.message.includes('409')) {
        setError('An account with this email address already exists. Please Sign In.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-gray-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-700 text-white rounded-2xl shadow-lg shadow-green-100 mb-3.5">
            <MapPin size={28} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Create your CivicConnect account
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Join fellow residents in reporting, tracking, and resolving local civic issues.
          </p>
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

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label htmlFor="register-name" className="block text-xs font-semibold text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User size={16} />
                </div>
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Akaash Kumar"
                  className="input-field pl-10 text-sm py-2.5"
                />
              </div>
            </div>

            {/* Age & Area Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="register-age" className="block text-xs font-semibold text-gray-700 mb-1">
                  Age <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Calendar size={16} />
                  </div>
                  <input
                    id="register-age"
                    name="age"
                    type="number"
                    min="13"
                    max="120"
                    required
                    value={form.age}
                    onChange={handleChange}
                    placeholder="e.g. 21"
                    className="input-field pl-10 text-sm py-2.5"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-area" className="block text-xs font-semibold text-gray-700 mb-1">
                  Area / Locality <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <MapPinCheck size={16} />
                  </div>
                  <input
                    id="register-area"
                    name="area"
                    type="text"
                    required
                    value={form.area}
                    onChange={handleChange}
                    placeholder="e.g. Anna Nagar"
                    className="input-field pl-10 text-sm py-2.5"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="register-email" className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail size={16} />
                </div>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="e.g. citizen@example.com"
                  className="input-field pl-10 text-sm py-2.5"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="register-password" className="block text-xs font-semibold text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock size={16} />
                </div>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pl-10 text-sm py-2.5"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="register-confirm-password" className="block text-xs font-semibold text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock size={16} />
                </div>
                <input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pl-10 text-sm py-2.5"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="register-submit-btn"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 active:scale-98 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-green-100 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Already have an account? Sign In */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Already have an account?{' '}
              <Link
                to="/login"
                id="register-to-login-link"
                className="font-bold text-green-700 hover:text-green-800 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
