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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const idToken = await user?.getIdToken();
        const response = await fetch(`/api/admin/users/${id}`, {
          headers: { 'Authorization': `Bearer ${idToken}` }
        });
        if (!response.ok) throw new Error('Failed to fetch user');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleAdjustBalance = async () => {
    setIsSubmitting(true);
    try {
      const idToken = await user?.getIdToken();
      const requestId = `adj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch(`/api/admin/users/${id}/balance-adjustment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          type: adjType,
          amount: parseFloat(adjAmount),
          reason: adjReason,
          internalReference: adjRef,
          requestId
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Adjustment failed');
      }

      setSuccess(true);
      // Refresh data
      const refreshedResponse = await fetch(`/api/admin/users/${id}`, {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      const result = await refreshedResponse.json();
      setData(result);
      
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

          <Button variant="outline" className="w-full border-red-500/20 text-red-500 hover:bg-red-500/5">
            <Shield size={14} /> Suspend Account
          </Button>
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
