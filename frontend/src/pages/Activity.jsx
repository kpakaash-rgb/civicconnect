import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CheckCircle, AlertTriangle, MessageSquare, Users,
  Check, X, ChevronRight, FileText, Zap, User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Toast from '../components/Toast';

const notifConfig = {
  resolution_verify: { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Verify Fix' },
  status_update:     { icon: Bell,         color: 'text-blue-600 bg-blue-100',   label: 'Update' },
  community_verify:  { icon: Users,        color: 'text-purple-600 bg-purple-100', label: 'Community' },
  assigned:          { icon: MessageSquare,color: 'text-amber-600 bg-amber-100', label: 'Assigned' },
  community_update:  { icon: AlertTriangle,color: 'text-red-600 bg-red-100',     label: 'Alert' },
  resolved:          { icon: CheckCircle,  color: 'text-green-600 bg-green-100', label: 'Resolved' },
  submitted:         { icon: FileText,     color: 'text-green-600 bg-green-50',  label: 'Submitted' },
};

export default function Activity() {
  const navigate = useNavigate();
  const { notifications, markNotificationRead, markAllNotificationsRead, currentUser, openProfile } = useApp();
  const [verifiedNotifs, setVerifiedNotifs] = useState({});
  const [toast, setToast] = useState(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    setToast({ message: 'All notifications marked as read', type: 'success' });
  };

  const handleVerify = (notifId, confirmed) => {
    setVerifiedNotifs((prev) => ({ ...prev, [notifId]: confirmed ? 'confirmed' : 'rejected' }));
    markNotificationRead(notifId);
    setToast({
      message: confirmed
        ? 'Resolution confirmed! Thank you for verifying.'
        : 'Feedback submitted. The team will follow up.',
      type: confirmed ? 'success' : 'info',
    });
  };

  const handleViewIssue = (notif) => {
    markNotificationRead(notif.id);
    navigate(`/issues/${notif.issueId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <header className="bg-green-700 text-white px-4 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Activity</h1>
            <p className="text-green-200 text-xs">Updates for your reports &amp; nearby issues</p>
          </div>
          <div className="flex items-center gap-2.5">
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
            {currentUser && (
              <button
                onClick={openProfile}
                id="activity-profile-btn"
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
      </header>

      <div className="px-4 py-4">
        {/* Mark all read */}
        {unreadCount > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{unreadCount}</span> unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-green-600 font-semibold hover:text-green-700"
            >
              Mark all read
            </button>
          </div>
        )}

        {/* Notifications */}
        {notifications.length === 0 ? (
          <div className="card p-10 text-center mt-4">
            <Bell size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-500">No notifications yet</p>
            <p className="text-sm text-gray-400 mt-1">Report an issue to start receiving updates</p>
            <button
              onClick={() => navigate('/report')}
              className="btn-primary text-sm mt-4"
            >
              Report an Issue
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => {
              const cfg = notifConfig[notif.type] || notifConfig.status_update;
              const Icon = cfg.icon;
              const isVerifyType = notif.type === 'resolution_verify';
              const isSubmittedType = notif.type === 'submitted';
              const verifyResult = verifiedNotifs[notif.id];

              return (
                <div
                  key={notif.id}
                  className={`card p-4 transition-all ${
                    !notif.isRead ? 'border-l-4 border-green-500 shadow-sm' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                      <Icon size={18} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold leading-snug ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notif.title}
                        </p>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {!notif.isRead && <span className="w-2 h-2 bg-green-500 rounded-full" />}
                          <span className="text-xs text-gray-400">{notif.timeAgo}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.message}</p>

                      {/* Issue ID badge */}
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-xs font-mono text-green-700 font-medium bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                          {notif.issueId}
                        </span>
                        {isSubmittedType && (
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 flex items-center gap-1">
                            <Zap size={9} /> Submitted
                          </span>
                        )}
                      </div>

                      {/* Verify fix actions */}
                      {isVerifyType && !verifyResult && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                          <p className="text-xs font-semibold text-green-800 mb-2">
                            Resolution needs your confirmation
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVerify(notif.id, true)}
                              className="flex-1 bg-green-600 text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-1.5 hover:bg-green-700 active:scale-95 transition-all"
                            >
                              <Check size={13} /> Yes, Verify Fix
                            </button>
                            <button
                              onClick={() => handleVerify(notif.id, false)}
                              className="flex-1 bg-red-50 text-red-700 text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-1.5 hover:bg-red-100 active:scale-95 transition-all border border-red-200"
                            >
                              <X size={13} /> Not Fixed
                            </button>
                          </div>
                        </div>
                      )}

                      {verifyResult && (
                        <div className={`mt-2 p-2 rounded-lg flex items-center gap-2 ${
                          verifyResult === 'confirmed' ? 'bg-green-50' : 'bg-orange-50'
                        }`}>
                          <CheckCircle size={13} className={verifyResult === 'confirmed' ? 'text-green-600' : 'text-orange-500'} />
                          <p className={`text-xs font-medium ${verifyResult === 'confirmed' ? 'text-green-700' : 'text-orange-700'}`}>
                            {verifyResult === 'confirmed' ? 'You verified this resolution' : 'Feedback submitted'}
                          </p>
                        </div>
                      )}

                      {/* View report link */}
                      <button
                        onClick={() => handleViewIssue(notif)}
                        className="mt-2 flex items-center gap-1 text-xs text-green-600 font-semibold hover:text-green-700"
                      >
                        View report <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="h-24" />
    </div>
  );
}
