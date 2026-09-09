import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BalanceCardProps {
  balance: number;
  currency: string;
  todayPnL: {
    value: number;
    percentage: number;
  };
  onDeposit: () => void;
  onWithdraw: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ 
  balance, 
  currency, 
  todayPnL,
  onDeposit,
  onWithdraw
}) => {
  const [showBalance, setShowBalance] = useState(true);

  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(balance);

  const isPositive = todayPnL.value >= 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#131A2E] rounded-[24px] p-6 border border-white/5 shadow-2xl relative overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4FF3D]/5 blur-3xl -mr-16 -mt-16" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold text-[#8A93A6] tracking-[0.2em] uppercase">Total Balance</span>
          <button 
            onClick={() => setShowBalance(!showBalance)}
            className="text-[#8A93A6] hover:text-white transition-colors"
          >
            {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-4xl font-black text-white tracking-tight font-mono">
            {showBalance ? formattedBalance : '••••••'}
          </h2>
        </div>

        <div className="flex items-center gap-2 mb-8">
          <span className="text-xs text-[#8A93A6]">Today's P&L</span>
          <span className={cn(
            "text-xs font-bold font-mono",
            isPositive ? "text-[#3DDC84]" : "text-red-400"
          )}>
            {isPositive ? '+' : ''}{todayPnL.value.toFixed(2)} ({isPositive ? '+' : ''}{todayPnL.percentage.toFixed(2)}%)
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onDeposit}
            className="w-full bg-[#D4FF3D] hover:bg-[#c2eb38] text-black font-black py-4 rounded-full flex items-center justify-center gap-3 transition-all active:scale-[0.98] uppercase tracking-widest text-sm"
          >
            <ArrowDown size={18} strokeWidth={3} />
            Deposit
          </button>
          <button 
            onClick={onWithdraw}
            className="w-full bg-transparent border border-white/10 hover:bg-white/5 text-white font-black py-4 rounded-full flex items-center justify-center gap-3 transition-all active:scale-[0.98] uppercase tracking-widest text-sm"
          >
            <ArrowUp size={18} strokeWidth={3} />
            Withdraw
          </button>
        </div>
      </div>
    </motion.div>
  );
};
