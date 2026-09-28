import { Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import BottomNav from './components/BottomNav';
import ProfileModal from './components/ProfileModal';
import Home from './pages/Home';
import ExploreIssues from './pages/ExploreIssues';
import ReportIssue from './pages/ReportIssue';
import IssueDetails from './pages/IssueDetails';
import MyReports from './pages/MyReports';
import Activity from './pages/Activity';
import Profile from './pages/Profile';

function AppLayout() {
  const location = useLocation();
  // Hide bottom nav on report page (full-screen workflow)
  const hideNav = location.pathname === '/report';

  return (
    <div className="max-w-lg mx-auto relative min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<ExploreIssues />} />
        <Route path="/report" element={<ReportIssue />} />
        <Route path="/issues/:id" element={<IssueDetails />} />
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/profile" element={<Profile />} />
        {/* Fallback */}
        <Route path="*" element={<Home />} />
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
