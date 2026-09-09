import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Bitcoin', value: 45, color: '#F7931A' },
  { name: 'Ethereum', value: 30, color: '#627EEA' },
  { name: 'Solana', value: 15, color: '#14F195' },
  { name: 'Others', value: 10, color: '#8A93A6' },
];

export const AllocationChart: React.FC = () => {
  return (
    <div className="bg-[#131A2E] rounded-[24px] p-6 border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold text-[#8A93A6] tracking-[0.2em] uppercase">Asset Allocation</h3>
        <span className="text-[10px] font-bold text-[#3DDC84] bg-[#3DDC84]/10 px-2 py-0.5 rounded-full uppercase">Balanced</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#131A2E', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#fff'
                }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-grow space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] font-medium text-[#8A93A6]">{item.name}</span>
              </div>
              <span className="text-[10px] font-black text-white font-mono">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
