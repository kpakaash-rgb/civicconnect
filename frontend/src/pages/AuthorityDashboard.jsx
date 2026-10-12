import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2, Search, Filter, AlertTriangle, CheckCircle2,
  Clock, CheckCircle, ExternalLink, X, ChevronRight,
  MapPin, Calendar, ShieldCheck, RefreshCw, FileText,
  AlertOctagon, Check, ArrowLeft, ArrowUpRight, Sparkles, Loader2, LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getIssues as fetchIssuesApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import IssueTimeline from '../components/IssueTimeline';
import Toast from '../components/Toast';

export default function AuthorityDashboard() {
  const navigate = useNavigate();
  const { issues, updateIssueStatus, refreshIssues, logout, currentUser } = useApp();

  // Primary live state for authority reports directly from GET /api/issues
  const [reports, setReports] = useState(issues || []);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Selected report for side drawer / detail modal
  const [selectedReportId, setSelectedReportId] = useState(null);

  // Status update state for selected report
  const [newStatus, setNewStatus] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch latest issues directly from backend API
  const fetchLatestIssues = useCallback(async (showToast = false) => {
    setIsFetching(true);
    setFetchError(null);
    try {
      const data = await fetchIssuesApi();
      if (Array.isArray(data)) {
        setReports(data);
        if (showToast) {
          setToast({ message: `Fetched ${data.length} latest reports from server`, type: 'info' });
        }
      }
      if (refreshIssues) {
        refreshIssues();
      }
    } catch (err) {
      console.warn('[AuthorityDashboard] Error fetching fresh issues from backend:', err);
      setFetchError('Unable to connect to backend server. Showing cached data.');
      if (showToast) {
        setToast({ message: 'Unable to connect to server. Showing cached data.', type: 'error' });
      }
      if (issues && issues.length > 0) {
        setReports(issues);
      }
    } finally {
      setIsFetching(false);
    }
  }, [refreshIssues, issues]);

  // Refresh automatically on mount and window focus
  useEffect(() => {
    fetchLatestIssues();

    const handleFocus = () => {
      fetchLatestIssues();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchLatestIssues]);

  // Keep in sync with AppContext issues if a new report was submitted via citizen view
  useEffect(() => {
    if (issues && issues.length > 0) {
      setReports((prev) => {
        const idSet = new Set(issues.map((i) => i.id));
        const remaining = prev.filter((p) => !idSet.has(p.id));
        return [...issues, ...remaining];
      });
    }
  }, [issues]);

  // Retrieve active selected report
  const selectedReport = useMemo(() => {
    return reports.find((i) => i.id === selectedReportId) || null;
  }, [reports, selectedReportId]);

  // Handle opening details for an issue
  const handleSelectReport = (report) => {
    setSelectedReportId(report.id);
    setNewStatus(report.status);
    setStatusRemarks('');
  };

  const handleCloseDetails = () => {
    setSelectedReportId(null);
  };

  // Status update execution
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport || !newStatus) return;

    setIsUpdating(true);
    try {
      const updated = await updateIssueStatus(selectedReport.id, newStatus, statusRemarks.trim());
      if (updated) {
        setReports((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
      }
      // Re-pull to verify backend sync
      await fetchLatestIssues();
      setToast({
        message: `Report ${selectedReport.id} successfully updated to "${newStatus}"`,
        type: 'success',
      });
    } catch (err) {
      setToast({
        message: `Status update failed: ${err.message}`,
        type: 'error',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Compute Summary Statistics
  const totalCount = reports.length;
  const pendingCount = reports.filter(
    (i) => i.status === 'Reported' || i.status === 'Under Review'
  ).length;
  const inProgressCount = reports.filter(
    (i) => i.status === 'In Progress' || i.status === 'Assigned'
  ).length;
  const resolvedCount = reports.filter((i) => i.status === 'Resolved').length;
  const highPriorityCount = reports.filter((i) => i.priority === 'High').length;

  // Filtered reports list
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // Status filter
      if (statusFilter === 'PENDING') {
        if (report.status !== 'Reported' && report.status !== 'Under Review') return false;
      } else if (statusFilter !== 'ALL' && report.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'ALL' && report.priority !== priorityFilter) {
        return false;
      }

      // Search query (matches ID, title, category, location, ward, description)
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesId = report.id.toLowerCase().includes(q);
        const matchesTitle = (report.title || '').toLowerCase().includes(q);
        const matchesCategory = (report.category || '').toLowerCase().includes(q);
        const matchesLoc = (report.location || '').toLowerCase().includes(q);
        const matchesWard = (report.ward || '').toLowerCase().includes(q);
        const matchesDesc = (report.description || '').toLowerCase().includes(q);

        if (!matchesId && !matchesTitle && !matchesCategory && !matchesLoc && !matchesWard && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [reports, search, statusFilter, priorityFilter]);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
  };

  const hasActiveFilters = search !== '' || statusFilter !== 'ALL' || priorityFilter !== 'ALL';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Authority Header */}
      <header className="bg-green-800 text-white border-b border-green-900 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center border border-white/20 shadow-xs">
              <Building2 size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">CivicConnect</span>
                <span className="bg-green-700/80 text-green-100 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-green-600/50 uppercase tracking-wider">
                  Authority Portal
                </span>
              </div>
              <p className="text-green-200 text-xs">
                Greater Chennai Municipal Corporation • Zone 4 Operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-green-200 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Database Sync Active</span>
            </div>

            {currentUser && (
              <span className="hidden lg:inline text-xs text-green-100 font-medium bg-green-900/40 px-2.5 py-1 rounded-lg border border-green-700/50">
                {currentUser.name}
              </span>
            )}

            <Link
              to="/"
              id="switch-to-citizen-view"
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-xs px-3 py-1.5 rounded-lg border border-white/20 transition-all shadow-xs"
              title="Open Citizen View"
            >
              <ArrowLeft size={14} />
              <span>Back to Citizen View</span>
            </Link>

            <button
              onClick={() => {
                logout();
                navigate('/authority-login');
              }}
              id="authority-logout-button"
              className="inline-flex items-center gap-1.5 bg-red-600/80 hover:bg-red-600 active:scale-95 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer"
              title="Logout from Authority Portal"
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Welcome & Section Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Civic Operations & Issue Dispatch
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Review incoming citizen reports, dispatch field units, and update real-time progress.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              id="authority-refresh-feed-button"
              onClick={() => fetchLatestIssues(true)}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-green-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="Reload all reports from the backend"
            >
              <RefreshCw size={13} className={isFetching ? 'animate-spin text-green-700' : ''} />
              <span>{isFetching ? 'Refreshing...' : 'Refresh Feed'}</span>
            </button>
          </div>
        </div>

        {/* 1. Summary Cards */}
        <section aria-label="Summary Cards">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* Total Reports */}
            <button
              onClick={() => { setStatusFilter('ALL'); setPriorityFilter('ALL'); }}
              className={`card p-4 text-left transition-all hover:shadow-md cursor-pointer border ${
                statusFilter === 'ALL' && priorityFilter === 'ALL'
                  ? 'ring-2 ring-green-600 bg-green-50/30'
                  : 'hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Reports</span>
                <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                  <FileText size={17} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
              <p className="text-[11px] text-gray-400 mt-1">All municipal submissions</p>
            </button>

            {/* Pending */}
            <button
              onClick={() => { setStatusFilter('PENDING'); setPriorityFilter('ALL'); }}
              className={`card p-4 text-left transition-all hover:shadow-md cursor-pointer border ${
                statusFilter === 'PENDING'
                  ? 'ring-2 ring-blue-600 bg-blue-50/30'
                  : 'hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Pending</span>
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Clock size={17} />
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-900">{pendingCount}</div>
              <p className="text-[11px] text-blue-600/80 mt-1">Reported & Under Review</p>
            </button>

            {/* In Progress */}
            <button
              onClick={() => { setStatusFilter('In Progress'); setPriorityFilter('ALL'); }}
              className={`card p-4 text-left transition-all hover:shadow-md cursor-pointer border ${
                statusFilter === 'In Progress'
                  ? 'ring-2 ring-amber-600 bg-amber-50/30'
                  : 'hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">In Progress</span>
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <AlertTriangle size={17} />
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-900">{inProgressCount}</div>
              <p className="text-[11px] text-amber-600/80 mt-1">Assigned & Active Crews</p>
            </button>

            {/* Resolved */}
            <button
              onClick={() => { setStatusFilter('Resolved'); setPriorityFilter('ALL'); }}
              className={`card p-4 text-left transition-all hover:shadow-md cursor-pointer border ${
                statusFilter === 'Resolved'
                  ? 'ring-2 ring-green-600 bg-green-50/30'
                  : 'hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Resolved</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 size={17} />
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-900">{resolvedCount}</div>
              <p className="text-[11px] text-emerald-600/80 mt-1">Completed repairs</p>
            </button>

            {/* High Priority */}
            <button
              onClick={() => { setPriorityFilter('High'); setStatusFilter('ALL'); }}
              className={`card p-4 text-left transition-all hover:shadow-md cursor-pointer border col-span-2 sm:col-span-1 ${
                priorityFilter === 'High'
                  ? 'ring-2 ring-red-600 bg-red-50/30'
                  : 'hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">High Priority</span>
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
                  <AlertOctagon size={17} />
                </div>
              </div>
              <div className="text-2xl font-bold text-red-900">{highPriorityCount}</div>
              <p className="text-[11px] text-red-600/80 mt-1">Requires urgent action</p>
            </button>
          </div>
        </section>

        {/* 3. Filters & Controls */}
        <section aria-label="Filters & Search" className="card p-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="authority-search-input"
                type="text"
                placeholder="Search by Report ID, Issue Type, Location, Ward, Description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 pr-9 text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs">
                <Filter size={13} className="text-gray-500" />
                <span className="text-gray-500 font-medium">Status:</span>
                <select
                  id="authority-status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent font-semibold text-gray-800 outline-none cursor-pointer pr-1"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending (Reported + Under Review)</option>
                  <option value="Reported">Reported</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs">
                <span className="text-gray-500 font-medium">Priority:</span>
                <select
                  id="authority-priority-filter"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-transparent font-semibold text-gray-800 outline-none cursor-pointer pr-1"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Reset Filters */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-semibold text-green-700 hover:text-green-800 hover:bg-green-50 px-2.5 py-1.5 rounded-lg transition-colors border border-green-200 cursor-pointer"
                >
                  Clear Filters
                </button>
              )}

              {/* Manual Refresh Button near filters/table */}
              <button
                id="authority-refresh-button"
                onClick={() => fetchLatestIssues(true)}
                disabled={isFetching}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-green-800 bg-white hover:bg-green-50/50 border border-gray-200 px-2.5 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                title="Fetch latest reports from backend"
              >
                <RefreshCw size={13} className={isFetching ? 'animate-spin text-green-600' : 'text-gray-500'} />
                <span>{isFetching ? 'Syncing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Result count */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing <strong className="text-gray-800">{filteredReports.length}</strong> of{' '}
              <strong className="text-gray-800">{totalCount}</strong> reports
            </span>
            {hasActiveFilters && (
              <span className="text-amber-600 font-medium">Filters currently applied</span>
            )}
          </div>
        </section>

        {/* 2. Reports List / Table */}
        <section aria-label="Reports Table" className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Report ID</th>
                  <th className="py-3 px-4">Issue Type</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Evidence</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Date Reported</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      <div className="max-w-xs mx-auto space-y-2">
                        <Search size={32} className="mx-auto text-gray-300" />
                        <p className="font-semibold text-gray-700">No reports match your filters</p>
                        <p className="text-xs text-gray-400">
                          Try searching with different keywords or reset your filters.
                        </p>
                        {hasActiveFilters && (
                          <button
                            onClick={resetFilters}
                            className="btn-secondary text-xs py-1.5 px-3 mt-2"
                          >
                            Reset all filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => {
                    const isSelected = selectedReportId === report.id;
                    return (
                      <tr
                        key={report.id}
                        onClick={() => handleSelectReport(report)}
                        className={`hover:bg-green-50/40 cursor-pointer transition-colors ${
                          isSelected ? 'bg-green-50/70 border-l-4 border-l-green-600' : ''
                        }`}
                      >
                        {/* Report ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-900 whitespace-nowrap">
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                            {report.id}
                          </span>
                        </td>

                        {/* Issue Type */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: report.imageColor || '#16a34a' }}
                            />
                            <span className="font-semibold text-gray-900">
                              {report.category || 'General'}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-500 truncate max-w-[200px]">
                            {report.title}
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="text-gray-800 text-xs font-medium truncate">
                            {report.location}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {report.ward || report.zone || 'Zone 4'}
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <StatusBadge status={report.priority} type="priority" />
                        </td>

                        {/* Evidence */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {report.evidence && (report.evidence.available || report.evidence.status === 'checked') ? (
                            report.evidence.risk_level === 'high' || (report.evidence.ai_generated_probability ?? 0) >= 0.5 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                Review recommended ({Math.round((report.evidence.ai_generated_probability ?? 0) * 100)}%)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200">
                                Low risk ({Math.round((report.evidence.ai_generated_probability ?? 0) * 100)}%)
                              </span>
                            )
                          ) : (
                            <span className="text-[11px] text-gray-400">
                              {report.image ? 'Unavailable' : 'No photo'}
                            </span>
                          )}
                        </td>

                        {/* Current Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <StatusBadge status={report.status} />
                        </td>

                        {/* Date Reported */}
                        <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                          {report.dateReported || report.reportedAgo || 'Recently'}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectReport(report);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors border border-green-200"
                          >
                            <span>Inspect</span>
                            <ChevronRight size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* 4. Report Details & Status Update Slide-Over Drawer */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-fadeIn"
          onClick={handleCloseDetails}
        >
          <div
            className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-y-auto animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="bg-green-800 text-white px-5 py-4 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-sm bg-white/20 px-2 py-0.5 rounded">
                  {selectedReport.id}
                </span>
                <h2 className="font-bold text-base text-white truncate max-w-[280px]">
                  {selectedReport.title || `${selectedReport.category} Issue`}
                </h2>
              </div>
              <button
                onClick={handleCloseDetails}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-6 flex-1">
              {/* Badges bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Status:</span>
                  <StatusBadge status={selectedReport.status} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Priority:</span>
                  <StatusBadge status={selectedReport.priority} type="priority" />
                </div>
              </div>

              {/* 5. Status Update Action Form */}
              <div className="bg-emerald-50/60 border-2 border-emerald-200/80 rounded-2xl p-4.5">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck size={18} className="text-emerald-700" />
                  <h3 className="font-bold text-sm text-emerald-950 uppercase tracking-wider">
                    Authority Status Update
                  </h3>
                </div>

                <form onSubmit={handleStatusSubmit} className="space-y-3.5">
                  <div>
                    <label
                      htmlFor="update-status-select"
                      className="block text-xs font-semibold text-gray-700 mb-1"
                    >
                      Update Workflow Status
                    </label>
                    <select
                      id="update-status-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer shadow-xs"
                    >
                      <option value="Reported">Reported</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="update-remarks-input"
                      className="block text-xs font-semibold text-gray-700 mb-1"
                    >
                      Official Remarks / Field Dispatch Notes (Optional)
                    </label>
                    <textarea
                      id="update-remarks-input"
                      rows={2}
                      placeholder="e.g. Field inspection completed. Work order #402 dispatched to Zone 4 road crew."
                      value={statusRemarks}
                      onChange={(e) => setStatusRemarks(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-xs resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className="text-[11px] text-gray-500">
                      Changes synchronize immediately to citizen view.
                    </span>
                    <button
                      type="submit"
                      id="submit-status-update-btn"
                      disabled={isUpdating}
                      className="btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                    >
                      {isUpdating ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <Check size={14} />
                          <span>Apply Status</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Report Information Grid */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-gray-900 border-b border-gray-200 pb-2">
                  Report Details
                </h3>

                {/* Issue Type & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-400 font-medium block">Issue Type</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {selectedReport.category || 'General'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-medium block">Date Reported</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {selectedReport.dateReported || 'Recently'}
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <span className="text-xs text-gray-400 font-medium block">Location</span>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin size={15} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-900 font-medium">{selectedReport.location}</p>
                      <p className="text-xs text-gray-500">
                        {selectedReport.zone || 'Zone 4'} • {selectedReport.ward || 'Ward 104'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <span className="text-xs text-gray-400 font-medium block">Citizen Description</span>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3.5 rounded-xl border border-gray-200 mt-1 leading-relaxed">
                    {selectedReport.description || 'No additional description provided.'}
                  </p>
                </div>

                {/* Image / Evidence */}
                <div>
                  <span className="text-xs text-gray-400 font-medium block mb-1">
                    Image / Evidence
                  </span>
                  {selectedReport.image ? (
                    <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100 max-h-64">
                      <img
                        src={selectedReport.image}
                        alt={`Evidence for ${selectedReport.id}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="h-32 rounded-xl flex flex-col items-center justify-center text-white font-bold tracking-wider relative overflow-hidden"
                      style={{
                        backgroundColor: selectedReport.imageColor || '#16a34a',
                      }}
                    >
                      <span className="text-2xl opacity-90">
                        {selectedReport.imageLabel || selectedReport.category?.toUpperCase() || 'ISSUE'}
                      </span>
                      <span className="text-xs font-normal opacity-75 mt-1">
                        Category Visual Asset
                      </span>
                    </div>
                  )}
                </div>


                {/* Assigned Crew */}
                {selectedReport.assignedTo && (
                  <div>
                    <span className="text-xs text-gray-400 font-medium block">Assigned Unit</span>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">
                      {selectedReport.assignedTo}
                    </p>
                  </div>
                )}

                {/* Timeline */}
                <div className="pt-2">
                  <span className="text-xs text-gray-400 font-medium block mb-3">
                    Progress Timeline
                  </span>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <IssueTimeline timeline={selectedReport.timeline || []} />
                  </div>
                </div>

                {/* Updates Log */}
                {selectedReport.updates && selectedReport.updates.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs text-gray-400 font-medium block mb-2">
                      Official Updates Log
                    </span>
                    <div className="space-y-2">
                      {selectedReport.updates.map((upd, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-3 rounded-lg border border-gray-200 text-xs shadow-2xs"
                        >
                          <div className="flex items-center justify-between text-gray-400 mb-1">
                            <span className="font-semibold text-green-700">{upd.author}</span>
                            <span>{upd.date}</span>
                          </div>
                          <p className="text-gray-700">{upd.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Link to Citizen Details */}
              <div className="pt-4 border-t border-gray-200 flex justify-end">
                <Link
                  to={`/issues/${selectedReport.id}`}
                  className="inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-800 font-semibold"
                >
                  <span>View in Citizen View</span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
