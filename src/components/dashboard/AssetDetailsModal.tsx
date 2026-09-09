import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowUpRight, ArrowDownLeft, Zap, Shield, Info, Bell, Check } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { triggerHaptic } from '../../utils/haptic';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  icon: React.ReactNode;
  iconBg: string;
}

interface AssetDetailsModalProps {
  asset: Asset | null;
  onClose: () => void;
}

const generateChartData = (basePrice: number) => {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    price: basePrice * (1 + (Math.random() * 0.1 - 0.05)),
  }));
};

export const AssetDetailsModal: React.FC<AssetDetailsModalProps> = ({ asset, onClose }) => {
  const [isAlertMode, setIsAlertMode] = useState(false);
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [isSubmittingAlert, setIsSubmittingAlert] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);

  if (!asset) return null;

  const chartData = generateChartData(asset.price);
  const isPositive = asset.change24h >= 0;

  const handleSetAlert = async () => {
    if (!auth.currentUser || !targetPrice) return;
    triggerHaptic();
    setIsSubmittingAlert(true);

    try {
      const price = parseFloat(targetPrice);
      const condition = price > asset.price ? 'above' : 'below';

      await addDoc(collection(db, 'users', auth.currentUser.uid, 'price_alerts'), {
        userId: auth.currentUser.uid,
        symbol: asset.symbol,
        targetPrice: price,
        condition,
        isActive: true,
        createdAt: Date.now()
      });

      setAlertSuccess(true);
      setTimeout(() => {
        setIsAlertMode(false);
        setAlertSuccess(false);
        setTargetPrice('');
      }, 2000);
    } catch (error) {
      console.error('Error setting alert:', error);
      alert('Failed to set alert. Please try again.');
    } finally {
      setIsSubmittingAlert(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="relative w-full max-w-lg bg-[#0D1326] rounded-t-[32px] sm:rounded-[32px] overflow-hidden border-t sm:border border-white/10 shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xl",
                asset.iconBg
              )}>
                {asset.icon}
              </div>
              <div>
                <h2 className="text-xl font-black text-white">{asset.name}</h2>
                <span className="text-xs font-bold text-[#8A93A6] uppercase tracking-widest">{asset.symbol}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { triggerHaptic(); setIsAlertMode(!isAlertMode); }}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  isAlertMode ? "bg-[#D4FF3D] text-black" : "bg-white/5 text-white hover:bg-white/10"
                )}
              >
                <Bell size={20} />
              </button>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Alert Mode View */}
          <AnimatePresence mode="wait">
            {isAlertMode ? (
              <motion.div 
                key="alert"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="px-6 py-8"
              >
                {alertSuccess ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 rounded-full bg-[#D4FF3D]/20 flex items-center justify-center text-[#D4FF3D] mb-4">
                      <Check size={32} />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Alert Set!</h3>
                    <p className="text-sm text-gray-500 mt-2">We'll notify you when {asset.symbol} hits ${parseFloat(targetPrice).toLocaleString()}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-black text-white uppercase tracking-tight">Set Price Alert</h3>
                      <p className="text-xs text-gray-500 mt-1">Get notified when {asset.name} reaches your target</p>
                    </div>

                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">Target Price (USD)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-mono font-black text-[#D4FF3D]">$</span>
                        <input 
                          type="number"
                          value={targetPrice}
                          onChange={(e) => setTargetPrice(e.target.value)}
                          placeholder={asset.price.toString()}
                          className="w-full bg-black/20 border-none rounded-2xl py-4 pl-10 pr-4 text-2xl font-mono font-black text-white focus:ring-1 focus:ring-[#D4FF3D] transition-all"
                          autoFocus
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        <Info size={12} />
                        <span>Current: ${asset.price.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => setIsAlertMode(false)}
                        className="flex-1 bg-white/5 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-sm"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSetAlert}
                        disabled={!targetPrice || isSubmittingAlert}
                        className="flex-1 bg-[#D4FF3D] text-black font-black py-4 rounded-2xl uppercase tracking-widest text-sm shadow-xl shadow-[#D4FF3D]/10 disabled:opacity-50"
                      >
                        {isSubmittingAlert ? 'Setting...' : 'Set Alert'}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Price Info */}
                <div className="px-6 mb-8">
                  <div className="flex items-baseline gap-3 mb-2">
                    <h3 className="text-4xl font-black text-white font-mono tracking-tighter">
                      ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h3>
                    <div className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
                      isPositive ? "bg-[#3DDC84]/10 text-[#3DDC84]" : "bg-red-400/10 text-red-400"
                    )}>
                      {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                      {Math.abs(asset.change24h)}%
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-[#8A93A6] uppercase tracking-widest">Market Price • 24h Change</p>
                </div>

                {/* Chart Section */}
                <div className="h-64 w-full px-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isPositive ? "#3DDC84" : "#ff5a5a"} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={isPositive ? "#3DDC84" : "#ff5a5a"} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="time" hide />
                      <YAxis hide domain={['auto', 'auto']} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#131A2E', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#fff'
                        }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke={isPositive ? "#3DDC84" : "#ff5a5a"} 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Asset Stats */}
                <div className="grid grid-cols-2 gap-4 p-6 border-t border-white/5">
                  {[
                    { label: 'Market Cap', value: '$1.2T', icon: <Globe size={14} /> },
                    { label: 'Volume (24h)', value: '$45.2B', icon: <Zap size={14} /> },
                    { label: 'Circulating Supply', value: '19.7M BTC', icon: <Shield size={14} /> },
                    { label: 'All Time High', value: '$73,750.00', icon: <Info size={14} /> },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 p-4 rounded-2xl">
                      <div className="flex items-center gap-2 text-[#8A93A6] mb-1">
                        {stat.icon}
                        <span className="text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
                      </div>
                      <p className="text-sm font-black text-white font-mono">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="p-6 pt-0 flex gap-4">
                  <button className="flex-1 bg-[#D4FF3D] text-black font-black py-4 rounded-2xl uppercase tracking-widest text-sm transition-all active:scale-95">
                    Buy {asset.symbol}
                  </button>
                  <button className="flex-1 bg-white/5 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-sm transition-all active:scale-95 border border-white/10 hover:bg-white/10">
                    Trade
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const Globe = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
