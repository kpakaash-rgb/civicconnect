import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import BottomNav from './components/BottomNav';
import ProfileModal from './components/ProfileModal';
import Home from './pages/Home';
import ExploreIssues from './pages/ExploreIssues';
import ReportIssue from './pages/ReportIssue';
import IssueDetails from './pages/IssueDetails';
import MyReports from './pages/MyReports';
import Activity from './pages/Activity';
import Profile from './pages/Profile';
import AuthorityDashboard from './pages/AuthorityDashboard';
import AuthorityLogin from './pages/AuthorityLogin';
import Login from './pages/Login';
import Register from './pages/Register';

/**
 * Route guard for Municipal Authority Dashboard
 * 1. If not authenticated -> redirect to /authority-login
 * 2. If authenticated but role !== "authority" -> redirect to /
 */
function ProtectedAuthorityRoute({ children }) {
  const { currentUser, isAuthenticated } = useApp();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/authority-login" replace />;
  }

  if (currentUser.role !== 'authority') {
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * Route guard for Citizen views
 * If not authenticated -> redirect to /login
 */
function ProtectedCitizenRoute({ children }) {
  const { currentUser, isAuthenticated } = useApp();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppLayout() {
  const location = useLocation();
  const isAuthorityDashboard =
    location.pathname === '/authority' || location.pathname.startsWith('/authority/');
  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/authority-login' ||
    location.pathname === '/register';
  const hideNav =
    location.pathname === '/report' || isAuthorityDashboard || isAuthPage;

  if (isAuthorityDashboard) {
    return (
      <Routes>
        <Route
          path="/authority"
          element={
            <ProtectedAuthorityRoute>
              <AuthorityDashboard />
            </ProtectedAuthorityRoute>
          }
        />
        <Route
          path="/authority/*"
          element={
            <ProtectedAuthorityRoute>
              <AuthorityDashboard />
            </ProtectedAuthorityRoute>
          }
        />
      </Routes>
    );
  }

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/authority-login" element={<AuthorityLogin />} />
      </Routes>
    );
  }

  return (
    <div className="max-w-lg mx-auto relative min-h-screen">
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedCitizenRoute>
              <Home />
            </ProtectedCitizenRoute>
          }
        />
        <Route
          path="/explore"
          element={
            <ProtectedCitizenRoute>
              <ExploreIssues />
            </ProtectedCitizenRoute>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedCitizenRoute>
              <ReportIssue />
            </ProtectedCitizenRoute>
          }
        />
        <Route
          path="/issues/:id"
          element={
            <ProtectedCitizenRoute>
              <IssueDetails />
            </ProtectedCitizenRoute>
          }
        />
        <Route
          path="/my-reports"
          element={
            <ProtectedCitizenRoute>
              <MyReports />
            </ProtectedCitizenRoute>
          }
        />
        <Route
          path="/activity"
          element={
            <ProtectedCitizenRoute>
              <Activity />
            </ProtectedCitizenRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedCitizenRoute>
              <Profile />
            </ProtectedCitizenRoute>
          }
        />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!hideNav && <BottomNav />}

      {/* Global Profile Modal view triggered when profile avatar is touched */}
      <ProfileModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}
