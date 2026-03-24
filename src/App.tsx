/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { FeatureFlagProvider } from "./contexts/FeatureFlagContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Incidents from "./pages/Incidents";
import PendingApproval from "./pages/PendingApproval";
import Repositories from "./pages/Repositories";
import Analytics from "./pages/Analytics";
import Team from "./pages/Team";
import Docs from "./pages/Docs";
import IncidentBrief from "./pages/IncidentBrief";
import Settings from "./pages/Settings";
import DashboardLayout from "./layouts/DashboardLayout";
import { getAuthToken } from "./lib/api";

function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const token = getAuthToken();
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

function PublicAuthOnly({ children }: { children: ReactNode }) {
  const token = getAuthToken();
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <FeatureFlagProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route
            path="/login"
            element={
              <PublicAuthOnly>
                <Auth />
              </PublicAuthOnly>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicAuthOnly>
                <Auth />
              </PublicAuthOnly>
            }
          />
          
          {/* Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/incidents"
            element={
              <RequireAuth>
                <DashboardLayout>
                  <Incidents />
                </DashboardLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/incidents/:id"
            element={
              <RequireAuth>
                <DashboardLayout>
                  <IncidentBrief />
                </DashboardLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/pending"
            element={
              <RequireAuth>
                <DashboardLayout>
                  <PendingApproval />
                </DashboardLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/repos"
            element={
              <RequireAuth>
                <DashboardLayout>
                  <Repositories />
                </DashboardLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/analytics"
            element={
              <RequireAuth>
                <DashboardLayout>
                  <Analytics />
                </DashboardLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/team"
            element={
              <RequireAuth>
                <DashboardLayout>
                  <Team />
                </DashboardLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </RequireAuth>
            }
          />
          <Route
            path="/docs"
            element={
              <RequireAuth>
                <DashboardLayout>
                  <Docs />
                </DashboardLayout>
              </RequireAuth>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </FeatureFlagProvider>
  );
}
