import { MapPin, Menu, Bell, User, Building2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar({ title, subtitle, showLocation = false }) {
  const location = useLocation();
  const { currentUser, openProfile } = useApp();

  return (
    <header className="bg-green-700 text-white sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
            <MapPin size={14} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-base leading-tight">CivicConnect</div>
            {subtitle && (
              <div className="text-green-200 text-xs leading-tight">{subtitle}</div>
            )}
          </div>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Link
            to="/authority-login"
            id="navbar-authority-btn"
            className="flex items-center gap-1 bg-green-900/50 hover:bg-green-900 border border-white/20 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all"
            title="Authority Portal Login"
          >
            <Building2 size={13} className="text-green-300" />
            <span className="hidden sm:inline">Authority Portal</span>
          </Link>
          {showLocation && (
            <button className="flex items-center gap-1 bg-white/10 text-white text-xs font-medium px-2 py-1 rounded-full hover:bg-white/20 transition-colors">
              <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
              Live
            </button>
          )}
          <Link
            to="/activity"
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors relative"
            aria-label="Activity Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-400 rounded-full" />
          </Link>
          <button
            onClick={openProfile}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Menu"
            title="Menu"
          >
            <Menu size={18} />
          </button>

          {/* Touchable Profile */}
          {currentUser && (
            <button
              onClick={openProfile}
              id="navbar-profile-btn"
              className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white border border-white/20 cursor-pointer shadow-xs"
              aria-label={`View ${currentUser.name}'s profile`}
              title={`View profile (${currentUser.name})`}
            >
              <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center">
                <User size={13} className="text-white" />
              </div>
              <span className="text-xs font-semibold">{currentUser.name}</span>
            </button>
          )}
        </div>
      </div>

      {/* Location bar */}
      {showLocation && (
        <div className="px-4 pb-3">
          <button className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-colors rounded-full px-3 py-1.5 text-sm">
            <MapPin size={13} className="text-green-300" />
            <span className="font-medium">{currentUser.location}</span>
            <svg className="w-3.5 h-3.5 text-green-300 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </header>
  );
}
