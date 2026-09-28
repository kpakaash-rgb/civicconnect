import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, Clock, CheckCircle2, AlertCircle, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { statuses } from '../data/issues';
import IssueCard from '../components/IssueCard';

const summaryIcons = {
  'Total Reports': TrendingUp,
  'Under Review': Clock,
  'In Progress': AlertCircle,
  'Resolved': CheckCircle2,
};

const summaryColors = {
  'Total Reports': 'text-green-600 bg-green-50',
  'Under Review': 'text-blue-600 bg-blue-50',
  'In Progress': 'text-amber-600 bg-amber-50',
  'Resolved': 'text-green-700 bg-green-50',
};

export default function MyReports() {
  const navigate = useNavigate();
  const { myReports, currentUser, openProfile } = useApp();

  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState('all');

  const totalCount = myReports.length;
  const underReviewCount = myReports.filter((r) => r.status === 'Under Review').length;
  const inProgressCount = myReports.filter((r) => r.status === 'In Progress').length;
  const resolvedCount = myReports.filter((r) => r.status === 'Resolved').length;

  const summary = [
    { label: 'Total Reports', value: totalCount, key: 'all' },
    { label: 'Under Review', value: underReviewCount, key: 'Under Review' },
    { label: 'In Progress', value: inProgressCount, key: 'In Progress' },
    { label: 'Resolved', value: resolvedCount, key: 'Resolved' },
  ];

  const filteredReports = useMemo(() => {
    return myReports.filter((r) => {
      const matchesStatus = activeStatus === 'all' || r.status === activeStatus;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [myReports, activeStatus, search]);

  // Map myReport fields to IssueCard expected shape
  const mapToCardShape = (r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    status: r.status,
    priority: r.priority,
    location: r.location,
    reportedAgo: r.dateReported,
    dateReported: r.dateReported,
    citizensVerified: r.citizensVerified,
    imageColor: '#16a34a',
    imageLabel: r.category?.slice(0, 4).toUpperCase() || 'ISS',
    image: null,
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-green-700 text-white px-4 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="font-bold text-lg">My Reports</h1>
            <p className="text-green-200 text-xs">
              {currentUser.location}
            </p>
          </div>
          {/* Touchable Profile - Aishwarya (No Photo) */}
          <button
            onClick={openProfile}
            id="myreports-profile-btn"
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 active:scale-95 transition-all py-1.5 px-3 rounded-full text-left cursor-pointer border border-white/20 shadow-xs"
            aria-label={`View ${currentUser.name}'s profile`}
            title={`View profile (${currentUser.name})`}
          >
            <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center">
              <User size={13} className="text-white" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-xs font-bold text-white">{currentUser.name}</div>
              <div className="text-[10px] text-green-200 font-medium">View Profile</div>
            </div>
          </button>
        </div>
      </header>

      {/* Summary cards */}
      <div className="px-4 pt-4 grid grid-cols-2 gap-2.5">
        {summary.map((item) => {
          const Icon = summaryIcons[item.label];
          const colorClass = summaryColors[item.label];
          const isActive = activeStatus === item.key;

          return (
            <button
              key={item.label}
              onClick={() => setActiveStatus(isActive ? 'all' : item.key)}
              className={`card p-3.5 text-left transition-all active:scale-95 ${
                isActive ? 'ring-2 ring-green-500 shadow-md' : 'hover:shadow-sm'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${colorClass}`}>
                <Icon size={16} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
            </button>
          );
        })}
      </div>

      <div className="px-4 mt-4">
        {/* Search */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="my-reports-search"
            type="text"
            placeholder="Search your reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 pr-9 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={15} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* Status filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-4">
          {[{ key: 'all', label: `All (${totalCount})` }, ...statuses.map((s) => ({ key: s, label: s }))].map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveStatus(item.key)}
              className={`chip text-xs whitespace-nowrap ${
                activeStatus === item.key ? 'chip-active' : 'chip-inactive'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Reports */}
        {filteredReports.length === 0 ? (
          <div className="card p-10 text-center">
            <Search size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">No reports found</p>
            {myReports.length === 0 ? (
              <>
                <p className="text-sm text-gray-400 mt-1 mb-4">You haven't submitted any reports yet</p>
                <button
                  onClick={() => navigate('/report')}
                  className="btn-primary text-sm"
                >
                  Report an Issue
                </button>
              </>
            ) : (
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <IssueCard
                key={report.id}
                issue={mapToCardShape(report)}
                variant="default"
              />
            ))}
          </div>
        )}
      </div>

      <div className="h-24" />
    </div>
  );
}
