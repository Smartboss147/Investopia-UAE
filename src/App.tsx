/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { InvestHomePage } from './pages/InvestHomePage';
import { AboutPage, EventsPage, KnowledgePage } from './pages/InvestSubPages';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { WalletsPage } from './pages/WalletsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { TradingPage } from './pages/TradingPage';
import { ProfilePage } from './pages/ProfilePage';
import { StakingPage } from './pages/StakingPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { TeslaMarketplacePage } from './pages/TeslaMarketplacePage';
import { ThemeProvider } from './context/ThemeContext';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUserDetails } from './pages/admin/AdminUserDetails';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { AdminTeslaProducts } from './pages/admin/AdminTeslaProducts';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Frontier (Investopia) */}
          <Route path="/" element={<InvestHomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="/initiatives" element={<AboutPage />} />
          <Route path="/reports" element={<KnowledgePage />} />
          <Route path="/contact" element={<AboutPage />} />

          <Route path="/login" element={<LoginPage />} />

          {/* Trading App (CoinFlow) */}
          <Route 
            path="/app/*" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="wallets" element={<WalletsPage />} />
                    <Route path="transactions" element={<TransactionsPage />} />
                    <Route path="staking" element={<StakingPage />} />
                    <Route path="trading" element={<TradingPage />} />
                    <Route path="compare" element={<ComparisonPage />} />
                    <Route path="tesla" element={<TeslaMarketplacePage />} />
                    <Route path="transfers" element={<TransactionsPage />} /> {/* Stub */}
                    <Route path="settings" element={<ProfilePage />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/*" 
            element={
              <AdminProtectedRoute>
                <div className="min-h-screen bg-[#0A0F1E] p-4 md:p-8">
                  <div className="max-w-7xl mx-auto">
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="tesla" element={<AdminTeslaProducts />} />
                      <Route path="users/:id" element={<AdminUserDetails />} />
                      <Route path="audit-logs" element={<AdminAuditLogs />} />
                      <Route path="*" element={<Navigate to="/admin" replace />} />
                    </Routes>
                  </div>
                </div>
              </AdminProtectedRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}



