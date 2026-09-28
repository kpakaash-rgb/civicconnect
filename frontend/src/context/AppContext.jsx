import { createContext, useContext, useState } from 'react';
import { issues as initialIssues } from '../data/issues';
import { myReports as initialMyReports, currentUser as initialUser } from '../data/user';
import { notifications as initialNotifications } from '../data/notifications';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [issues, setIssues] = useState(initialIssues);
  const [myReports, setMyReports] = useState(initialMyReports);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [submittedReport, setSubmittedReport] = useState(null);
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const openProfile = () => setIsProfileOpen(true);
  const closeProfile = () => setIsProfileOpen(false);

  const addReport = (reportData) => {
    const newId = `CC-${1050 + myReports.length}`;

    // Build the full issue object that goes into the issues list
    const newIssue = {
      id: newId,
      title: reportData.title || `${reportData.category} Issue`,
      shortTitle: reportData.title || `${reportData.category} Issue`,
      category: reportData.category,
      status: 'Reported',
      priority: reportData.severity || 'Medium',
      location: reportData.location || 'Anna Nagar, Chennai',
      zone: 'Zone 4 • Anna Nagar',
      ward: 'Ward 104',
      distance: '0m away',
      reportedAgo: 'Just now',
      dateReported: new Date().toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric',
      }),
      citizensVerified: 0,
      description: reportData.description,
      severity: reportData.severity,
      image: reportData.imagePreview || null,
      imageColor: '#16a34a',
      imageLabel: reportData.category?.slice(0, 4).toUpperCase() || 'ISS',
      coordinates: { lat: 13.085, lng: 80.212 },
      assignedTo: null,
      timeline: [
        {
          step: 'Reported',
          done: true,
          date: new Date().toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          }),
          note: 'Report submitted by citizen via CivicConnect.',
        },
        { step: 'Under Review', done: false, date: null, note: null },
        { step: 'Assigned', done: false, date: null, note: null },
        { step: 'In Progress', done: false, date: null, note: null },
        { step: 'Resolved', done: false, date: null, note: null },
        { step: 'Citizen Verified', done: false, date: null, note: null },
      ],
      updates: [],
      tags: [reportData.category],
    };

    // Lightweight record for My Reports list
    const newMyReport = {
      id: newId,
      title: newIssue.title,
      category: newIssue.category,
      status: 'Reported',
      priority: reportData.severity || 'Medium',
      location: newIssue.location,
      dateReported: newIssue.dateReported,
      lastUpdated: newIssue.dateReported,
      citizensVerified: 0,
    };

    // Activity feed notification for the new submission
    const newNotif = {
      id: `notif-${Date.now()}`,
      type: 'submitted',
      issueId: newId,
      title: 'Report submitted successfully',
      message: `Your report "${newIssue.title}" has been submitted and is now visible to the community. You will receive updates as it progresses.`,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      isRead: false,
      priority: 'normal',
    };

    setIssues((prev) => [newIssue, ...prev]);
    setMyReports((prev) => [newMyReport, ...prev]);
    setNotifications((prev) => [newNotif, ...prev]);
    setSubmittedReport(newIssue);
    return newIssue;
  };

  const getIssueById = (id) => issues.find((i) => i.id === id);

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <AppContext.Provider
      value={{
        issues,
        myReports,
        notifications,
        submittedReport,
        currentUser,
        setCurrentUser,
        isProfileOpen,
        openProfile,
        closeProfile,
        addReport,
        getIssueById,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
