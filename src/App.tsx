/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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

export default function App() {
  return (
    <FeatureFlagProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          } />
          <Route path="/incidents" element={
            <DashboardLayout>
              <Incidents />
            </DashboardLayout>
          } />
          <Route path="/incidents/:id" element={
            <DashboardLayout>
              <IncidentBrief />
            </DashboardLayout>
          } />
          <Route path="/pending" element={
            <DashboardLayout>
              <PendingApproval />
            </DashboardLayout>
          } />
          <Route path="/repos" element={
            <DashboardLayout>
              <Repositories />
            </DashboardLayout>
          } />
          <Route path="/analytics" element={
            <DashboardLayout>
              <Analytics />
            </DashboardLayout>
          } />
          <Route path="/team" element={
            <DashboardLayout>
              <Team />
            </DashboardLayout>
          } />
          <Route path="/settings" element={
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          } />
          <Route path="/docs" element={
            <DashboardLayout>
              <Docs />
            </DashboardLayout>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </FeatureFlagProvider>
  );
}
