import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, MapPin, Users, Calendar, Building2,
  CheckCircle, AlertTriangle, Share2, Flag, X, ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import IssueTimeline from '../components/IssueTimeline';
import StatusBadge from '../components/StatusBadge';
import MapView from '../components/MapView';
import Toast from '../components/Toast';

export default function IssueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getIssueById } = useApp();
  const issue = getIssueById(id);

  const [verifyState, setVerifyState] = useState(null); // null | 'confirmed' | 'rejected'
  const [toast, setToast] = useState(null);

  if (!issue) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <AlertTriangle size={48} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-600 mb-2">Issue Not Found</h2>
        <p className="text-sm text-gray-400 mb-5">This report may have been removed or the ID is incorrect.</p>
        <button onClick={() => navigate('/explore')} className="btn-primary">
          Explore Issues
        </button>
      </div>
    );
  }

  const isResolved = issue.status === 'Resolved';
  const currentStep = issue.timeline.findIndex((t) => !t.done);
  const doneCount = issue.timeline.filter((t) => t.done).length;
  const progressPct = Math.round((doneCount / issue.timeline.length) * 100);

  const handleVerify = (confirm) => {
    setVerifyState(confirm ? 'confirmed' : 'rejected');
    setToast({
      message: confirm ? 'Resolution confirmed! Thank you for verifying.' : 'Feedback submitted. The team will review.',
      type: confirm ? 'success' : 'info',
    });
  };

  const priorityColors = {
    High: 'bg-red-100 text-red-700',
    Medium: 'bg-amber-100 text-amber-700',
    Low: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <header className="bg-green-700 text-white px-4 py-4 sticky top-0 z-40">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-lg">
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-base leading-tight truncate">{issue.title}</h1>
            <p className="text-green-200 text-xs">{issue.id} • {issue.ward}</p>
          </div>
          <div className="flex gap-1">
            <button className="p-1.5 hover:bg-white/10 rounded-lg">
              <Share2 size={16} />
            </button>
            <button className="p-1.5 hover:bg-white/10 rounded-lg">
              <Flag size={16} />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white/10 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-green-200">Resolution Progress</p>
            <p className="text-xs font-bold text-white">{progressPct}%</p>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-300 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-green-300">{doneCount} of {issue.timeline.length} steps complete</span>
            <StatusBadge status={issue.status} />
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Meta info */}
        <div className="card p-4">
          <div className="flex items-start gap-3">
            {/* Image */}
            <div
              className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: issue.imageColor || '#16a34a' }}
            >
              {issue.image ? (
                <img src={issue.image} alt={issue.title} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <span className="text-center px-0.5 leading-tight">{issue.imageLabel}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-gray-900 leading-tight">{issue.title}</h2>
              <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs">
                <MapPin size={11} className="text-green-600 flex-shrink-0" />
                <span className="truncate">{issue.location}</span>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <StatusBadge status={issue.priority} type="priority" />
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar size={10} /> {issue.dateReported}
                </span>
              </div>
            </div>
          </div>

          {issue.description && (
            <p className="text-sm text-gray-600 mt-3 leading-relaxed border-t border-gray-100 pt-3">
              {issue.description}
            </p>
          )}

          {/* Community verified */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <Users size={14} className="text-green-600" />
            <span className="text-sm text-gray-700">
              <span className="font-semibold">{issue.citizensVerified}</span> citizens verified this issue
            </span>
          </div>
        </div>

        {/* Latest update */}
        {issue.updates.length > 0 && (
          <div className="card p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Latest Update</p>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-xs font-semibold text-blue-800">{issue.updates[0].author}</p>
                <span className="text-xs text-blue-500">{issue.updates[0].date}</span>
              </div>
              <p className="text-sm text-blue-900 leading-relaxed">{issue.updates[0].text}</p>
            </div>

            {issue.assignedTo && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <Building2 size={14} className="text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Responsible Team</p>
                  <p className="text-sm font-semibold text-gray-800">{issue.assignedTo}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Location map */}
        <div className="card overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location Map</p>
            <p className="text-sm text-gray-700 flex items-center gap-1 mt-0.5">
              <MapPin size={12} className="text-green-600" /> {issue.location}
            </p>
          </div>
          <MapView issues={[issue]} selectedId={issue.id} height="160px" className="rounded-none" />
        </div>

        {/* Timeline */}
        <div className="card p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Resolution Timeline</p>
          <IssueTimeline timeline={issue.timeline} />
        </div>

        {/* Resolution evidence */}
        {isResolved && issue.resolutionEvidence && (
          <div className="card p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Resolution Evidence</p>
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl">
              <CheckCircle size={16} className="text-green-600" />
              <p className="text-sm text-green-800 font-medium">{issue.resolutionEvidence}</p>
            </div>
          </div>
        )}

        {/* All updates */}
        {issue.updates.length > 1 && (
          <div className="card p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">All Updates</p>
            <div className="space-y-3">
              {issue.updates.map((u, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-1.5 bg-green-200 rounded-full flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-semibold text-gray-700">{u.author}</p>
                      <span className="text-xs text-gray-400">{u.date}</span>
                    </div>
                    <p className="text-sm text-gray-600">{u.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verify resolution */}
        {isResolved && !verifyState && (
          <div className="card p-4 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={18} className="text-green-600" />
              <p className="font-bold text-gray-900">Confirm Resolution</p>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              The ward engineer has marked this issue as resolved. Has the problem been fixed?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleVerify(true)}
                className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 active:scale-95 transition-all text-sm"
              >
                ✓ Yes, verify resolution
              </button>
              <button
                onClick={() => handleVerify(false)}
                className="flex-1 bg-red-50 text-red-700 font-semibold py-3 rounded-xl hover:bg-red-100 active:scale-95 transition-all text-sm border border-red-200"
              >
                ✕ Not fixed
              </button>
            </div>
          </div>
        )}

        {verifyState && (
          <div className={`card p-4 border-2 ${verifyState === 'confirmed' ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className={verifyState === 'confirmed' ? 'text-green-600' : 'text-orange-500'} />
              <p className="font-semibold text-gray-900">
                {verifyState === 'confirmed' ? 'Resolution Confirmed' : 'Feedback Submitted'}
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {verifyState === 'confirmed'
                ? 'Thank you for verifying! Your confirmation helps close this issue.'
                : 'The team has been notified and will follow up on this issue.'}
            </p>
          </div>
        )}

        {/* Tags */}
        {issue.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {issue.tags.map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="h-24" />
    </div>
  );
}
