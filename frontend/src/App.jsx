import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Branch from './pages/Branch';
import BranchDetails from './pages/BranchDetails';
import Assets from './pages/Assets';
import AssetDetailsPage from './pages/AssetDetailsPage';
import RequestPage from './pages/RequestPage'; 
import SupportPage from './pages/supportpage.jsx';

import Nav from './components/Layout/Nav';
import { useAuth } from './context/AuthContext';

function Layout() {
  return (
    <>
      <Nav />
      <Outlet />
    </>
  );
}

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  return user?.role === 'admin' || user?.role === 'subadmin'
    ? children
    : <Navigate to="/" replace />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* PROTECTED + NAV */}
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Landing />} />
        <Route path="/branches" element={<Branch />} />
        <Route path="/branches/:id" element={<BranchDetails />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/assets/:id" element={<AssetDetailsPage />} />
        <Route path="/requests" element={<RequestPage />} />
        <Route path="/support" element={<SupportPage />} />


      </Route>

      {/* (optional) admin-only routes: wrap with <AdminRoute> if you add them */}

      {/* FALLBACK */}
      <Route
        path="*"
        element={<Navigate to={user ? '/' : '/login'} replace />}
      />
    </Routes>
  );
}
