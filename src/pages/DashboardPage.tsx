import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Zap, 
  Car,
  Layers, 
  ArrowDownCircle, 
  ArrowRightLeft,
  Coins, 
  Target, 
  Award,
  CircleDollarSign,
  BarChart3,
  Globe,
  Briefcase,
  Package
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
import { isAdminEmail } from '../utils/admin';

export const DashboardPage: React.FC = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAdminEmail(user?.email)) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);
  const [activeTab, setActiveTab] = useState('Crypto');
  const [isLocked, setIsLocked] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);

  const handleTabSwitch = (tab: string) => {
    triggerHaptic();
    setActiveTab(tab);
  };

  const quickActions = [
    { id: 'tesla', label: 'Tesla Shop', icon: <Car size={24} />, color: 'bg-red-500/20 text-red-400', path: '/app/tesla' },
    { id: 'orders', label: 'My Orders', icon: <Package size={24} />, color: 'bg-indigo-500/20 text-indigo-400', path: '/app/orders' },
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
        {/* Balance & Tesla Promo Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BalanceCard 
              balance={profile?.balance || 0} 
              currency={profile?.currency || 'USD'} 
              todayPnL={{ value: 1240.50, percentage: 2.45 }}
              onDeposit={() => navigate('/app/wallets')}
              onWithdraw={() => navigate('/app/transactions')}
            />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate('/app/tesla')}
              className="bg-[#131A2E] rounded-[24px] overflow-hidden border border-white/5 relative group cursor-pointer h-full min-h-[140px]"
            >
              <img 
                src="https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&q=80&w=800" 
                alt="Tesla Model S" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-transparent to-transparent flex flex-col justify-end p-5">
                <span className="text-[#D4FF3D] text-[8px] font-black uppercase tracking-[0.2em] mb-1">Premium Sedan</span>
                <h4 className="text-white text-xs font-black uppercase tracking-widest">Model S</h4>
              </div>
              <div className="absolute top-4 right-4 bg-[#D4FF3D] text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Car size={14} />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => navigate('/app/tesla')}
              className="bg-[#131A2E] rounded-[24px] overflow-hidden border border-white/5 relative group cursor-pointer h-full min-h-[140px]"
            >
              <img 
                src="https://images.unsplash.com/photo-1662010021854-e67c538ea7a9?auto=format&fit=crop&q=80&w=800" 
                alt="Tesla Cybertruck" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-transparent to-transparent flex flex-col justify-end p-5">
                <span className="text-[#D4FF3D] text-[8px] font-black uppercase tracking-[0.2em] mb-1">Futuristic Utility</span>
                <h4 className="text-white text-xs font-black uppercase tracking-widest">Cybertruck</h4>
              </div>
              <div className="absolute top-4 right-4 bg-[#D4FF3D] text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Zap size={14} />
              </div>
            </motion.div>
          </div>
        </div>

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
