import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  History, 
  Plus, 
  Minus,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Activity
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../components/AuthProvider';
import { cn } from '../../lib/utils';
import { UserProfile, Transaction } from '../../types';

export const AdminUserDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [data, setData] = useState<{ profile: UserProfile; transactions: Transaction[] } | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Adjustment Form State
  const [adjType, setAdjType] = useState<'credit' | 'debit'>('credit');
  const [adjAmount, setAdjAmount] = useState('');
  const [adjReason, setAdjReason] = useState('');
  const [adjRef, setAdjRef] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Suspend/Reactivate State
  const [isSuspending, setIsSuspending] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendAction, setSuspendAction] = useState<'suspend' | 'reactivate'>('suspend');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { doc, getDoc, collection, getDocs } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        const { BASELINE_USERS } = await import('../../utils/seedUsers');

        let profile: UserProfile | null = null;
        const userDoc = await getDoc(doc(db, 'users', id!));
        if (userDoc.exists()) {
          profile = { uid: userDoc.id, ...userDoc.data() } as UserProfile;
        } else {
          const matched = BASELINE_USERS.find(u => u.uid === id || u.email === id);
          if (matched) {
            profile = matched;
          }
        }

        if (profile) {
          let transactions: Transaction[] = [];
          try {
            const txSnap = await getDocs(collection(db, 'users', id!, 'transactions'));
            transactions = txSnap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
            transactions.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          } catch (txErr) {
            console.warn('Could not fetch user transactions:', txErr);
          }
          setData({ profile, transactions });
        } else {
          // Fallback to server API if available
          try {
            const idToken = await user?.getIdToken();
            const response = await fetch(`/api/admin/users/${id}`, {
              headers: { 'Authorization': `Bearer ${idToken}` }
            });
            if (response.ok) {
              const result = await response.json();
              setData(result);
            }
          } catch (e) {
            console.error(e);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleAdjustBalance = async () => {
    if (!data) return;
    setIsSubmitting(true);
    try {
      const { doc, setDoc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');

      const currentBalance = Number(data.profile.balance) || 0;
      const amountNum = parseFloat(adjAmount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Please enter a valid positive amount');
      }

      const newBalance = adjType === 'credit'
        ? currentBalance + amountNum
        : currentBalance - amountNum;

      if (newBalance < 0) {
        throw new Error('Debit amount cannot exceed current balance');
      }

      const requestId = `adj-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // 1. Update user profile
      await setDoc(doc(db, 'users', id!), {
        ...data.profile,
        balance: newBalance
      }, { merge: true });

      // 2. Add transaction
      const txId = `tx-${Date.now()}`;
      const newTx: Transaction = {
        id: txId,
        userId: id!,
        type: 'adjustment',
        amount: amountNum,
        coin: 'USD',
        status: 'completed',
        timestamp: Date.now(),
        description: `Admin adjustment: ${adjReason || 'Manual adjustment'} (Ref: ${adjRef || 'ADMIN'})`
      };
      await setDoc(doc(db, 'users', id!, 'transactions', txId), newTx);

      // 3. Add audit log
      await setDoc(doc(db, 'admin_audit_logs', requestId), {
        id: requestId,
        adminUserId: user?.uid || 'admin',
        adminEmail: user?.email || 'smartboss08161156487@gmail.com',
        targetUserId: id!,
        targetEmail: data.profile.email,
        previousBalance: currentBalance,
        adjustmentAmount: amountNum,
        newBalance: newBalance,
        adjustmentType: adjType,
        reason: adjReason,
        internalReference: adjRef,
        timestamp: Date.now(),
        requestId
      });

      setSuccess(true);
      setData({
        profile: { ...data.profile, balance: newBalance },
        transactions: [newTx, ...data.transactions]
      });

      // Reset form
      setTimeout(() => {
        setIsConfirming(false);
        setSuccess(false);
        setAdjAmount('');
        setAdjReason('');
        setAdjRef('');
      }, 2000);

    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!data) return;
    setIsSubmitting(true);
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');

      const nextStatus = suspendAction === 'suspend' ? 'suspended' : 'active';

      await setDoc(doc(db, 'users', id!), {
        ...data.profile,
        status: nextStatus
      }, { merge: true });

      const logId = `status-${Date.now()}-${id}`;
      await setDoc(doc(db, 'admin_audit_logs', logId), {
        id: logId,
        action: suspendAction === 'suspend' ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
        adminUserId: user?.uid || 'admin',
        adminEmail: user?.email || 'smartboss08161156487@gmail.com',
        targetUserId: id!,
        targetEmail: data.profile.email,
        previousStatus: data.profile.status,
        newStatus: nextStatus,
        reason: suspendReason || 'Admin status change',
        timestamp: Date.now()
      });

      setData({
        ...data,
        profile: { ...data.profile, status: nextStatus }
      });

      setIsSuspending(false);
      setSuspendReason('');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-2 border-[#D4FF3D] border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <div className="text-center py-20 text-gray-500 underline cursor-pointer" onClick={() => navigate('/admin')}>User not found. Return to dashboard.</div>;

  const currentBalance = data.profile.balance;
  const newBalance = adjType === 'credit' 
    ? currentBalance + (parseFloat(adjAmount) || 0)
    : currentBalance - (parseFloat(adjAmount) || 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-20">
      <button 
        onClick={() => navigate('/admin')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
      >
        <ArrowLeft size={14} /> Back to Terminal
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 border-white/5 bg-[#131A2E]/50">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#D4FF3D] to-emerald-500 p-1 mb-4">
                <div className="w-full h-full rounded-full bg-[#131A2E] flex items-center justify-center text-2xl font-black text-[#D4FF3D]">
                  {data.profile.email.charAt(0).toUpperCase()}
                </div>
              </div>
              <h2 className="text-xl font-black text-white">{data.profile.displayName || 'Unnamed User'}</h2>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{data.profile.email}</p>
              <div className="mt-4 flex gap-2">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
                  data.profile.status === 'active' ? "bg-emerald-500/10 text-emerald-400" : "bg-orange-500/10 text-orange-400"
                )}>
                  {data.profile.status}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Available Balance</span>
                <span className="text-lg font-black text-[#D4FF3D] font-mono">${currentBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold">Member Since</span>
                <span className="text-white">{new Date(data.profile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>

          {isSuspending ? (
            <Card className="p-6 border-red-500/20 bg-red-500/5 space-y-4">
              <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-500" />
                Confirm {suspendAction}
              </h4>
              <Input 
                label="Reason" 
                placeholder="Required for audit logs..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="bg-black/20"
              />
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1 text-xs" onClick={() => setIsSuspending(false)}>Cancel</Button>
                <Button 
                  className={cn("flex-1 text-xs", suspendAction === 'suspend' ? "bg-red-500 text-white" : "bg-emerald-500 text-black")}
                  onClick={handleStatusUpdate}
                  isLoading={isSubmitting}
                  disabled={!suspendReason}
                >
                  Confirm
                </Button>
              </div>
            </Card>
          ) : (
            <Button 
              variant="outline" 
              className={cn(
                "w-full border-red-500/20 text-red-500 hover:bg-red-500/5",
                data.profile.status === 'suspended' && "border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5"
              )}
              onClick={() => {
                setSuspendAction(data.profile.status === 'suspended' ? 'reactivate' : 'suspend');
                setIsSuspending(true);
              }}
            >
              {data.profile.status === 'suspended' ? (
                <><CheckCircle2 size={14} /> Reactivate Account</>
              ) : (
                <><Shield size={14} /> Suspend Account</>
              )}
            </Button>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Balance Adjustment Form */}
          <Card className="p-8 border-white/5 bg-[#131A2E]/50 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-6">
              <Activity size={18} className="text-[#D4FF3D]" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Manual Balance Adjustment</h3>
            </div>

            {isConfirming ? (
              <div className="space-y-6 animate-in zoom-in-95 duration-300">
                <div className={cn(
                  "p-6 rounded-2xl border flex flex-col items-center text-center",
                  success ? "bg-emerald-500/10 border-emerald-500/20" : "bg-orange-500/10 border-orange-500/20"
                )}>
                  {success ? (
                    <>
                      <CheckCircle2 size={48} className="text-emerald-500 mb-4 animate-bounce" />
                      <h4 className="text-lg font-black text-white uppercase">Adjustment Applied</h4>
                      <p className="text-xs text-emerald-400/80 mt-1">Audit log record created successfully.</p>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={48} className="text-orange-500 mb-4" />
                      <h4 className="text-lg font-black text-white uppercase">Confirm Adjustment</h4>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between w-64 text-sm">
                          <span className="text-gray-400">Previous Balance:</span>
                          <span className="text-white font-mono">${currentBalance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between w-64 text-sm">
                          <span className="text-gray-400">Adjustment ({adjType}):</span>
                          <span className={cn("font-mono", adjType === 'credit' ? "text-emerald-400" : "text-red-400")}>
                            {adjType === 'credit' ? '+' : '-'}${parseFloat(adjAmount).toLocaleString()}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-white/10 flex justify-between w-64 text-base font-black">
                          <span className="text-white">New Balance:</span>
                          <span className="text-[#D4FF3D] font-mono">${newBalance.toLocaleString()}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {!success && (
                  <div className="flex gap-4">
                    <Button variant="ghost" className="flex-1" onClick={() => setIsConfirming(false)}>Cancel</Button>
                    <Button className="flex-1" onClick={handleAdjustBalance} isLoading={isSubmitting}>Confirm & Log Action</Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex gap-2 p-1 bg-black/20 rounded-xl">
                  <button 
                    onClick={() => setAdjType('credit')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-black uppercase transition-all",
                      adjType === 'credit' ? "bg-emerald-500 text-black" : "text-gray-400 hover:bg-white/5"
                    )}
                  >
                    <Plus size={14} /> Credit
                  </button>
                  <button 
                    onClick={() => setAdjType('debit')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-black uppercase transition-all",
                      adjType === 'debit' ? "bg-red-500 text-white" : "text-gray-400 hover:bg-white/5"
                    )}
                  >
                    <Minus size={14} /> Debit
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Adjustment Amount (USD)" 
                    type="number" 
                    placeholder="0.00"
                    value={adjAmount}
                    onChange={(e) => setAdjAmount(e.target.value)}
                  />
                  <Input 
                    label="Internal Reference" 
                    placeholder="Ticket ID, Invoice, etc."
                    value={adjRef}
                    onChange={(e) => setAdjRef(e.target.value)}
                  />
                </div>
                <Input 
                  label="Detailed Reason for Adjustment" 
                  placeholder="Explain why this manual change is being made..."
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                />

                <Button 
                  className="w-full" 
                  disabled={!adjAmount || !adjReason || !adjRef || (adjType === 'debit' && parseFloat(adjAmount) > currentBalance)}
                  onClick={() => setIsConfirming(true)}
                >
                  Review Adjustment
                </Button>
              </div>
            )}
          </Card>

          {/* User History */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <History size={16} className="text-gray-400" />
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction History</h3>
            </div>
            
            <div className="space-y-3">
              {data.transactions.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-white/5 rounded-[24px]">
                  <FileText size={32} className="mx-auto text-gray-700 mb-4" />
                  <p className="text-xs text-gray-500">No transaction history found for this user.</p>
                </div>
              ) : data.transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-[#131A2E]/30 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      tx.type === 'adjustment' ? "bg-[#D4FF3D]/10 text-[#D4FF3D]" : "bg-white/5 text-gray-400"
                    )}>
                      {tx.type === 'adjustment' ? <Activity size={18} /> : <FileText size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white capitalize">{tx.type}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{new Date(tx.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-sm font-black font-mono",
                      tx.type === 'adjustment' ? (tx.amount > 0 ? "text-[#D4FF3D]" : "text-[#D4FF3D]") : "text-white"
                    )}>
                      ${tx.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
