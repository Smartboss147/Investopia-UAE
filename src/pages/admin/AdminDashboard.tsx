import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Activity, 
  ArrowUpRight, 
  Search,
  ChevronRight,
  ShieldAlert,
  History,
  Zap
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../components/AuthProvider';
import { cn } from '../../lib/utils';
import { UserProfile } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const idToken = await user?.getIdToken();
        const response = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.displayName && u.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = [
    { label: 'Total Users', value: users.length, icon: <Users size={20} />, color: 'text-blue-400' },
    { label: 'Active Balances', value: `$${users.reduce((acc, u) => acc + u.balance, 0).toLocaleString()}`, icon: <Activity size={20} />, color: 'text-[#D4FF3D]' },
    { label: 'Unverified', value: users.filter(u => u.status === 'unverified').length, icon: <ShieldAlert size={20} />, color: 'text-orange-400' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Admin Terminal</h1>
          <p className="text-gray-400 text-sm">System-wide user management and audit logs.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/admin/audit-logs')}
            className="flex items-center gap-2 bg-white/5 text-white px-4 py-2 rounded-xl text-xs font-bold border border-white/5 hover:bg-white/10 transition-all"
          >
            <History size={14} /> View Audit Logs
          </button>
          <button 
            onClick={() => navigate('/admin/tesla')}
            className="flex items-center gap-2 bg-[#D4FF3D] text-black px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-all"
          >
            <Zap size={14} /> Tesla Catalog
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 border-white/5 bg-[#131A2E]/50">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl bg-white/5", stat.color)}>
                {stat.icon}
              </div>
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-white font-mono">{stat.value}</h3>
          </Card>
        ))}
      </div>

      {/* User Search & Table */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Registered Users</h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input
              type="text"
              placeholder="Search by email or name..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#D4FF3D]/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card className="p-0 border-white/5 bg-[#131A2E]/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/20 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Balance</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-8 h-16 bg-white/[0.02]" />
                    </tr>
                  ))
                ) : filteredUsers.map((u) => (
                  <tr 
                    key={u.uid} 
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    onClick={() => navigate(`/admin/users/${u.uid}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#D4FF3D]/10 flex items-center justify-center text-[10px] font-black text-[#D4FF3D]">
                          {u.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white">{u.displayName || 'Unnamed'}</p>
                          <p className="text-[10px] text-gray-500 font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
                        u.status === 'active' ? "bg-emerald-500/10 text-emerald-400" : 
                        u.status === 'suspended' ? "bg-red-500/10 text-red-400" : "bg-orange-500/10 text-orange-400"
                      )}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-mono font-bold text-[#D4FF3D]">${u.balance.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight size={16} className="inline text-gray-600 group-hover:text-white transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
};
