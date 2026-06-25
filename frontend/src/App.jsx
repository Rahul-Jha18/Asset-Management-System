import React from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';

import Login from './pages/Login';
import ForgotPassword from "./pages/ForgotPassword";
import Register from './pages/Register';
import Landing from './pages/Landing';
import Branch from './pages/Branch';
import AssetTrackingPage from "./pages/AssetTrackingPage";
import BranchDetails from './pages/BranchDetails.jsx';
import RequestPage from './pages/RequestPage'; 
import SupportPage from "./pages/SupportPage.jsx";
import AssetMaintenanceLogs from "./pages/AssetMaintenanceLogs";
import BranchAssetsReport from "./pages/BranchAssetsMasterReport.jsx";
import AdminUsers from "./pages/AdminUsers";
import AdminExpiry from "./pages/AdminExpiry";
import AssetDashboard from './pages/AssetDashboard.jsx';
import FileLibraryPage from './pages/FileLibraryPage.jsx'
import Employee from "./pages/Employee";
import BranchIssuesPage from "./pages/BranchIssuesPage";
import BranchIssueDetailPage from "./pages/BranchIssueDetailPage";

import Nav from './components/Layout/Nav';
import { useAuth } from './context/AuthContext';

// Layout wrapper for protected pages
function Layout() {
  const location = useLocation();
  const { pathname } = location;

  // Show Nav **only on Landing page**
  const showNav = pathname === '/';

  return (
    <>
      {showNav && <Nav />}
      <Outlet />
    </>
  );
}

// Protect route for logged-in users
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

// Optional admin route wrapper
function AdminRoute({ children }) {
  const { user } = useAuth();
  return user?.role === 'admin' || user?.role === 'subadmin'
    ? children
    : <Navigate to="/" replace />;
}

export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  const { pathname } = location;

  // Show Nav on login page too
  const showNavOnLogin = pathname === '/login';

  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/login" element={
        <>
          {showNavOnLogin && <Nav />}
          <Login />
        </>
      } />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* PROTECTED */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Landing />} />
        <Route path="branches" element={<Branch />} />
        <Route path="branches/:id" element={<BranchDetails />} />
        <Route path="branch-assets-report" element={<BranchAssetsReport />} />
        <Route path="requests" element={<RequestPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="maintenance" element={<AssetMaintenanceLogs />} />
        <Route path="asset-tracking" element={<AssetTrackingPage />} />
        <Route path="admin/users" element={<AdminUsers />} />
        <Route path="admin/expiry" element={<AdminExpiry />} />
        <Route path="assetdashboard" element={<AssetDashboard/>}/>
        <Route path="/employees-master" element={<Employee />} />
        <Route path="/file-library" element={<FileLibraryPage />} />
        <Route path="/branch-issues" element={<BranchIssuesPage />} />
        <Route path="/branch-issues/:id" element={<BranchIssueDetailPage />} />
      </Route>

      {/* FALLBACK */}
      <Route
        path="*"
        element={<Navigate to={user ? '/' : '/login'} replace />}
      />
    </Routes>
  );
}
