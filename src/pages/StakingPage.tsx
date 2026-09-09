import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Shield, 
  ArrowUpRight, 
  TrendingUp, 
  Lock, 
  Clock, 
  Info,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';
import { triggerHaptic } from '../utils/haptic';
import { useTheme } from '../context/ThemeContext';

interface StakedAsset {
  id: string;
  asset: string;
  symbol: string;
  amount: string;
  value: string;
  apy: number;
  earned: string;
  duration: string;
  status: 'Active' | 'Locked' | 'Unlocking';
  icon: string;
  color: string;
}

const stakedAssets: StakedAsset[] = [
  { 
    id: '1', 
    asset: 'Ethereum', 
    symbol: 'ETH', 
    amount: '4.50 ETH', 
    value: '$11,250.00', 
    apy: 4.2, 
    earned: '0.12 ETH', 
    duration: '60 Days', 
    status: 'Active', 
    icon: '⟠', 
    color: 'bg-blue-500' 
  },
  { 
    id: '2', 
    asset: 'Solana', 
    symbol: 'SOL', 
    amount: '120 SOL', 
    value: '$15,600.00', 
    apy: 7.5, 
    earned: '4.2 SOL', 
    duration: '30 Days', 
    status: 'Locked', 
    icon: 'S', 
    color: 'bg-purple-500' 
  },
  { 
    id: '3', 
    asset: 'Polkadot', 
    symbol: 'DOT', 
    amount: '500 DOT', 
    value: '$2,450.00', 
    apy: 12.0, 
    earned: '12.5 DOT', 
    duration: '90 Days', 
    status: 'Active', 
    icon: 'P', 
    color: 'bg-pink-500' 
  },
];

export const StakingPage: React.FC = () => {
  const { theme } = useTheme();

  const totalStaked = 29300.00;
  const totalEarned = 842.50;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={cn(
            "text-3xl font-black mb-2",
            theme === 'dark' ? "text-white" : "text-[#0A0F1E]"
          )}>Staking</h1>
          <p className="text-[#8A93A6] text-sm">Earn passive rewards on your digital assets.</p>
        </div>
        <button 
          onClick={() => triggerHaptic()}
          className="flex items-center justify-center gap-2 bg-[#D4FF3D] text-black px-6 py-3 rounded-2xl font-black text-sm hover:bg-[#c2eb38] transition-all shadow-lg shadow-[#D4FF3D]/10 uppercase tracking-widest active:scale-95"
        >
          <Plus size={18} /> New Stake
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-[#131A2E] to-[#0A0F1E] border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Lock size={120} className="text-white" />
          </div>
          <p className="text-[10px] font-black text-[#D4FF3D] uppercase tracking-[0.2em] mb-4">Total Value Staked</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black text-white font-mono tracking-tighter">
              ${totalStaked.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <span className="text-xs font-bold text-[#3DDC84] flex items-center gap-1">
              <TrendingUp size={14} /> +12.4%
            </span>
          </div>
        </Card>

        <Card className="p-6 bg-white/5 border-white/5">
          <p className="text-[10px] font-black text-[#8A93A6] uppercase tracking-[0.2em] mb-4">Total Rewards Earned</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black text-white font-mono tracking-tighter">
              ${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <span className="text-xs font-bold text-[#8A93A6]">Life-to-date</span>
          </div>
        </Card>
      </div>

      {/* Active Stakes */}
      <section className="space-y-4">
        <h3 className="px-1 text-[10px] font-black text-[#8A93A6] uppercase tracking-[0.2em]">Active Stakes</h3>
        <div className="space-y-4">
          {stakedAssets.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => triggerHaptic()}
              className={cn(
                "p-5 rounded-[24px] border transition-all cursor-pointer group active:scale-[0.98]",
                theme === 'dark' ? "bg-[#131A2E]/50 border-white/5 hover:border-[#D4FF3D]/30" : "bg-white border-black/5 shadow-sm hover:border-[#D4FF3D]"
              )}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-lg",
                    item.color
                  )}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className={cn(
                      "text-lg font-black",
                      theme === 'dark' ? "text-white" : "text-[#0A0F1E]"
                    )}>{item.asset}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#8A93A6] uppercase tracking-widest">{item.symbol}</span>
                      <div className={cn(
                        "w-1 h-1 rounded-full bg-gray-600"
                      )} />
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        item.status === 'Active' ? "text-[#3DDC84]" : "text-orange-400"
                      )}>{item.status}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-[#3DDC84] bg-[#3DDC84]/10 px-3 py-1 rounded-full">
                    {item.apy}% APY
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-4 border-t border-white/5">
                <div>
                  <p className="text-[10px] font-bold text-[#8A93A6] uppercase tracking-wider mb-1">Staked Amount</p>
                  <p className={cn("text-sm font-black font-mono", theme === 'dark' ? "text-white" : "text-[#0A0F1E]")}>{item.amount}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#8A93A6] uppercase tracking-wider mb-1">Earned Rewards</p>
                  <p className="text-sm font-black text-[#3DDC84] font-mono">+{item.earned}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#8A93A6] uppercase tracking-wider mb-1">Time Remaining</p>
                  <p className={cn("text-sm font-black font-mono", theme === 'dark' ? "text-white" : "text-[#0A0F1E]")}>{item.duration}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-br from-[#D4FF3D]/5 to-transparent border-[#D4FF3D]/10">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-[#D4FF3D]/10 text-[#D4FF3D] flex items-center justify-center flex-shrink-0">
            <Info size={20} />
          </div>
          <div>
            <h4 className={cn("text-sm font-black mb-2", theme === 'dark' ? "text-white" : "text-[#0A0F1E]")}>Understanding APY</h4>
            <p className="text-xs text-[#8A93A6] leading-relaxed">
              Annual Percentage Yield (APY) represents the projected return on your staked assets over a 12-month period. All rewards are compounded daily and paid out directly to your staking wallet.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
