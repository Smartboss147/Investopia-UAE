import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Download,
  Filter,
  ArrowRightLeft,
  ShoppingBag,
  CreditCard,
  MoreHorizontal,
  FileText
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { triggerHaptic } from '../utils/haptic';

const transactions = [
  { id: 'TX-4920', type: 'Buy', asset: 'Bitcoin', amount: '0.045 BTC', value: '$2,840.50', status: 'Completed', date: 'Oct 24, 2023', icon: ShoppingBag, color: 'text-emerald-500' },
  { id: 'TX-4919', type: 'Transfer', asset: 'Ethereum', amount: '1.20 ETH', value: '$2,450.00', status: 'Pending', date: 'Oct 23, 2023', icon: ArrowRightLeft, color: 'text-blue-500' },
  { id: 'TX-4918', type: 'Deposit', asset: 'USDT', amount: '5,000 USDT', value: '$5,000.00', status: 'Completed', date: 'Oct 21, 2023', icon: CreditCard, color: 'text-emerald-500' },
  { id: 'TX-4917', type: 'Sell', asset: 'Solana', amount: '25 SOL', value: '$3,200.00', status: 'Completed', date: 'Oct 20, 2023', icon: ShoppingBag, color: 'text-red-500' },
  { id: 'TX-4916', type: 'Withdraw', asset: 'USDT', amount: '1,500 USDT', value: '$1,500.00', status: 'Failed', date: 'Oct 19, 2023', icon: CreditCard, color: 'text-red-500' },
];

export const TransactionsPage: React.FC = () => {
  const downloadStatement = () => {
    triggerHaptic();
    const doc = new jsPDF();
    
    // Add Branding
    doc.setFontSize(22);
    doc.setTextColor(20, 30, 60);
    doc.text('INVESTOPIA', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('GLOBAL INVESTMENT PLATFORM', 14, 28);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 34);
    
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('Account Statement', 14, 48);
    
    const tableData = transactions.map(tx => [
      tx.id,
      tx.date,
      tx.type,
      tx.asset,
      tx.amount,
      tx.value,
      tx.status
    ]);
    
    (doc as any).autoTable({
      startY: 54,
      head: [['TX ID', 'Date', 'Type', 'Asset', 'Amount', 'Value', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [20, 30, 60], textColor: [255, 255, 255] },
      styles: { fontSize: 8 },
    });
    
    doc.save(`investopia_statement_${new Date().getTime()}.pdf`);
  };

  const exportCSV = () => {
    triggerHaptic();
    const headers = ['TX ID', 'Date', 'Type', 'Asset', 'Amount', 'Value', 'Status'];
    const rows = transactions.map(tx => [
      tx.id,
      tx.date,
      tx.type,
      tx.asset,
      tx.amount.replace(/,/g, ''),
      tx.value.replace(/[$,]/g, ''),
      tx.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `investopia_transactions_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transactions</h1>
          <p className="text-gray-500">History of all your trades, transfers, and account activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={downloadStatement}
            className="flex items-center gap-2 bg-white/5 text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-white/10 transition-all border border-white/5"
          >
            <FileText size={14} /> PDF
          </button>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 bg-white/5 text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-white/10 transition-all border border-white/5"
          >
            <Download size={14} /> CSV
          </button>
          <button className="flex items-center gap-2 bg-[#D4FF3D] text-black px-4 py-2.5 rounded-xl font-black text-xs hover:bg-[#c2eb38] transition-all shadow-lg shadow-[#D4FF3D]/10 uppercase tracking-widest">
            <Filter size={14} /> Filters
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-4">
            {['All', 'Buy', 'Sell', 'Transfers'].map((tab) => (
              <button 
                key={tab} 
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                  tab === 'All' ? "bg-[#D4FF3D] text-black" : "text-gray-500 hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search TX ID, asset..." 
              className="w-full sm:w-64 bg-white/5 border border-white/5 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#D4FF3D]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/5">
                <th className="px-6 py-4 font-bold">Transaction</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Amount</th>
                <th className="px-6 py-4 font-bold">Value (USD)</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((tx, i) => (
                <motion.tr 
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center bg-white/5",
                        tx.color
                      )}>
                        <tx.icon size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{tx.type} {tx.asset}</p>
                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">{tx.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-400">{tx.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold tracking-tight">{tx.amount}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">{tx.value}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        tx.status === 'Completed' ? "bg-emerald-500" : 
                        tx.status === 'Pending' ? "bg-orange-500" : "bg-red-500"
                      )} />
                      <p className={cn(
                        "text-xs font-bold",
                        tx.status === 'Completed' ? "text-emerald-500" : 
                        tx.status === 'Pending' ? "text-orange-500" : "text-red-500"
                      )}>{tx.status}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-500 hover:text-white transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-white/5 flex items-center justify-between">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Showing 5 of 142 transactions</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-white/5 text-gray-500 rounded-lg text-[10px] font-bold disabled:opacity-30" disabled>Previous</button>
            <button className="px-3 py-1 bg-white/10 text-white rounded-lg text-[10px] font-bold">Next</button>
          </div>
        </div>
      </Card>
    </div>
  );
};
