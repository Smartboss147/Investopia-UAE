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
import { ThemeProvider } from './context/ThemeContext';

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

          {/* Trading App (CoinFlow) */}
          <Route 
            path="/app/*" 
            element={
              <DashboardLayout>
                <Routes>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="wallets" element={<WalletsPage />} />
                  <Route path="transactions" element={<TransactionsPage />} />
                  <Route path="staking" element={<StakingPage />} />
                  <Route path="trading" element={<TradingPage />} />
                  <Route path="transfers" element={<TransactionsPage />} /> {/* Stub */}
                  <Route path="settings" element={<ProfilePage />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </DashboardLayout>
            } 
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}



