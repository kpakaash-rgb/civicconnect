import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, MapPin, Mail, Phone, Calendar, Award, Eye, Zap, Sparkles,
  CheckCircle2, ChevronRight, FileText, PlusCircle, ShieldCheck, User
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const badgeIcons = {
  Award,
  Eye,
  Zap,
  Sparkles,
};

export default function ProfileModal() {
  const { isProfileOpen, closeProfile, currentUser, myReports } = useApp();
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeProfile();
    };
    if (isProfileOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isProfileOpen, closeProfile]);

  if (!isProfileOpen) return null;

  const handleNavigate = (path) => {
    closeProfile();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-all duration-300 animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={closeProfile} />

      {/* Modal / Sheet container */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col animate-slideUp">
        {/* Header / Banner */}
        <div className="relative bg-gradient-to-br from-green-700 via-emerald-600 to-green-800 text-white p-5 pt-6 pb-14">
          {/* Close button */}
          <button
            onClick={closeProfile}
            id="profile-close-btn"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
            aria-label="Close Profile"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-semibold text-green-100 border border-white/20">
              <ShieldCheck size={12} className="text-green-300" />
              Verified Citizen
            </span>
            <span className="text-xs text-green-200">
              {currentUser.reputationRank}
            </span>
          </div>

          <h2 className="text-xl font-bold text-white">Citizen Profile</h2>
          <p className="text-green-100 text-xs mt-0.5">CivicConnect Community Identity</p>
        </div>

        {/* Profile Card Body */}
        <div className="relative px-5 pt-0 pb-6 flex-1 overflow-y-auto">
          {/* Avatar & Main Info (overlapping header) */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full ring-4 ring-white shadow-lg flex items-center justify-center bg-gradient-to-br from-emerald-600 via-green-700 to-emerald-900 text-white">
                <User size={38} className="text-white drop-shadow-xs" />
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" title="Active Citizen" />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleNavigate('/my-reports')}
                id="profile-my-reports-btn"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 active:scale-95 text-xs font-semibold rounded-xl border border-green-200 transition-all"
              >
                <FileText size={14} />
                My Reports ({myReports.length})
              </button>
            </div>
          </div>

          {/* User Name & Details */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-gray-900">{currentUser.name}</h3>
              <CheckCircle2 size={18} className="text-green-600 fill-green-100" />
            </div>
            <p className="text-xs font-medium text-green-700 mt-0.5">{currentUser.role}</p>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed bg-gray-50 p-2.5 rounded-xl border border-gray-100">
              "{currentUser.bio}"
            </p>
          </div>

          {/* Quick Civic Stats */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-2.5 text-center">
              <span className="block text-lg font-extrabold text-emerald-800">{myReports.length}</span>
              <span className="text-[10px] font-medium text-emerald-600 leading-tight block">Reports</span>
            </div>
            <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-2.5 text-center">
              <span className="block text-lg font-extrabold text-blue-800">{currentUser.resolvedReports}</span>
              <span className="text-[10px] font-medium text-blue-600 leading-tight block">Resolved</span>
            </div>
            <div className="bg-purple-50/80 border border-purple-100 rounded-2xl p-2.5 text-center">
              <span className="block text-lg font-extrabold text-purple-800">{currentUser.verifications}</span>
              <span className="text-[10px] font-medium text-purple-600 leading-tight block">Verified</span>
            </div>
            <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-2.5 text-center">
              <span className="block text-lg font-extrabold text-amber-800">{currentUser.reputationScore}</span>
              <span className="text-[10px] font-medium text-amber-600 leading-tight block">Score</span>
            </div>
          </div>

          {/* Citizen Badges */}
          <div className="mb-5">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Civic Badges & Milestones</span>
              <span className="text-[10px] text-green-700 font-semibold">{currentUser.badges?.length || 4} Unlocked</span>
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {currentUser.badges?.map((badge) => {
                const IconComponent = badgeIcons[badge.icon] || Award;
                return (
                  <div
                    key={badge.id}
                    className={`flex items-start gap-2 p-2.5 rounded-xl border ${badge.color} bg-opacity-70`}
                  >
                    <div className="p-1.5 rounded-lg bg-white/80 shadow-xs mt-0.5">
                      <IconComponent size={14} />
                    </div>
                    <div>
                      <div className="font-bold text-xs">{badge.name}</div>
                      <div className="text-[10px] opacity-90 leading-tight line-clamp-2 mt-0.5">
                        {badge.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact & Civic Residence Info */}
          <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3.5 space-y-2.5 mb-5">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
              Ward & Contact Details
            </h4>
            <div className="flex items-center gap-2.5 text-xs text-gray-700">
              <MapPin size={14} className="text-green-600 shrink-0" />
              <span className="font-medium">{currentUser.location}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-700">
              <Mail size={14} className="text-green-600 shrink-0" />
              <span>{currentUser.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-700">
              <Phone size={14} className="text-green-600 shrink-0" />
              <span>{currentUser.phone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-700">
              <Calendar size={14} className="text-green-600 shrink-0" />
              <span>Citizen Member since {currentUser.joinedDate}</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={() => handleNavigate('/report')}
              id="profile-action-report"
              className="w-full bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 active:scale-98 transition-all shadow-md shadow-green-100"
            >
              <PlusCircle size={16} />
              Report a Local Issue
            </button>
            <button
              onClick={() => handleNavigate('/my-reports')}
              id="profile-action-view-reports"
              className="w-full bg-white text-gray-800 border border-gray-200 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-98 transition-all"
            >
              <FileText size={16} className="text-green-600" />
              View All My Reports
              <ChevronRight size={14} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
