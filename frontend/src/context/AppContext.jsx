import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { issues as initialIssues } from '../data/issues';
import { myReports as initialMyReports, currentUser as initialUser } from '../data/user';
import { notifications as initialNotifications } from '../data/notifications';
import {
  getIssues as fetchIssuesApi,
  createIssue as createIssueApi,
  updateIssueStatus as updateIssueStatusApi,
  login as loginApi,
  register as registerApi,
  getUserIssues as fetchUserIssuesApi,
} from '../services/api';

const STORAGE_KEYS = {
  NOTIFICATIONS: 'civicconnect_notifications_v1',
  AUTH_USER: 'civicconnect_auth_user_v2',
};

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [issues, setIssues] = useState(initialIssues);
  const [myReports, setMyReports] = useState(initialMyReports);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load authenticated user from localStorage if present
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved user:', e);
    }
    return null;
  });

  const isAuthenticated = !!currentUser;

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : initialNotifications;
    } catch {
      return initialNotifications;
    }
  });

  const [submittedReport, setSubmittedReport] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Sync notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to save notifications to localStorage:', e);
    }
  }, [notifications]);

  /**
   * Authenticate citizen or authority via POST /api/auth/login
   */
  const login = async (email, password = '') => {
    const apiUser = await loginApi(email, password);
    const role = apiUser.role || (email.toLowerCase().includes('authority') ? 'authority' : 'citizen');

    let fullUser = {
      ...apiUser,
      role,
    };

    if (role === 'citizen') {
      fullUser = {
        ...initialUser,
        ...fullUser,
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        age: apiUser.age,
        area: apiUser.area || 'Anna Nagar',
        ward: apiUser.ward || 'Ward 104',
        phone: apiUser.phone,
        role: 'citizen',
        location: `${apiUser.area || 'Anna Nagar'}, Chennai`,
        roleTitle: 'Civic Champion • Verified Citizen',
        bio: 'Active civic advocate in Anna Nagar. Committed to cleaner streets, prompt drainage repairs, and pedestrian-friendly public spaces.',
        reputationRank: initialUser.reputationRank || 'Top 5% in Ward 104',
        reputationScore: initialUser.reputationScore || 92,
        badges: initialUser.badges || [],
      };
    } else {
      fullUser = {
        ...fullUser,
        id: apiUser.id,
        name: apiUser.name,
        role: 'authority',
        fullName: apiUser.name || 'Zone 4 Municipal Officer',
        roleTitle: 'Zone 4 Operations Officer',
        location: 'Zone 4 Municipal Headquarters, Anna Nagar',
      };
    }

    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(fullUser));
    } catch (e) {
      console.warn('Failed to persist user session:', e);
    }

    setCurrentUser(fullUser);
    return fullUser;
  };

  /**
   * Register a new citizen account via POST /api/auth/register
   */
  const registerUser = async (userData) => {
    const apiUser = await registerApi(userData);
    let fullUser = {
      ...initialUser,
      ...apiUser,
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      age: apiUser.age || userData.age,
      area: apiUser.area || userData.area || 'Anna Nagar',
      ward: apiUser.ward || 'Ward 104',
      phone: apiUser.phone,
      role: 'citizen',
      location: `${apiUser.area || userData.area || 'Anna Nagar'}, Chennai`,
      roleTitle: 'Civic Champion • Verified Citizen',
      bio: 'Active civic advocate in Anna Nagar. Committed to cleaner streets, prompt drainage repairs, and pedestrian-friendly public spaces.',
      badges: initialUser.badges || [],
      reputationScore: 90,
      reputationRank: 'Top 5% in Ward 104',
    };

    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(fullUser));
    } catch (e) {
      console.warn('Failed to persist user session:', e);
    }

    setCurrentUser(fullUser);
    return fullUser;
  };

  /**
   * Clear session and log out
   */
  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    } catch (e) {
      console.warn('Failed to clear session:', e);
    }
    setCurrentUser(null);
    setMyReports([]);
  };

  // Load issues and user reports from FastAPI backend
  const refreshIssues = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchIssuesApi();
      if (Array.isArray(data) && data.length > 0) {
        setIssues(data);
        setError(null);
      }

      // Fetch user-specific reports for the logged-in citizen
      if (currentUser?.id) {
        try {
          const userIssues = await fetchUserIssuesApi(currentUser.id);
          if (Array.isArray(userIssues)) {
            const formatted = userIssues.map((r) => ({
              id: r.id,
              title: r.title,
              category: r.category,
              status: r.status,
              priority: r.priority,
              location: r.location,
              dateReported: r.dateReported || r.created_at?.slice(0, 10),
              lastUpdated: r.updated_at?.slice(0, 10) || r.dateReported,
              citizensVerified: 12,
            }));
            setMyReports(formatted);
          }
        } catch (err) {
          console.warn('[AppContext] Failed to fetch citizen-specific issues:', err);
        }
      } else {
        setMyReports([]);
      }
    } catch (err) {
      console.warn('[CivicConnect] Backend API unavailable, using cached seed issues:', err.message);
      setError('Unable to connect to CivicConnect server. Showing cached data.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshIssues();
  }, [refreshIssues]);

  const openProfile = () => setIsProfileOpen(true);
  const closeProfile = () => setIsProfileOpen(false);

  /**
   * Submit a new citizen report to the FastAPI backend
   */
  const addReport = async (reportData) => {
    const payload = {
      title: reportData.title || `${reportData.category} Issue`,
      category: reportData.category,
      description: reportData.description,
      location: reportData.location || 'Anna Nagar 2nd Avenue, Chennai',
      zone: reportData.zone || 'Zone 4 • Anna Nagar',
      ward: reportData.ward || 'Ward 104',
      priority: reportData.severity || reportData.priority || 'Medium',
      image: reportData.imagePreview || reportData.image || null,
      reporter_id: currentUser?.id ? Number(currentUser.id) || 1 : 1,
    };

    // Call backend API
    const newIssue = await createIssueApi(payload);

    // Create lightweight record for My Reports list
    const newMyReport = {
      id: newIssue.id,
      title: newIssue.title,
      category: newIssue.category,
      status: newIssue.status,
      priority: newIssue.priority,
      location: newIssue.location,
      dateReported: newIssue.dateReported || new Date().toLocaleDateString('en-IN'),
      lastUpdated: newIssue.dateReported || new Date().toLocaleDateString('en-IN'),
      citizensVerified: 0,
    };

    // Activity feed notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      type: 'submitted',
      issueId: newIssue.id,
      title: 'Report submitted successfully',
      message: `Your report "${newIssue.title}" (${newIssue.id}) has been submitted to the municipal authority.`,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      isRead: false,
      priority: 'normal',
    };

    setIssues((prev) => [newIssue, ...prev.filter((i) => i.id !== newIssue.id)]);
    setMyReports((prev) => [newMyReport, ...prev.filter((r) => r.id !== newIssue.id)]);
    setNotifications((prev) => [newNotif, ...prev]);
    setSubmittedReport(newIssue);
    return newIssue;
  };

  /**
   * Authority updates status of an issue with remarks
   */
  const updateIssueStatus = async (id, newStatus, remarks = '') => {
    const nowStr = new Date().toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    try {
      // Call backend API
      const updatedBackendIssue = await updateIssueStatusApi(id, newStatus, remarks);

      // Update state with fresh backend data
      setIssues((prev) =>
        prev.map((item) => (item.id === id ? updatedBackendIssue : item))
      );

      // Update in myReports if present
      setMyReports((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: newStatus, lastUpdated: nowStr }
            : r
        )
      );

      // Add citizen notification
      const newNotif = {
        id: `notif-${Date.now()}`,
        type: 'status_update',
        issueId: id,
        title: `Status Update: ${newStatus}`,
        message: `Report #${id} status changed to "${newStatus}" by the municipal authority.${remarks ? ` Remarks: "${remarks}"` : ''}`,
        timestamp: new Date().toISOString(),
        timeAgo: 'Just now',
        isRead: false,
        priority: newStatus === 'Resolved' ? 'high' : 'normal',
      };
      setNotifications((prev) => [newNotif, ...prev]);

      return updatedBackendIssue;
    } catch (err) {
      console.error('[CivicConnect] Error updating status on backend:', err);

      // Fallback local update
      setIssues((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          return {
            ...item,
            status: newStatus,
            timeline: (item.timeline || []).map((t) =>
              t.step === newStatus ? { ...t, done: true, date: nowStr, note: remarks } : t
            ),
          };
        })
      );
      setMyReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus, lastUpdated: nowStr } : r))
      );
    }
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
        isAuthenticated,
        login,
        registerUser,
        register: registerUser,
        logout,
        isProfileOpen,
        openProfile,
        closeProfile,
        addReport,
        updateIssueStatus,
        getIssueById,
        refreshIssues,
        loading,
        error,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
