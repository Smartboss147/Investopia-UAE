import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  History, 
  Search,
  Filter,
  User,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../components/AuthProvider';
import { cn } from '../../lib/utils';
import { AuditLogEntry } from '../../types';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        
        const snapshot = await getDocs(collection(db, 'admin_audit_logs'));
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setLogs(list);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.targetEmail.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin')}
            className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-white transition-colors border border-white/5"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Audit Logs</h1>
            <p className="text-gray-400 text-sm">Immutable record of all administrative actions.</p>
          </div>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input
            type="text"
            placeholder="Filter by admin, user, or reason..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#D4FF3D]/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="h-24 animate-pulse bg-white/[0.02] border-white/5" />
          ))
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-20 text-gray-500 italic">No audit logs found.</div>
        ) : filteredLogs.map((log) => (
          <Card key={log.id} className="p-0 border-white/5 bg-[#131A2E]/50 overflow-hidden group">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4FF3D]/10 flex items-center justify-center text-[#D4FF3D] border border-[#D4FF3D]/10">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Admin Action</span>
                      <div className="w-1 h-1 rounded-full bg-gray-700" />
                      <span className="text-[10px] font-black text-[#D4FF3D] uppercase tracking-widest">
                        {log.adjustmentType}
                      </span>
                    </div>
                    <p className="text-sm font-black text-white">
                      Balance adjusted for <span className="text-[#D4FF3D]">{log.targetEmail}</span>
                    </p>
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <div className="flex items-center md:justify-end gap-2 text-gray-500 mb-1">
                    <Calendar size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white">By: {log.adminEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4 bg-black/20 rounded-2xl border border-white/5">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Adjustment</p>
                  <p className={cn(
                    "text-sm font-black font-mono",
                    log.adjustmentType === 'credit' ? "text-emerald-400" : "text-red-400"
                  )}>
                    {log.adjustmentType === 'credit' ? '+' : '-'}${log.adjustmentAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Resulting Balance</p>
                  <p className="text-sm font-black text-[#D4FF3D] font-mono">${log.newBalance.toLocaleString()}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Reason & Reference</p>
                  <p className="text-xs text-white line-clamp-1">{log.reason}</p>
                  <p className="text-[10px] text-gray-500 font-medium">Ref: {log.internalReference}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
