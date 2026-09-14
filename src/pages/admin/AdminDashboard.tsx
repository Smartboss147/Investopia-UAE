import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Activity, 
  Search, 
  ChevronRight, 
  ShieldAlert, 
  History, 
  LogOut, 
  ArrowLeft 
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../components/AuthProvider';
import { cn } from '../../lib/utils';
import { UserProfile } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupUserListener = async () => {
      try {
        const { collection, onSnapshot } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        
        const usersRef = collection(db, 'users');
        
        unsubscribe = onSnapshot(usersRef, (snapshot) => {
          const list: UserProfile[] = snapshot.docs.map(doc => {
            const d = doc.data();
            return {
              uid: doc.id,
              email: d.email || '',
              displayName: d.displayName || d.name || d.email?.split('@')[0] || 'User',
              balance: typeof d.balance === 'number' ? d.balance : (parseFloat(d.balance) || 0),
              currency: d.currency || 'USD',
              status: d.status || 'active',
              createdAt: typeof d.createdAt === 'number' ? d.createdAt : (new Date(d.createdAt || Date.now()).getTime() || Date.now())
            } as UserProfile;
          });

          // Sort by creation date descending
          list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setUsers(list);
          setLoading(false);
        }, (error) => {
          console.warn('Firestore snapshot error:', error);
          setUsers([]);
          setLoading(false);
        });

      } catch (err) {
        console.error('Setup user listener error:', err);
        setUsers([]);
        setLoading(false);
      }
    };

    setupUserListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.displayName && u.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = [
    { label: 'Total Registered Users', value: users.length, icon: <Users size={20} />, color: 'text-blue-400' },
    { label: 'Cumulative Balances', value: `$${users.reduce((acc, u) => acc + (Number(u.balance) || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <Activity size={20} />, color: 'text-[#D4FF3D]' },
    { label: 'Unverified Accounts', value: users.filter(u => u.status === 'unverified').length, icon: <ShieldAlert size={20} />, color: 'text-orange-400' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-white tracking-tight">Admin Terminal</h1>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Master Root Active
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1.5">
            <p className="text-gray-400 text-sm">
              Logged in as <span className="text-[#D4FF3D] font-mono font-bold">{user?.email || 'admin'}</span> (Master Admin)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={() => navigate('/admin/audit-logs')}
            id="admin-audit-logs-btn"
            className="flex items-center gap-2 bg-white/5 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold border border-white/10 hover:bg-white/10 transition-all"
          >
            <History size={14} /> Audit Logs
          </button>

          <button 
            onClick={() => navigate('/app/dashboard')}
            id="admin-exit-app-btn"
            className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-blue-500/20 hover:bg-blue-500/20 hover:text-white transition-all"
            title="Return to User Dashboard"
          >
            <ArrowLeft size={14} /> User App
          </button>

          <button 
            onClick={handleLogout}
            id="admin-logout-btn"
            className="flex items-center gap-2 bg-rose-500/10 text-rose-400 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-rose-500/20 hover:bg-rose-500/20 hover:text-white transition-all"
            title="Log Out of Admin"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 border-white/5 bg-[#131A2E]/50 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl bg-white/5", stat.color)}>
                {stat.icon}
              </div>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-white font-mono">{stat.value}</h3>
          </Card>
        ))}
      </div>

      {/* User Search & Table */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
          <div>
            <h3 className="text-xs font-black text-gray-300 uppercase tracking-[0.2em]">Registered User Accounts</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">All customer registrations, active wallets, and balance allocations.</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search user email or name..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4FF3D]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card className="p-0 border-white/5 bg-[#131A2E]/50 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/30 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-4">Customer Account</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Total Balance</th>
                  <th className="px-6 py-4">Registered</th>
                  <th className="px-6 py-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-6 h-16 bg-white/[0.02]" />
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? 'No user accounts match your search.' : 'No registered users yet.'}
                    </td>
                  </tr>
                ) : filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black bg-white/10 text-white">
                          {(u.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{u.displayName || 'Customer'}</p>
                          <p className="text-xs text-gray-400 font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border",
                        u.status === 'active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                        u.status === 'suspended' ? "bg-red-500/10 text-red-400 border-red-500/20" : 
                        "bg-orange-500/10 text-orange-400 border-orange-500/20"
                      )}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-mono font-black text-base text-[#D4FF3D]">
                        ${(Number(u.balance) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">{u.currency || 'USD'}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs font-mono">
                      {new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/admin/users/${u.uid}`)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white text-white hover:text-black text-xs font-black uppercase tracking-wider transition-all inline-flex items-center gap-1.5"
                      >
                        Manage <ChevronRight size={14} />
                      </button>
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
