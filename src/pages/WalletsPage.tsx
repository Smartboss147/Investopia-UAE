import React from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  MoreVertical,
  Search,
  CreditCard,
  Building2,
  Cpu,
  DollarSign
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';

const assets = [
  { name: 'Bitcoin', symbol: 'BTC', balance: '0.8420', value: '$54,280.50', change: '+2.4%', icon: Cpu, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { name: 'Ethereum', symbol: 'ETH', balance: '12.50', value: '$42,120.00', change: '-1.2%', icon: Cpu, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { name: 'Tether', symbol: 'USDT', balance: '25,480.00', value: '$25,480.00', change: '0.0%', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { name: 'Solana', symbol: 'SOL', balance: '145.20', value: '$20,680.00', change: '+5.8%', icon: Cpu, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
];

export const WalletsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Wallets</h1>
          <p className="text-gray-500">Manage your digital assets and connected accounts.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#D4FF3D] text-black px-6 py-3 rounded-xl font-black text-sm hover:bg-[#c2eb38] transition-all shadow-lg shadow-[#D4FF3D]/10 uppercase tracking-widest">
          <Plus size={18} /> Add New Wallet
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Cards Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-to-br from-[#131A2E] to-[#0A0F1E] text-white border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <CreditCard size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                  <p className="text-sm font-black text-[#D4FF3D] uppercase tracking-[0.2em]">Main Trading Balance</p>
                  <CreditCard size={24} />
                </div>
                <h2 className="text-4xl font-black mb-8 tracking-tighter font-mono">$142,480.20</h2>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] opacity-60 uppercase tracking-widest mb-1">Account Holder</p>
                    <p className="text-sm font-bold tracking-tight">GUEST TRADER</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] opacity-60 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-sm font-bold tracking-tight">VERIFIED</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/5 border-dashed border-2 border-white/10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/[0.08] transition-all group">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                <Plus size={24} />
              </div>
              <p className="font-bold text-sm text-gray-500 group-hover:text-gray-300">Connect External Account</p>
            </Card>
          </div>

          {/* Assets Table */}
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold">My Assets</h3>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Filter assets..." 
                  className="bg-white/5 border border-white/5 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/5">
                    <th className="px-6 py-4 font-bold">Asset</th>
                    <th className="px-6 py-4 font-bold">Balance</th>
                    <th className="px-6 py-4 font-bold">Value (USD)</th>
                    <th className="px-6 py-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {assets.map((asset, i) => (
                    <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", asset.bg, asset.color)}>
                            <asset.icon size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{asset.name}</p>
                            <p className="text-[10px] text-gray-500">{asset.symbol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">{asset.balance} {asset.symbol}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold">{asset.value}</p>
                          <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded",
                            asset.change.startsWith('+') ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                          )}>
                            {asset.change}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-gray-500 hover:text-white transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-2xl hover:bg-[#D4FF3D]/10 transition-all group">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowDownLeft size={20} />
                </div>
                <span className="text-xs font-bold">Deposit</span>
              </button>
              <button className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-2xl hover:bg-[#D4FF3D]/10 transition-all group">
                <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowUpRight size={20} />
                </div>
                <span className="text-xs font-bold">Withdraw</span>
              </button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-6">Connected Methods</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Chase Bank</p>
                    <p className="text-[10px] text-gray-500">**** 4290</p>
                  </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Visa Card</p>
                    <p className="text-[10px] text-gray-500">**** 1122</p>
                  </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
