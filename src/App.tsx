/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { Users } from './pages/Users';
import { Teams } from './pages/Teams';
import { Situations } from './pages/Situations';

const ProtectedRoute = ({ children, requireAdminOrManager }: { children: React.ReactNode, requireAdminOrManager?: boolean }) => {
  const { currentUser } = useAppContext();
  
  if (!currentUser) return <Navigate to="/login" replace />;
  if (requireAdminOrManager && currentUser.role === 'atendente') return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="situations" element={<Situations />} />
            <Route path="users" element={<ProtectedRoute requireAdminOrManager><Users /></ProtectedRoute>} />
            <Route path="teams" element={<ProtectedRoute requireAdminOrManager><Teams /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute requireAdminOrManager><Settings /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
