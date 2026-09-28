import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight, CheckCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function IssueCard({ issue, variant = 'default', className = '' }) {
  const navigate = useNavigate();

  const handleClick = () => navigate(`/issues/${issue.id}`);

  if (variant === 'compact') {
    return (
      <div
        onClick={handleClick}
        className={`card p-3 flex gap-3 cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98] ${className}`}
      >
        {/* Image */}
        <div
          className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: issue.imageColor || '#16a34a' }}
        >
          {issue.image ? (
            <img src={issue.image} alt={issue.title} className="w-full h-full object-cover rounded-xl" />
          ) : (
            <span className="text-center leading-tight px-0.5">{issue.imageLabel}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <span className="text-xs text-gray-400">{issue.reportedAgo}</span>
              {issue.distance && (
                <span className="text-xs text-gray-400 ml-2">{issue.distance}</span>
              )}
            </div>
            <StatusBadge status={issue.status} />
          </div>
          <p className="font-semibold text-sm text-gray-900 leading-tight truncate">{issue.title}</p>
          <p className="text-xs text-gray-500 truncate mt-0.5">{issue.location}</p>
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users size={11} />
              <span>{issue.citizensVerified} citizens verified</span>
            </div>
            <button className="text-xs text-green-600 font-semibold flex items-center gap-0.5 hover:text-green-700">
              Details <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'resolved') {
    return (
      <div
        onClick={handleClick}
        className={`card p-3 flex gap-3 cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98] ${className}`}
      >
        <div className="relative w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold overflow-hidden"
          style={{ backgroundColor: issue.imageColor || '#16a34a' }}>
          {issue.image ? (
            <img src={issue.image} alt={issue.title} className="w-full h-full object-cover" />
          ) : (
            <span>{issue.imageLabel}</span>
          )}
          <div className="absolute inset-0 bg-green-600/80 flex items-center justify-center">
            <span className="text-white text-xs font-bold">FIXED</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs text-gray-400">{issue.reportedAgo}</span>
          <p className="font-semibold text-sm text-gray-900 leading-tight">{issue.title}</p>
          <p className="text-xs text-gray-500 truncate mt-0.5">{issue.location}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <CheckCircle size={12} className="text-green-600" />
            <span className="text-xs text-green-700 font-medium">Ward Engineer proof verified</span>
            <button className="text-xs text-green-600 font-semibold ml-auto">Proof</button>
          </div>
        </div>
      </div>
    );
  }

  // Default / my-reports card
  return (
    <div
      onClick={handleClick}
      className={`card p-4 cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.99] ${className}`}
    >
      <div className="flex gap-3">
        <div
          className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: issue.imageColor || '#16a34a' }}
        >
          {issue.image ? (
            <img src={issue.image} alt={issue.title} className="w-full h-full object-cover rounded-xl" />
          ) : (
            <span className="text-center leading-tight px-0.5">{issue.imageLabel}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm text-gray-900 leading-tight">{issue.title}</p>
            <StatusBadge status={issue.status} />
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{issue.location}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <StatusBadge status={issue.priority} type="priority" />
            <span className="text-xs text-gray-400">{issue.dateReported || issue.reportedAgo}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Users size={11} />
          <span>{issue.citizensVerified} citizens verified</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/issues/${issue.id}`); }}
          className="text-xs text-green-600 font-semibold flex items-center gap-0.5 hover:text-green-700"
        >
          Track Report <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
