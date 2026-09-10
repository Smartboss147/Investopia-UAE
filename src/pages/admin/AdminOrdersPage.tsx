import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { TeslaOrder, OrderStatus, TrackingMilestone } from '../../types/tesla';
import { formatCurrency } from '../../utils/currency';
import { Search, Package, MapPin, CheckCircle2, Navigation, AlertTriangle, Edit2, X, Save } from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<TeslaOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<TeslaOrder | null>(null);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'tesla_orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeslaOrder)));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'tesla_orders', orderId), { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleToggleMilestone = async (orderId: string, milestoneIndex: number, currentCompleted: boolean) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.tracking) return;

    const newMilestones = [...order.tracking.milestones];
    newMilestones[milestoneIndex] = { ...newMilestones[milestoneIndex], completed: !currentCompleted };

    try {
      await updateDoc(doc(db, 'tesla_orders', orderId), { 'tracking.milestones': newMilestones });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, tracking: { ...o.tracking!, milestones: newMilestones } } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, tracking: { ...prev.tracking!, milestones: newMilestones } } : null);
      }
    } catch (error) {
      console.error('Error updating milestone:', error);
      alert('Failed to update milestone');
    }
  };

  const filteredOrders = orders.filter(o => 
    o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.customerInfo?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-white">Loading orders...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-widest uppercase">Order Management</h1>
          <p className="text-gray-400 mt-2 text-sm">Track and manage Tesla product shipments</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search INV or Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#131A2E] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-[#D4FF3D]"
          />
        </div>
      </div>

      <div className="bg-[#131A2E] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-black/20 text-gray-400 text-xs uppercase tracking-widest border-b border-white/5">
            <tr>
              <th className="px-6 py-4">Order Number</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Destination</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-gray-300">
            {filteredOrders.map(order => (
              <tr key={order.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-black text-white">{order.orderNumber || order.id.slice(0, 8)}</td>
                <td className="px-6 py-4">
                  <div>{order.customerInfo?.fullName || 'N/A'}</div>
                  <div className="text-xs text-gray-500">{order.customerInfo?.email || order.userEmail}</div>
                </td>
                <td className="px-6 py-4">{order.shippingAddress?.country || 'N/A'}</td>
                <td className="px-6 py-4">
                  <select 
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                    className="bg-black/50 border border-white/10 rounded px-2 py-1 text-xs outline-none focus:border-[#D4FF3D]"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="customs">Customs</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-right font-black text-[#D4FF3D]">
                  {formatCurrency(order.totalAmount, order.currency)}
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="text-[#D4FF3D] text-xs font-bold uppercase tracking-widest hover:underline"
                  >
                    Manage Tracking
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-gray-500">No orders found.</div>
        )}
      </div>

      {/* Tracking Management Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#131A2E] border border-white/10 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10"
            >
              <button 
                onClick={() => setSelectedOrder(null)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6">
                Manage Tracking: {selectedOrder.orderNumber}
              </h2>
              
              {!selectedOrder.tracking ? (
                <div className="text-gray-400">Tracking information not initialized for this order.</div>
              ) : (
                <div className="space-y-4">
                  {selectedOrder.tracking.milestones.map((milestone, idx) => (
                    <div key={idx} className="bg-black/30 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <button 
                          onClick={() => handleToggleMilestone(selectedOrder.id, idx, milestone.completed)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center border mt-1 flex-shrink-0 transition-colors ${
                            milestone.completed ? 'bg-[#D4FF3D] border-[#D4FF3D] text-black' : 'border-gray-600 hover:border-white text-transparent'
                          }`}
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <div>
                          <p className="font-bold text-white text-sm">{milestone.stage}</p>
                          <p className="text-gray-400 text-xs mb-1">{milestone.description}</p>
                          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                            <MapPin size={10} /> {milestone.location}
                          </p>
                          
                          {milestone.stage === 'Customs Clearance' && (
                            <div className="mt-2 text-xs">
                              {milestone.customsPaid ? (
                                <span className="text-emerald-400 font-bold">Customs Fee Paid</span>
                              ) : (
                                <span className="text-yellow-500 font-bold">Pending Customs Payment ({formatCurrency(milestone.customsFee || 0, milestone.customsCurrency || 'USD')})</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
