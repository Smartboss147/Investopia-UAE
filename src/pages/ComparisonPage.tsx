import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  ArrowRightLeft, 
  TrendingUp, 
  BarChart3, 
  Layers,
  ChevronDown,
  Search,
  Zap,
  Globe,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { triggerHaptic } from '../utils/haptic';

const ASSETS = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', price: 64280.20, marketCap: 1250000000000, volume: 45200000000, change24h: 2.45, color: '#F7931A' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', price: 3450.15, marketCap: 410000000000, volume: 18500000000, change24h: -1.20, color: '#627EEA' },
  { id: 'sol', name: 'Solana', symbol: 'SOL', price: 142.45, marketCap: 64000000000, volume: 5200000000, change24h: 8.32, color: '#14F195' },
  { id: 'bnb', name: 'Binance Coin', symbol: 'BNB', price: 580.90, marketCap: 88000000000, volume: 1200000000, change24h: 0.15, color: '#F3BA2F' },
  { id: 'xrp', name: 'XRP', symbol: 'XRP', price: 0.54, marketCap: 30000000000, volume: 900000000, change24h: -0.45, color: '#23292F' },
];

const generateComparisonData = (asset1: typeof ASSETS[0], asset2: typeof ASSETS[0]) => {
  return Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    return {
      day: `Oct ${day}`,
      [asset1.symbol]: asset1.price * (1 + (Math.sin(day / 5) * 0.1 + Math.random() * 0.05)),
      [asset2.symbol]: asset2.price * (1 + (Math.cos(day / 5) * 0.1 + Math.random() * 0.05)),
    };
  });
};

export const ComparisonPage: React.FC = () => {
  const navigate = useNavigate();
  const [asset1, setAsset1] = useState(ASSETS[0]);
  const [asset2, setAsset2] = useState(ASSETS[1]);
  const [showSelector1, setShowSelector1] = useState(false);
  const [showSelector2, setShowSelector2] = useState(false);

  const chartData = useMemo(() => generateComparisonData(asset1, asset2), [asset1, asset2]);

  const AssetSelector = ({ selected, onSelect, onClose }: { selected: any, onSelect: (a: any) => void, onClose: () => void }) => (
    <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0D1326] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2">
      {ASSETS.map(asset => (
        <button
          key={asset.id}
          onClick={() => { triggerHaptic(); onSelect(asset); onClose(); }}
          className={cn(
            "w-full flex items-center justify-between p-3 rounded-xl transition-all",
            selected.id === asset.id ? "bg-[#D4FF3D] text-black" : "text-white hover:bg-white/5"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black">
              {asset.symbol}
            </div>
            <div className="text-left">
              <p className="text-xs font-black">{asset.name}</p>
              <p className="text-[10px] opacity-60 uppercase tracking-tighter">{asset.symbol}</p>
            </div>
          </div>
          <p className="text-xs font-mono font-bold">${asset.price.toLocaleString()}</p>
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">Market Comparison</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="relative">
          <button 
            onClick={() => setShowSelector1(!showSelector1)}
            className="w-full flex items-center justify-between p-6 bg-[#131A2E]/50 border border-white/5 rounded-[32px] hover:border-white/10 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#D4FF3D] font-black">
                {asset1.symbol}
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Asset One</p>
                <h3 className="text-xl font-black text-white">{asset1.name}</h3>
              </div>
            </div>
            <ChevronDown size={20} className="text-gray-500" />
          </button>
          {showSelector1 && <AssetSelector selected={asset1} onSelect={setAsset1} onClose={() => setShowSelector1(false)} />}
        </div>

        <div className="flex justify-center md:hidden">
          <div className="w-10 h-10 rounded-full bg-[#D4FF3D] text-black flex items-center justify-center shadow-xl shadow-[#D4FF3D]/20">
            <ArrowRightLeft size={20} />
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowSelector2(!showSelector2)}
            className="w-full flex items-center justify-between p-6 bg-[#131A2E]/50 border border-white/5 rounded-[32px] hover:border-white/10 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-blue-400 font-black">
                {asset2.symbol}
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Asset Two</p>
                <h3 className="text-xl font-black text-white">{asset2.name}</h3>
              </div>
            </div>
            <ChevronDown size={20} className="text-gray-500" />
          </button>
          {showSelector2 && <AssetSelector selected={asset2} onSelect={setAsset2} onClose={() => setShowSelector2(false)} />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Performance Chart */}
          <Card className="p-8 border-white/5 bg-[#131A2E]/50">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#D4FF3D]" />
                  Relative Performance
                </h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Unified Price Trend Analysis</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: asset1.color }} />
                  <span className="text-[10px] font-black text-white uppercase tracking-tighter">{asset1.symbol}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: asset2.color }} />
                  <span className="text-[10px] font-black text-white uppercase tracking-tighter">{asset2.symbol}</span>
                </div>
              </div>
            </div>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAsset1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={asset1.color} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={asset1.color} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAsset2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={asset2.color} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={asset2.color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0D1326', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      fontSize: '12px'
                    }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={asset1.symbol} 
                    stroke={asset1.color} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAsset1)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey={asset2.symbol} 
                    stroke={asset2.color} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAsset2)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Metric Comparison Table */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest px-1 flex items-center gap-2">
              <Layers size={14} />
              Side-by-Side Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Market Cap', val1: `$${(asset1.marketCap / 1e9).toFixed(1)}B`, val2: `$${(asset2.marketCap / 1e9).toFixed(1)}B`, icon: <Globe size={14} /> },
                { label: 'Trading Volume', val1: `$${(asset1.volume / 1e9).toFixed(1)}B`, val2: `$${(asset2.volume / 1e9).toFixed(1)}B`, icon: <BarChart3 size={14} /> },
                { label: '24h Change', val1: `${asset1.change24h}%`, val2: `${asset2.change24h}%`, icon: <TrendingUp size={14} />, isChange: true },
              ].map((metric, i) => (
                <Card key={i} className="p-6 border-white/5 bg-[#131A2E]/50">
                  <div className="flex items-center gap-2 text-gray-500 mb-4">
                    {metric.icon}
                    <span className="text-[10px] font-bold uppercase tracking-widest">{metric.label}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-white/40 uppercase">{asset1.symbol}</span>
                      <span className={cn(
                        "text-sm font-black font-mono",
                        metric.isChange && (asset1.change24h >= 0 ? "text-emerald-400" : "text-red-400")
                      )}>{metric.val1}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#D4FF3D]/50" style={{ width: '60%' }} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-white/40 uppercase">{asset2.symbol}</span>
                      <span className={cn(
                        "text-sm font-black font-mono",
                        metric.isChange && (asset2.change24h >= 0 ? "text-emerald-400" : "text-red-400")
                      )}>{metric.val2}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500/50" style={{ width: '40%' }} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <Card className="p-6 border-white/5 bg-[#D4FF3D]/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap size={64} />
            </div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight mb-2">Alpha Insights</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Based on the current 30-day correlation, {asset1.symbol} shows {Math.abs(asset1.change24h - asset2.change24h).toFixed(1)}% higher volatility than {asset2.symbol}. {asset1.symbol}'s market cap is {(asset1.marketCap / asset2.marketCap).toFixed(1)}x larger, suggesting lower systemic risk but potentially lower upside during bull runs.
            </p>
          </Card>

          <Card className="p-6 border-white/5 bg-[#131A2E]/50">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Correlation Score</h4>
            <div className="flex flex-col items-center text-center py-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                  <circle cx="64" cy="64" r="58" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="364" strokeDashoffset="120" className="text-[#D4FF3D]" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white font-mono">0.68</span>
                  <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Moderate</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 mt-6 leading-relaxed">
                A correlation of 0.68 indicates these assets frequently move in the same direction but maintain distinct risk profiles.
              </p>
            </div>
          </Card>

          <button className="w-full bg-white/5 border border-white/10 text-white font-black py-4 rounded-[24px] uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
            <Search size={14} /> Analyze More Pairs
          </button>
        </div>
      </div>
    </div>
  );
};
