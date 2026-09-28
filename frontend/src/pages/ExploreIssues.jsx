import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, List, MapIcon, X, Users, ChevronRight, Zap, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { categories, statuses } from '../data/issues';
import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import IssueCard from '../components/IssueCard';

export default function ExploreIssues() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { issues } = useApp();

  const initialCategory = searchParams.get('category') || 'all';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeStatuses, setActiveStatuses] = useState([]);
  const [view, setView] = useState('feed');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const toggleStatus = (s) => {
    setActiveStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesCategory = activeCategory === 'all' || issue.category === activeCategory;
      const matchesStatus = activeStatuses.length === 0 || activeStatuses.includes(issue.status);
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        issue.title.toLowerCase().includes(q) ||
        issue.location.toLowerCase().includes(q) ||
        issue.category.toLowerCase().includes(q);
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [issues, activeCategory, activeStatuses, searchQuery]);

  const categoryCount = (id) => {
    if (id === 'all') return issues.length;
    return issues.filter((i) => i.category === id).length;
  };

  const handleMarkerClick = (issue) => {
    setSelectedIssue(issue);
  };

  const handleViewIssue = (id) => {
    navigate(`/issues/${id}`);
  };

  const statusChipColors = {
    'Reported': 'bg-orange-100 text-orange-700 border-orange-200',
    'Under Review': 'bg-blue-100 text-blue-700 border-blue-200',
    'In Progress': 'bg-amber-100 text-amber-700 border-amber-200',
    'Resolved': 'bg-green-100 text-green-700 border-green-200',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        subtitle="Home Dashboard"
        showLocation={true}
      />

      <div className="px-4 pt-4">
        <h1 className="text-2xl font-bold text-gray-900">Explore Issues</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          See what your community is reporting and track civic resolutions near you.
        </p>

        {/* Alert banner */}
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-start gap-2">
          <Zap size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-800">
            <span className="font-semibold">{filteredIssues.length} civic issues</span> reported in this ward this week
            <br />
            <span>• {filteredIssues.filter(i => i.citizensVerified > 0).length} verified by citizens</span>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mt-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="explore-search"
            type="text"
            placeholder="Search issues, road names, wards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 pr-10 text-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={15} className="text-gray-400" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {!searchQuery && <SlidersHorizontal size={16} />}
          </button>
        </div>
      </div>

      {/* Category chips */}
      <div className="mt-3 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-1" style={{ width: 'max-content' }}>
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = categoryCount(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`chip text-xs ${isActive ? 'chip-active' : 'chip-inactive'}`}
              >
                {cat.label} {count > 0 && <span className="ml-1 opacity-75">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status chips */}
      <div className="mt-2 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 items-center pb-1" style={{ width: 'max-content' }}>
          {statuses.map((s) => {
            const isActive = activeStatuses.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleStatus(s)}
                className={`chip text-xs border ${
                  isActive
                    ? statusChipColors[s]
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            );
          })}
          <button className="chip chip-inactive text-xs flex items-center gap-1">
            Sort: Nearby <ChevronRight size={10} />
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="px-4 mt-3">
        <MapView
          issues={filteredIssues}
          selectedId={selectedIssue?.id}
          onSelect={handleMarkerClick}
          height="220px"
        />

        {/* Selected issue popup */}
        {selectedIssue && (
          <div className="mt-2 card p-3 border-l-4 border-red-500 relative">
            <button
              onClick={() => setSelectedIssue(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
            <div className="flex items-start gap-2 mb-2">
              {selectedIssue.priority === 'High' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                  ● CRITICAL
                </span>
              )}
              <span className="text-xs text-gray-400">Reported {selectedIssue.reportedAgo?.replace('Reported ', '')}</span>
            </div>
            <p className="font-bold text-sm text-gray-900">{selectedIssue.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{selectedIssue.location}</p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Users size={11} />
                <span>{selectedIssue.citizensVerified} verified</span>
                {selectedIssue.assignedTo && (
                  <span className="ml-2 text-green-700 font-medium">• Crew Dispatched</span>
                )}
              </div>
              <button
                onClick={() => handleViewIssue(selectedIssue.id)}
                className="bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-green-700"
              >
                View <ArrowRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nearby Issues list */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-gray-900">Nearby Issues</h2>
            <p className="text-xs text-gray-500">{filteredIssues.length} active citizen reports within 2km</p>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setView('feed')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === 'feed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              <List size={13} /> Feed
            </button>
            <button
              onClick={() => setView('map')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              <MapIcon size={13} /> Map
            </button>
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="card p-8 text-center">
            <Search size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-gray-600">No issues found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                variant={issue.status === 'Resolved' ? 'resolved' : 'compact'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Report CTA */}
      <div className="px-4 mt-5 mb-24">
        <button
          onClick={() => navigate('/report')}
          className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 active:scale-95 transition-all shadow-md shadow-green-200"
        >
          Report an Issue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
