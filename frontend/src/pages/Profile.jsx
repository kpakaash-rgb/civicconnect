import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Mail, Phone, Calendar, Award, Eye, Zap, Sparkles,
  CheckCircle2, FileText, PlusCircle, ShieldCheck, ChevronRight, User, LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const badgeIcons = {
  Award,
  Eye,
  Zap,
  Sparkles,
};

export default function Profile() {
  const { currentUser, myReports, logout } = useApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Header */}
      <header className="bg-green-700 text-white sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3.5">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-white/90 hover:text-white text-sm font-medium"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          <h1 className="font-bold text-base">Citizen Profile</h1>
          <div className="w-6" />
        </div>
      </header>

      {/* Banner */}
      <div className="bg-gradient-to-r from-green-700 via-emerald-600 to-green-800 text-white px-5 pt-4 pb-12">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-semibold text-green-100">
            <ShieldCheck size={12} className="text-green-300" />
            Verified Citizen
          </span>
          <span className="text-xs text-green-200">
            {currentUser.reputationRank}
          </span>
        </div>
        <p className="text-xs text-green-100">CivicConnect Community Identity</p>
      </div>

      {/* Profile Card */}
      <div className="px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          {/* Avatar and Action */}
          <div className="flex items-end justify-between -mt-12 mb-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-full ring-4 ring-white shadow-md flex items-center justify-center bg-gradient-to-br from-emerald-600 via-green-700 to-emerald-900 text-white">
                <User size={38} className="text-white drop-shadow-xs" />
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
            </div>

            <button
              onClick={() => navigate('/my-reports')}
              className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 text-xs font-semibold rounded-xl border border-green-200 transition-all flex items-center gap-1.5"
            >
              <FileText size={14} />
              My Reports ({myReports.length})
            </button>
          </div>

          {/* Name & Title */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-gray-900">{currentUser.name}</h2>
              <CheckCircle2 size={18} className="text-green-600 fill-green-100" />
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                {currentUser.roleTitle || 'Verified Citizen'}
              </span>
              {currentUser.age && (
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                  {currentUser.age} years
                </span>
              )}
              {currentUser.area && (
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                  {currentUser.area}
                </span>
              )}
            </div>

            {currentUser.bio && (
              <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100 leading-relaxed">
                "{currentUser.bio}"
              </p>
            )}
          </div>

          {/* Impact Stats */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-2.5 text-center">
              <span className="block text-lg font-extrabold text-emerald-800">{myReports.length}</span>
              <span className="text-[10px] font-medium text-emerald-600 leading-tight block">Reports</span>
            </div>
            <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-2.5 text-center">
              <span className="block text-lg font-extrabold text-blue-800">{currentUser.resolvedReports || 8}</span>
              <span className="text-[10px] font-medium text-blue-600 leading-tight block">Resolved</span>
            </div>
            <div className="bg-purple-50/80 border border-purple-100 rounded-2xl p-2.5 text-center">
              <span className="block text-lg font-extrabold text-purple-800">{currentUser.verifications || 34}</span>
              <span className="text-[10px] font-medium text-purple-600 leading-tight block">Verified</span>
            </div>
            <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-2.5 text-center">
              <span className="block text-lg font-extrabold text-amber-800">{currentUser.reputationScore || 92}</span>
              <span className="text-[10px] font-medium text-amber-600 leading-tight block">Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Civic Badges & Milestones</span>
            <span className="text-[10px] text-green-700 font-semibold">{currentUser.badges?.length || 4} Unlocked</span>
          </h3>
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
      </div>

      {/* Ward Details */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2.5">
          <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            Citizen Information & Area
          </h3>
          <div className="flex items-center gap-2.5 text-xs text-gray-700">
            <User size={14} className="text-green-600 shrink-0" />
            <span className="font-medium text-gray-900">{currentUser.name}</span>
            {currentUser.age && <span className="text-gray-500">({currentUser.age} years)</span>}
          </div>
          <div className="flex items-center gap-2.5 text-xs text-gray-700">
            <MapPin size={14} className="text-green-600 shrink-0" />
            <span className="font-medium">{currentUser.area || currentUser.location || 'Anna Nagar'}</span>
            {currentUser.ward && <span className="text-xs text-green-700 font-semibold">• {currentUser.ward}</span>}
          </div>
          <div className="flex items-center gap-2.5 text-xs text-gray-700">
            <Mail size={14} className="text-green-600 shrink-0" />
            <span>{currentUser.email}</span>
          </div>
          {currentUser.phone && (
            <div className="flex items-center gap-2.5 text-xs text-gray-700">
              <Phone size={14} className="text-green-600 shrink-0" />
              <span>{currentUser.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2.5 text-xs text-gray-700">
            <Calendar size={14} className="text-green-600 shrink-0" />
            <span>Citizen Member • Chennai</span>
          </div>
        </div>
      </div>

      {/* Quick Action buttons */}
      <div className="px-4 mt-5 space-y-2">
        <button
          onClick={() => navigate('/report')}
          className="w-full bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 active:scale-98 transition-all shadow-md shadow-green-100"
        >
          <PlusCircle size={16} />
          Report a Local Issue
        </button>
        <button
          onClick={() => navigate('/authority-login')}
          id="profile-authority-portal-btn"
          className="w-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-100 active:scale-98 transition-all"
        >
          <ShieldCheck size={16} className="text-emerald-700" />
          Municipal Authority Portal
          <ChevronRight size={14} className="text-emerald-500" />
        </button>

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          id="profile-page-logout-btn"
          className="w-full bg-red-50 text-red-700 border border-red-200 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 active:scale-98 transition-all cursor-pointer"
        >
          <LogOut size={16} className="text-red-600" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
