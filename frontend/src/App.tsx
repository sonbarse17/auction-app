import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/mobile.css';
import { useAuthStore } from './stores/authStore';
import { Login } from './pages/Login';
import { OrganizerDashboard } from './pages/OrganizerDashboard';
import { LiveAuction } from './pages/LiveAuction';
import { AuctionControl } from './pages/AuctionControl';
import { OwnerAuction } from './pages/OwnerAuction';
import { TeamManagement } from './pages/TeamManagement';
import { PlayerManagement } from './pages/PlayerManagement';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { AuctionResults } from './pages/AuctionResults';
import { AdminPanel } from './pages/AdminPanel';
import { ReplayViewer } from './pages/ReplayViewer';
import { Profile } from './pages/Profile';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import MultiAuctionDashboard from './pages/MultiAuctionDashboard';
import InstallPrompt from './components/InstallPrompt';
import { ToastContainer } from './components/Toast';
import { useToastStore } from './stores/toastStore';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const { loadUser, isAuthenticated } = useAuthStore();
  const { toasts, removeToast } = useToastStore();

  useEffect(() => {
    if (isAuthenticated) {
      loadUser();
    }
  }, [isAuthenticated, loadUser]);

  return (
    <BrowserRouter>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <InstallPrompt />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/organizer"
          element={
            <PrivateRoute>
              <OrganizerDashboard />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/live/:id"
          element={
            <PrivateRoute>
              <LiveAuction />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/control/:id"
          element={
            <PrivateRoute>
              <AuctionControl />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/owner/:id"
          element={
            <PrivateRoute>
              <OwnerAuction />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/teams"
          element={
            <PrivateRoute>
              <TeamManagement />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/players"
          element={
            <PrivateRoute>
              <PlayerManagement />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/results/:id"
          element={
            <PrivateRoute>
              <AuctionResults />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminPanel />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/replay/:auctionId"
          element={
            <PrivateRoute>
              <ReplayViewer />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/analytics/:id"
          element={
            <PrivateRoute>
              <AnalyticsDashboard />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/multi-auction"
          element={
            <PrivateRoute>
              <MultiAuctionDashboard />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
