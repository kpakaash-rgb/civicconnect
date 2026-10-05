import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin, ChevronRight, ArrowRight, Users, CheckCircle,
  Zap, Shield, TrendingUp, AlertTriangle, Lightbulb, Droplets, Construction,
  Camera, ClipboardList, Wrench, BadgeCheck, Menu, Bell, User
} from 'lucide-react';
import { issues, communityStats, categories } from '../data/issues';
import IssueCard from '../components/IssueCard';
import MapView from '../components/MapView';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';

const categoryIcons = {
  Potholes: AlertTriangle,
  Sanitation: Construction,
  Streetlights: Lightbulb,
  Drainage: Droplets,
  Water: Droplets,
  'Road Damage': Construction,
  Other: MapPin,
};

const categoryColors = {
  Potholes: 'bg-amber-50 text-amber-700',
  Sanitation: 'bg-emerald-50 text-emerald-700',
  Streetlights: 'bg-indigo-50 text-indigo-700',
  Drainage: 'bg-blue-50 text-blue-700',
  Water: 'bg-sky-50 text-sky-700',
  'Road Damage': 'bg-red-50 text-red-700',
  Other: 'bg-gray-50 text-gray-700',
};

const howItWorks = [
  {
    num: '01',
    title: 'Report',
    desc: 'Capture the problem with photos and pin the precise GPS location in seconds.',
    icon: Camera,
    color: 'bg-green-100 text-green-700',
  },
  {
    num: '02',
    title: 'Verify',
    desc: 'Community upvotes validate issue priority and weed out duplicates instantly.',
    icon: Shield,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    num: '03',
    title: 'Resolve',
    desc: 'The assigned municipal ward engineers dispatch field teams with live job tracking.',
    icon: Wrench,
    color: 'bg-amber-100 text-amber-700',
  },
  {
    num: '04',
    title: 'Verify',
    desc: 'Citizens vote to verify the resolved fix before the civic issue is officially closed.',
    icon: BadgeCheck,
    color: 'bg-purple-100 text-purple-700',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { issues: appIssues, currentUser, openProfile } = useApp();
  const activeIssues = appIssues && appIssues.length > 0 ? appIssues : issues;
  const recentIssues = activeIssues.slice(0, 3);
  const inProgressCount = activeIssues.filter(i => i.status === 'In Progress').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-700 text-white">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
              <MapPin size={14} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-base leading-tight">CivicConnect</div>
              <div className="text-green-200 text-xs">Home Neighbourhood Resolution Platform</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/activity')}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors relative"
              aria-label="Activity Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-400 rounded-full" />
            </button>
            <button
              onClick={openProfile}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Menu"
            >
              <Menu size={18} />
            </button>

            {currentUser && (
              <button
                onClick={openProfile}
                id="home-profile-btn"
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

        {/* Hero section */}
        <div className="px-4 pt-4 pb-8">
          {currentUser && (
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-green-100">
                Welcome, <strong className="text-white font-bold">{currentUser.name}</strong>
              </span>
              {currentUser.area && (
                <span className="inline-flex items-center gap-1 text-[11px] text-green-100 bg-white/15 px-2.5 py-0.5 rounded-full border border-white/15 font-medium">
                  <MapPin size={10} className="text-green-300" />
                  {currentUser.area}
                </span>
              )}
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 bg-white/15 text-green-100 text-xs font-medium px-3 py-1.5 rounded-full mb-3">
            <Zap size={11} />
            {inProgressCount} active reports being resolved in your ward today
          </div>

          <h1 className="text-3xl font-extrabold text-white leading-tight mb-3">
            See it.<br />
            Report it. <span className="text-green-300">Fix it.</span>
          </h1>
          <p className="text-green-100 text-sm leading-relaxed mb-5">
            Turn everyday civic problems into visible, trackable action items. Report local issues, follow their progress, and help build better communities together.
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => navigate('/report')}
              id="home-report-btn"
              className="w-full bg-white text-green-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-green-50 active:scale-95 transition-all duration-200 shadow-lg"
            >
              Report an Issue
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/explore')}
              id="home-explore-btn"
              className="w-full bg-white/15 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/25 active:scale-95 transition-all duration-200 border border-white/20"
            >
              <MapPin size={15} />
              Explore Local Issues
            </button>
          </div>
        </div>
      </header>

      {/* Map preview */}
      <div className="px-4 -mt-4">
        <div className="card overflow-hidden shadow-md">
          <MapView issues={issues} height="200px" />
        </div>
      </div>

      {/* Community Stats */}
      <section className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Community activity this month</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <TrendingUp size={12} className="text-green-600" />
            <span className="text-green-600 font-medium">Live Ward Radar</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="card p-3 text-center">
            <p className="text-xl font-bold text-gray-900">{communityStats.issuesReported.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">Issues Reported</p>
            <span className="inline-block mt-1 text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
              {communityStats.issuesReportedChange}
            </span>
          </div>
          <div className="card p-3 text-center">
            <p className="text-xl font-bold text-gray-900">{communityStats.issuesResolved.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">Issues Resolved</p>
            <span className="inline-block mt-1 text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
              Done
            </span>
          </div>
          <div className="card p-3 text-center">
            <p className="text-xl font-bold text-gray-900">{communityStats.resolutionRate}%</p>
            <p className="text-xs text-gray-500 mt-0.5">Resolution Rate</p>
            <span className="inline-block mt-1 text-xs font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full">
              ✓ Verified
            </span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Categories</p>
            <h2 className="text-base font-bold text-gray-900">What needs attention?</h2>
            <p className="text-xs text-gray-500 mt-0.5">Explore active civic reports sorted by municipal domain.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {categories.slice(1, 5).map((cat) => {
            const Icon = categoryIcons[cat.id] || MapPin;
            const colorClass = categoryColors[cat.id] || 'bg-gray-50 text-gray-700';
            const count = issues.filter(i => i.category === cat.id).length;

            return (
              <Link
                key={cat.id}
                to={`/explore?category=${cat.id}`}
                className={`card p-3 flex items-center gap-2.5 hover:shadow-md transition-all duration-200 active:scale-95`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorClass}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{cat.label}</p>
                  <p className="text-xs text-gray-500">{count} active</p>
                </div>
                <ChevronRight size={14} className="text-gray-400 ml-auto" />
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-4 gap-2 mt-2">
          {categories.slice(5).map((cat) => {
            const count = issues.filter(i => i.category === cat.id).length;
            return (
              <Link
                key={cat.id}
                to={`/explore?category=${cat.id}`}
                className="card p-2.5 text-center hover:shadow-md transition-all active:scale-95"
              >
                <p className="text-xs font-semibold text-gray-700">{cat.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{count}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent community reports */}
      <section className="mt-5">
        <div className="px-4 flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Community Stream</p>
            <h2 className="text-base font-bold text-gray-900">Community civic reports</h2>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="px-4 flex gap-2 mb-3">
          {['All', 'In Progress', 'Resolved'].map((tab) => (
            <button
              key={tab}
              className={`chip text-xs ${tab === 'All' ? 'chip-active' : 'chip-inactive'}`}
            >
              {tab === 'All' ? `All (${issues.length})` : tab}
            </button>
          ))}
        </div>

        <div className="px-4 space-y-3">
          {recentIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              variant={issue.status === 'Resolved' ? 'resolved' : 'compact'}
            />
          ))}
        </div>

        <div className="px-4 mt-3">
          <Link to="/explore" className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-green-600 hover:text-green-700">
            View all community reports <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 mt-5 bg-white py-5 border-y border-gray-100">
        <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1">Process</p>
        <h2 className="text-base font-bold text-gray-900 mb-0.5">From report to resolution</h2>
        <p className="text-xs text-gray-500 mb-4">Transparent, citizen-led governance powered by civic collaboration.</p>

        <div className="space-y-4">
          {howItWorks.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${step.color}`}>
                    <Icon size={18} />
                  </div>
                  {i < howItWorks.length - 1 && (
                    <div className="w-0.5 h-6 bg-gray-200 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs text-gray-400 font-medium">{step.num}</span>
                    <h3 className="font-bold text-sm text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-6 bg-green-700 mt-0">
        <h2 className="text-xl font-bold text-white mb-1">
          Your neighborhood starts<br />with you.
        </h2>
        <p className="text-green-200 text-sm mb-4">
          See something that needs fixing? Report it in 30 seconds and hold public infrastructure transparent.
        </p>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => navigate('/report')}
            className="w-full bg-white text-green-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-green-50 active:scale-95 transition-all"
          >
            Report an Issue <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate('/explore')}
            className="w-full bg-white/15 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-white/25 active:scale-95 transition-all border border-white/20"
          >
            ⊙ Track Existing Report
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-800 text-green-300 text-xs text-center py-4 px-4">
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <MapPin size={12} />
          <span className="font-semibold text-white">CivicConnect</span>
        </div>
        <p>See it. Report it. Fix it.</p>
        <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
          <Link to="/explore" className="hover:text-white">Explore Issues</Link>
          <Link to="/report" className="hover:text-white">Report an Issue</Link>
          <span className="hover:text-white cursor-pointer">Community</span>
          <span className="hover:text-white cursor-pointer">About</span>
        </div>
        <p className="mt-3 text-green-500 text-[10px]">
          © 2026 CivicConnect Municipal Systems. Civic Tech Transparency 2.0. All public submissions subject to open civic data governance.
        </p>
      </footer>

      {/* Bottom padding for nav */}
      <div className="h-20" />
    </div>
  );
}
