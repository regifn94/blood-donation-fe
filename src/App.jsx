/**
 * App.jsx
 * Main Application Component with Routing
 * src/App.jsx
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import PendonorDashboard from './pages/PendonorDashboard';
import apiService from './services/api';

// ==================== Protected Route Component ====================
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const isAuthenticated = apiService.auth.isAuthenticated();
  const userRole = apiService.auth.getUserRole();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// ==================== Public Route Component ====================
// Redirect to dashboard if already logged in
const PublicRoute = ({ children }) => {
  const isAuthenticated = apiService.auth.isAuthenticated();
  const userRole = apiService.auth.getUserRole();

  if (isAuthenticated) {
    // Redirect based on role
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === 'pendonor') {
      return <Navigate to="/pendonor/dashboard" replace />;
    } else if (userRole === 'pemohon') {
      return <Navigate to="/pemohon/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ==================== Placeholder Dashboard Components ====================
// Temporary placeholders - replace with actual components later

// const PendonorDashboard = () => (
//   <div className="min-h-screen bg-gray-100 p-8">
//     <div className="max-w-7xl mx-auto">
//       <h1 className="text-3xl font-bold text-gray-900 mb-4">Pendonor Dashboard</h1>
//       <div className="bg-white rounded-lg shadow p-6">
//         <p className="text-gray-600">Welcome to Pendonor Dashboard</p>
//         <button
//           onClick={() => {
//             apiService.auth.logout();
//             window.location.href = '/login';
//           }}
//           className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
//         >
//           Logout
//         </button>
//       </div>
//     </div>
//   </div>
// );

const PemohonDashboard = () => (
  <div className="min-h-screen bg-gray-100 p-8">
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Pemohon Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Welcome to Pemohon Dashboard</p>
        <button
          onClick={() => {
            apiService.auth.logout();
            window.location.href = '/login';
          }}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
);

const UnauthorizedPage = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Unauthorized</h2>
      <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
      <button
        onClick={() => {
          apiService.auth.logout();
          window.location.href = '/login';
        }}
        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Back to Login
      </button>
    </div>
  </div>
);

const NotFoundPage = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
      <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
      <a
        href="/"
        className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Go Home
      </a>
    </div>
  </div>
);

// ==================== Main App Component ====================
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes - Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Pendonor */}
        <Route
          path="/pendonor/dashboard"
          element={
            <ProtectedRoute requiredRole="pendonor">
              <PendonorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Pemohon */}
        {/* <Route
          path="/pendonor/dashboard"
          element={
            <ProtectedRoute requiredRole="pemohon">
              <PendonorDashboard />
            </ProtectedRoute>
          }
        /> */}

        {/* Generic Dashboard (fallback) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-7xl mx-auto">
                  <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Unauthorized Page */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Root - Redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;