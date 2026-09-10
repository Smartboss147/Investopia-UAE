import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Activity, 
  Search,
  ChevronRight,
  ShieldAlert,
  History,
  Zap,
  UserPlus,
  RefreshCw,
  Sliders,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../components/AuthProvider';
import { cn } from '../../lib/utils';
import { UserProfile } from '../../types';
import { BASELINE_USERS, syncBaselineUsers } from '../../utils/seedUsers';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserBalance, setNewUserBalance] = useState('5000');
  const [newUserStatus, setNewUserStatus] = useState<'active' | 'unverified' | 'suspended'>('active');
  const [newUserCurrency, setNewUserCurrency] = useState('USD');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [modalError, setModalError] = useState('');

  // Quick Balance Modal State
  const [quickUser, setQuickUser] = useState<UserProfile | null>(null);
  const [quickAmount, setQuickAmount] = useState('');
  const [quickType, setQuickType] = useState<'credit' | 'debit'>('credit');
  const [quickReason, setQuickReason] = useState('Manual balance adjustment');
  const [isApplyingQuick, setIsApplyingQuick] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupUserListener = async () => {
      try {
        const { collection, onSnapshot, getDocs } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        
        const usersRef = collection(db, 'users');
        
        unsubscribe = onSnapshot(usersRef, async (snapshot) => {
          let list: UserProfile[] = snapshot.docs.map(doc => {
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

          // Check if smartcompany112234@gmail.com is present, or if list is empty
          const hasSmartCompany = list.some(u => u.email.toLowerCase() === 'smartcompany112234@gmail.com');

          if (list.length === 0 || !hasSmartCompany) {
            // Merge with baseline users
            const baselineMap = new Map<string, UserProfile>();
            list.forEach(u => baselineMap.set(u.email.toLowerCase(), u));
            
            for (const bu of BASELINE_USERS) {
              if (!baselineMap.has(bu.email.toLowerCase())) {
                baselineMap.set(bu.email.toLowerCase(), bu);
              }
            }

            list = Array.from(baselineMap.values());

            // Silently persist missing baseline users to Firestore in background
            try {
              await syncBaselineUsers();
            } catch (e) {
              console.warn('Background sync baseline notice:', e);
            }
          }

          // Sort by creation date descending
          list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setUsers(list);
          setLoading(false);
        }, async (error) => {
          console.warn('Firestore snapshot notice, falling back to one-time fetch:', error);
          try {
            const snapshot = await getDocs(usersRef);
            let list = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
            if (list.length === 0) {
              list = BASELINE_USERS;
            }
            setUsers(list);
          } catch (fetchErr) {
            setUsers(BASELINE_USERS);
          } finally {
            setLoading(false);
          }
        });

      } catch (err) {
        console.error('Setup user listener error:', err);
        setUsers(BASELINE_USERS);
        setLoading(false);
      }
    };

    setupUserListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncBaselineUsers();
      // Also refetch
      const { collection, getDocs } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      const snap = await getDocs(collection(db, 'users'));
      const list = snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
      if (list.length > 0) {
        setUsers(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim()) {
      setModalError('Please provide a valid email address');
      return;
    }

    setIsCreatingUser(true);
    setModalError('');
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');

      const cleanEmail = newUserEmail.trim().toLowerCase();
      const generatedUid = `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
      const balanceNum = parseFloat(newUserBalance) || 0;

      const newProfile: UserProfile = {
        uid: generatedUid,
        email: cleanEmail,
        displayName: newUserName.trim() || cleanEmail.split('@')[0],
        balance: balanceNum,
        currency: newUserCurrency,
        status: newUserStatus,
        createdAt: Date.now()
      };

      await setDoc(doc(db, 'users', generatedUid), newProfile);

      // Add initial transaction if balance > 0
      if (balanceNum > 0) {
        const txId = `tx_init_${Date.now()}`;
        await setDoc(doc(db, 'users', generatedUid, 'transactions', txId), {
          id: txId,
          userId: generatedUid,
          type: 'deposit',
          amount: balanceNum,
          coin: newUserCurrency,
          status: 'completed',
          timestamp: Date.now(),
          description: 'Initial account funding'
        });
      }

      // Close modal and reset
      setShowAddModal(false);
      setNewUserEmail('');
      setNewUserName('');
      setNewUserBalance('5000');
    } catch (err: any) {
      console.error('Error creating user:', err);
      setModalError(err.message || 'Failed to create user');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleApplyQuickAdjustment = async () => {
    if (!quickUser) return;
    const amountNum = parseFloat(quickAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid positive amount');
      return;
    }

    setIsApplyingQuick(true);
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');

      const currentBalance = Number(quickUser.balance) || 0;
      const newBalance = quickType === 'credit' ? currentBalance + amountNum : currentBalance - amountNum;
      if (newBalance < 0) {
        throw new Error('Debit amount exceeds current balance');
      }

      // Update user doc
      await setDoc(doc(db, 'users', quickUser.uid), {
        ...quickUser,
        balance: newBalance
      }, { merge: true });

      // Add transaction
      const txId = `tx_${Date.now()}`;
      try {
        await setDoc(doc(db, 'users', quickUser.uid, 'transactions', txId), {
          id: txId,
          userId: quickUser.uid,
          type: 'adjustment',
          amount: amountNum,
          coin: quickUser.currency || 'USD',
          status: 'completed',
          timestamp: Date.now(),
          description: `Admin quick adjustment: ${quickReason}`
        });
      } catch (txErr) {
        console.warn('Could not record quick transaction:', txErr);
      }

      // Add audit log
      const logId = `adj_${Date.now()}`;
      try {
        await setDoc(doc(db, 'admin_audit_logs', logId), {
          id: logId,
          adminUserId: user?.uid || 'admin',
          adminEmail: user?.email || 'smartcompany112234@gmail.com',
          targetUserId: quickUser.uid,
          targetEmail: quickUser.email,
          previousBalance: currentBalance,
          adjustmentAmount: amountNum,
          newBalance: newBalance,
          adjustmentType: quickType,
          reason: quickReason,
          internalReference: 'QUICK_TERMINAL',
          timestamp: Date.now(),
          requestId: logId
        });
      } catch (logErr) {
        console.warn('Could not record quick audit log:', logErr);
      }

      setQuickUser(null);
      setQuickAmount('');
    } catch (err: any) {
      alert(err.message || 'Failed to apply adjustment');
    } finally {
      setIsApplyingQuick(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.displayName && u.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = [
    { label: 'Total Registered Users', value: users.length, icon: <Users size={20} />, color: 'text-blue-400' },
    { label: 'Cumulative Balances', value: `$${users.reduce((acc, u) => acc + (Number(u.balance) || 0), 0).toLocaleString()}`, icon: <Activity size={20} />, color: 'text-[#D4FF3D]' },
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
          <p className="text-gray-400 text-sm mt-1">
            Logged in as <span className="text-[#D4FF3D] font-mono font-bold">smartboss08161156487@gmail.com</span> (Master Admin)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#D4FF3D] text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white hover:scale-105 transition-all shadow-lg shadow-[#D4FF3D]/10"
          >
            <UserPlus size={15} /> Add User
          </button>

          <button 
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-white/5 text-gray-300 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-white/10 hover:bg-white/10 hover:text-white transition-all"
            title="Sync all baseline users and accounts"
          >
            <RefreshCw size={14} className={cn(isSyncing && "animate-spin text-[#D4FF3D]")} />
            {isSyncing ? 'Syncing...' : 'Sync Accounts'}
          </button>

          <button 
            onClick={() => navigate('/admin/audit-logs')}
            className="flex items-center gap-2 bg-white/5 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold border border-white/10 hover:bg-white/10 transition-all"
          >
            <History size={14} /> Audit Logs
          </button>

          <button 
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-indigo-500/30 hover:bg-indigo-500/30 transition-all"
          >
            <Zap size={14} /> Tesla Orders
          </button>

          <button 
            onClick={() => navigate('/admin/tesla')}
            className="flex items-center gap-2 bg-purple-500/20 text-purple-300 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-purple-500/30 hover:bg-purple-500/30 transition-all"
          >
            <Sliders size={14} /> Tesla Catalog
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
                      No matching user accounts found. Click <strong>Add User</strong> or <strong>Sync Accounts</strong> above.
                    </td>
                  </tr>
                ) : filteredUsers.map((u) => {
                  const isSpecial = u.email.toLowerCase() === 'smartcompany112234@gmail.com';
                  return (
                    <tr 
                      key={u.uid} 
                      className={cn(
                        "hover:bg-white/[0.03] transition-colors group",
                        isSpecial && "bg-indigo-950/20"
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center text-xs font-black",
                            isSpecial 
                              ? "bg-[#D4FF3D] text-black ring-2 ring-[#D4FF3D]/30"
                              : "bg-white/10 text-white"
                          )}>
                            {u.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-white text-sm">{u.displayName || 'Customer'}</p>
                              {isSpecial && (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#D4FF3D]/20 text-[#D4FF3D] border border-[#D4FF3D]/30">
                                  Primary Customer
                                </span>
                              )}
                            </div>
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
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setQuickUser(u);
                              setQuickAmount('');
                              setQuickType('credit');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-[#D4FF3D]/10 hover:text-[#D4FF3D] text-gray-300 text-xs font-bold border border-white/5 transition-all flex items-center gap-1"
                            title="Quick Adjust Balance"
                          >
                            <DollarSign size={13} /> Adjust
                          </button>
                          
                          <button
                            onClick={() => navigate(`/admin/users/${u.uid}`)}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white text-white hover:text-black text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
                          >
                            Manage <ChevronRight size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Modal: Add New User */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131A2E] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#D4FF3D]/10 text-[#D4FF3D] flex items-center justify-center">
                  <UserPlus size={16} />
                </div>
                <h3 className="text-base font-black text-white uppercase tracking-wider">Register User Account</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                  User Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. client@company.com"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#D4FF3D]"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                  Full Name / Entity Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe / Global Corp"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#D4FF3D]"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                    Initial Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-[#D4FF3D]"
                    value={newUserBalance}
                    onChange={(e) => setNewUserBalance(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                    Currency
                  </label>
                  <select
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4FF3D]"
                    value={newUserCurrency}
                    onChange={(e) => setNewUserCurrency(e.target.value)}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AED">AED (د.إ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                  Account Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['active', 'unverified', 'suspended'] as const).map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setNewUserStatus(st)}
                      className={cn(
                        "py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
                        newUserStatus === st
                          ? "bg-white text-black border-white"
                          : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10"
                      )}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#D4FF3D] text-black hover:bg-white transition-all disabled:opacity-50"
                >
                  {isCreatingUser ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Balance Adjust */}
      {quickUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131A2E] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider">Quick Adjust Balance</h3>
                <p className="text-xs text-gray-400 mt-0.5">{quickUser.email}</p>
              </div>
              <button 
                onClick={() => setQuickUser(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-black/30 rounded-xl flex justify-between items-center text-xs">
              <span className="text-gray-400">Current Balance:</span>
              <span className="font-mono font-black text-white text-sm">
                ${(Number(quickUser.balance) || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setQuickType('credit')}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                  quickType === 'credit'
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                )}
              >
                + Credit Account
              </button>
              <button
                type="button"
                onClick={() => setQuickType('debit')}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                  quickType === 'debit'
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                )}
              >
                - Debit Account
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                Adjustment Amount (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-[#D4FF3D]"
                value={quickAmount}
                onChange={(e) => setQuickAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                Reason
              </label>
              <input
                type="text"
                placeholder="Adjustment reason"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#D4FF3D]"
                value={quickReason}
                onChange={(e) => setQuickReason(e.target.value)}
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setQuickUser(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isApplyingQuick || !quickAmount}
                onClick={handleApplyQuickAdjustment}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50",
                  quickType === 'credit' ? "bg-emerald-500 text-black hover:bg-white" : "bg-red-500 text-white hover:bg-white hover:text-black"
                )}
              >
                {isApplyingQuick ? 'Applying...' : `Confirm ${quickType.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
