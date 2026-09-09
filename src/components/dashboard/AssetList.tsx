import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  icon: React.ReactNode;
  iconBg: string;
}

interface AssetListProps {
  assets: Asset[];
  onAssetClick?: (asset: Asset) => void;
}

export const AssetList: React.FC<AssetListProps> = ({ assets, onAssetClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-4">
      {/* Search Bar */}
      <div className="relative mb-2">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500">
          <Search size={16} />
        </div>
        <input
          type="text"
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0A0F1E] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#D4FF3D]/50 transition-colors"
        />
      </div>

      <div className="flex flex-col">
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset, i) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onAssetClick?.(asset)}
              className="flex items-center justify-between py-4 border-b border-white/5 cursor-pointer group active:bg-white/5 transition-colors px-2 -mx-2 rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg",
                  asset.iconBg
                )}>
                  {asset.icon}
                </div>
                <div>
                  <p className="text-sm font-black text-white group-hover:text-[#D4FF3D] transition-colors">{asset.name}</p>
                  <p className="text-[10px] font-bold text-[#8A93A6] tracking-wider uppercase">{asset.symbol}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-black text-white font-mono tracking-tighter">
                  ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className={cn(
                  "inline-block px-2 py-0.5 rounded-full mt-1",
                  asset.change24h >= 0 ? "bg-[#3DDC84]/10" : "bg-red-400/10"
                )}>
                  <p className={cn(
                    "text-[10px] font-black font-mono",
                    asset.change24h >= 0 ? "text-[#3DDC84]" : "text-red-400"
                  )}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-12 text-center">
            <p className="text-[#8A93A6] text-sm italic">No assets found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};
