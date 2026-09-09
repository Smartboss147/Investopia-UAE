import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Zap, 
  Layers, 
  ArrowDownCircle, 
  ArrowRightLeft,
  Coins, 
  Target, 
  Award,
  CircleDollarSign,
  BarChart3,
  Globe,
  Briefcase
} from 'lucide-react';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { ScrollGrid } from '../components/dashboard/ScrollGrid';
import { AssetList } from '../components/dashboard/AssetList';
import { BiometricOverlay } from '../components/dashboard/BiometricOverlay';
import { AllocationChart } from '../components/dashboard/AllocationChart';
import { AssetDetailsModal } from '../components/dashboard/AssetDetailsModal';
import { MarketNews } from '../components/dashboard/MarketNews';
import { useAuth } from '../components/AuthProvider';
import { triggerHaptic } from '../utils/haptic';

export const DashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Crypto');
  const [isLocked, setIsLocked] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);

  const handleTabSwitch = (tab: string) => {
    triggerHaptic();
    setActiveTab(tab);
  };

  const quickActions = [
    { id: 'ai', label: 'AI Arbitrage', icon: <Zap size={24} />, color: 'bg-purple-500/20 text-purple-400', path: '/app/trading' },
    { id: 'pool', label: 'Mining Pool', icon: <Layers size={24} />, color: 'bg-orange-500/20 text-orange-400', path: '/app/trading' },
    { id: 'deposit', label: 'Deposit', icon: <ArrowDownCircle size={24} />, color: 'bg-[#D4FF3D]/20 text-[#D4FF3D]', path: '/app/wallets' },
    { id: 'loans', label: 'Loans', icon: <Briefcase size={24} />, color: 'bg-blue-500/20 text-blue-400', path: '/app/wallets' },
    { id: 'compare', label: 'Compare', icon: <ArrowRightLeft size={24} />, color: 'bg-cyan-500/20 text-cyan-400', path: '/app/compare' },
    { id: 'copy', label: 'Copy Trading', icon: <Target size={24} />, color: 'bg-emerald-500/20 text-emerald-400', path: '/app/trading' },
    { id: 'staking', label: 'Staking', icon: <Coins size={24} />, color: 'bg-pink-500/20 text-pink-400', path: '/app/trading' },
    { id: 'rewards', label: 'Rewards', icon: <Award size={24} />, color: 'bg-yellow-500/20 text-yellow-400', path: '/app/transactions' },
  ];

  const categories = [
    { id: 'crypto', label: 'Crypto' },
    { id: 'gold', label: 'Gold' },
    { id: 'forex', label: 'Forex' },
    { id: 'stocks', label: 'Stocks' },
  ];

  const cryptoAssets = [
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', price: 64280.20, change24h: 2.45, icon: <CircleDollarSign size={20} />, iconBg: 'bg-orange-500' },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', price: 3450.15, change24h: -1.20, icon: <Layers size={20} />, iconBg: 'bg-blue-600' },
    { id: 'sol', name: 'Solana', symbol: 'SOL', price: 142.45, change24h: 8.32, icon: <Zap size={20} />, iconBg: 'bg-purple-500' },
    { id: 'bnb', name: 'Binance Coin', symbol: 'BNB', price: 580.90, change24h: 0.15, icon: <Award size={20} />, iconBg: 'bg-yellow-500' },
  ];

  const goldAssets = [
    { id: 'gold', name: 'Spot Gold', symbol: 'XAU', price: 2345.60, change24h: 0.45, icon: <BarChart3 size={20} />, iconBg: 'bg-yellow-600' },
    { id: 'silver', name: 'Spot Silver', symbol: 'XAG', price: 28.15, change24h: -2.30, icon: <BarChart3 size={20} />, iconBg: 'bg-gray-400' },
  ];

  const forexAssets = [
    { id: 'eurusd', name: 'EUR / USD', symbol: 'EUR', price: 1.0854, change24h: 0.12, icon: <Globe size={20} />, iconBg: 'bg-blue-500' },
    { id: 'gbpusd', name: 'GBP / USD', symbol: 'GBP', price: 1.2645, change24h: -0.05, icon: <Globe size={20} />, iconBg: 'bg-red-500' },
  ];

  const activeAssets = activeTab === 'Crypto' ? cryptoAssets : 
                       activeTab === 'Gold' ? goldAssets : 
                       activeTab === 'Forex' ? forexAssets : cryptoAssets;

  return (
    <>
      {isLocked && <BiometricOverlay onUnlock={() => setIsLocked(false)} />}
      
      <div className="space-y-8">
        {/* Balance Section */}
        <BalanceCard 
          balance={profile?.balance || 0} 
          currency={profile?.currency || 'USD'} 
          todayPnL={{ value: 1240.50, percentage: 2.45 }}
          onDeposit={() => navigate('/app/wallets')}
          onWithdraw={() => navigate('/app/transactions')}
        />

        {/* Allocation Chart */}
        <AllocationChart />

        {/* Market News */}
        <MarketNews />

        {/* Quick Actions */}
        <section>
          <h3 className="text-xs font-bold text-[#8A93A6] tracking-[0.2em] uppercase mb-4 px-1">Quick Actions</h3>
          <ScrollGrid 
            items={quickActions.map(action => ({
              ...action,
              onClick: () => navigate(action.path)
            }))} 
          />
        </section>

        {/* Markets Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-[#8A93A6] tracking-[0.2em] uppercase">Market</h3>
            <button className="text-[10px] font-bold text-[#D4FF3D] uppercase tracking-wider">See All</button>
          </div>

          <ScrollGrid 
            variant="pill"
            items={categories.map(cat => ({
              ...cat,
              active: activeTab === cat.label,
              onClick: () => handleTabSwitch(cat.label)
            }))} 
          />

          <div className="bg-[#131A2E]/50 rounded-[24px] p-6 border border-white/5">
            <p className="text-[10px] text-gray-600 mb-6 font-medium italic">Simulated Practice Market Data</p>
            <AssetList 
              assets={activeAssets} 
              onAssetClick={(asset) => setSelectedAsset(asset)}
            />
          </div>
        </section>
      </div>

      <AssetDetailsModal 
        asset={selectedAsset} 
        onClose={() => setSelectedAsset(null)} 
      />
    </>
  );
};
