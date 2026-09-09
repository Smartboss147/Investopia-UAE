import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft,
  Search,
  ChevronDown,
  Star,
  Activity,
  BarChart3,
  Clock
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';

const markets = [
  { pair: 'BTC/USDT', price: '64,280.50', change: '+2.4%', trend: 'up', volume: '1.2B' },
  { pair: 'ETH/USDT', price: '3,452.12', change: '-1.2%', trend: 'down', volume: '840M' },
  { pair: 'SOL/USDT', price: '142.85', change: '+5.8%', trend: 'up', volume: '420M' },
  { pair: 'ADA/USDT', price: '0.45', change: '-0.5%', trend: 'down', volume: '120M' },
  { pair: 'DOT/USDT', price: '7.24', change: '+1.5%', trend: 'up', volume: '95M' },
];

export const TradingPage: React.FC = () => {
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [selectedMarket, setSelectedMarket] = useState(markets[0]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
      {/* Market List */}
      <Card className="flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search markets..." 
              className="w-full bg-white/5 border border-white/5 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none"
            />
          </div>
        </div>
        <div className="flex-grow overflow-y-auto">
          {markets.map((m) => (
            <div 
              key={m.pair}
              onClick={() => setSelectedMarket(m)}
              className={cn(
                "p-4 flex items-center justify-between cursor-pointer transition-colors border-l-2",
                selectedMarket.pair === m.pair ? "bg-[#D4FF3D]/5 border-[#D4FF3D]" : "hover:bg-white/5 border-transparent"
              )}
            >
              <div>
                <p className="font-bold text-sm">{m.pair}</p>
                <p className="text-[10px] text-gray-500">Vol: {m.volume}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">${m.price}</p>
                <p className={cn(
                  "text-[10px] font-bold",
                  m.trend === 'up' ? "text-emerald-500" : "text-red-500"
                )}>{m.change}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Main Chart Section */}
      <div className="lg:col-span-2 space-y-6 flex flex-col">
        <Card className="p-4 flex items-center justify-between bg-[#0f0f0f]/50 backdrop-blur-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Star size={18} className="text-gray-500 cursor-pointer hover:text-yellow-500" />
              <h2 className="text-xl font-bold">{selectedMarket.pair}</h2>
            </div>
            <div className="hidden sm:flex gap-6 border-l border-white/10 pl-6">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Price</p>
                <p className={cn("font-bold", selectedMarket.trend === 'up' ? "text-emerald-500" : "text-red-500")}>
                  ${selectedMarket.price}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">24h Change</p>
                <p className={cn("font-bold", selectedMarket.trend === 'up' ? "text-emerald-500" : "text-red-500")}>
                  {selectedMarket.change}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {['1m', '5m', '15m', '1h', '4h', '1d'].map((t) => (
              <button key={t} className="px-2 py-1 text-[10px] font-bold text-gray-500 hover:text-white hover:bg-white/5 rounded">
                {t}
              </button>
            ))}
          </div>
        </Card>

        <Card className="flex-grow flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-500/5 to-purple-500/5">
          <div className="absolute inset-0 flex items-end">
            <div className="w-full h-[60%] opacity-20">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 L10 80 L20 85 L30 60 L40 70 L50 40 L60 50 L70 20 L80 30 L90 10 L100 20 L100 100 Z" fill="url(#gradient)" />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4FF3D" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          <BarChart3 size={64} className="text-[#D4FF3D]/20 mb-4 z-10" />
          <p className="text-gray-500 font-medium z-10">Advanced Trading View</p>
          <p className="text-gray-600 text-sm z-10">Select an asset to view historical price action</p>
        </Card>

        <div className="grid grid-cols-2 gap-6 h-48">
          <Card className="p-4 flex flex-col">
            <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 flex items-center gap-2">
              <Activity size={14} /> Order Book
            </h3>
            <div className="flex-grow space-y-1">
              {[64.281, 64.282, 64.283].map((p, i) => (
                <div key={i} className="flex justify-between text-[10px]">
                  <span className="text-red-400">{p.toFixed(3)}</span>
                  <span className="text-gray-500">{(Math.random() * 2).toFixed(4)}</span>
                </div>
              ))}
              <div className="py-2 text-center text-sm font-bold border-y border-white/5 my-1">
                ${selectedMarket.price}
              </div>
              {[64.279, 64.278, 64.277].map((p, i) => (
                <div key={i} className="flex justify-between text-[10px]">
                  <span className="text-emerald-400">{p.toFixed(3)}</span>
                  <span className="text-gray-500">{(Math.random() * 2).toFixed(4)}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-4 flex flex-col">
            <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 flex items-center gap-2">
              <Clock size={14} /> Market History
            </h3>
            <div className="flex-grow space-y-2 overflow-y-auto">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between text-[10px]">
                  <span className={cn(Math.random() > 0.5 ? "text-emerald-400" : "text-red-400")}>
                    ${(64280 + Math.random() * 10).toFixed(2)}
                  </span>
                  <span className="text-gray-600">{(Math.random() * 0.5).toFixed(4)} BTC</span>
                  <span className="text-gray-700">12:45:{10 + i}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Order Entry */}
      <Card className="p-6">
        <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-xl">
          <button 
            onClick={() => setOrderType('buy')}
            className={cn(
              "flex-1 py-2 rounded-lg font-bold text-sm transition-all",
              orderType === 'buy' ? "bg-emerald-500 text-white shadow-lg" : "text-gray-500 hover:text-white"
            )}
          >
            Buy
          </button>
          <button 
            onClick={() => setOrderType('sell')}
            className={cn(
              "flex-1 py-2 rounded-lg font-bold text-sm transition-all",
              orderType === 'sell' ? "bg-red-500 text-white shadow-lg" : "text-gray-500 hover:text-white"
            )}
          >
            Sell
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-medium text-gray-500">Price</label>
              <span className="text-xs font-bold text-white">USDT</span>
            </div>
            <input 
              type="text" 
              defaultValue={selectedMarket.price}
              className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4FF3D]"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-medium text-gray-500">Amount</label>
              <span className="text-xs font-bold text-white">BTC</span>
            </div>
            <input 
              type="text" 
              placeholder="0.00"
              className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4FF3D]"
            />
          </div>

          <div className="pt-4 space-y-4">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Available</span>
              <span className="font-bold">42,480.20 USDT</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Max Buy</span>
              <span className="font-bold">0.6582 BTC</span>
            </div>
          </div>

          <button className={cn(
            "w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]",
            orderType === 'buy' ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
          )}>
            {orderType === 'buy' ? 'Execute Buy' : 'Execute Sell'}
          </button>
        </div>
      </Card>
    </div>
  );
};
