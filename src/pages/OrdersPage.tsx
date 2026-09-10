import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useAuth } from '../components/AuthProvider';
import { TeslaOrder } from '../types/tesla';
import { formatCurrency } from '../utils/currency';
import { useNavigate } from 'react-router-dom';
import { Box, Package, ChevronRight, CheckCircle2, Clock, AlertCircle, X } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<TeslaOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        const q = query(
          collection(db, 'tesla_orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeslaOrder));
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { color: 'text-gray-400', bg: 'bg-gray-400/10', icon: <Clock size={14} /> };
      case 'processing': return { color: 'text-blue-400', bg: 'bg-blue-400/10', icon: <Package size={14} /> };
      case 'confirmed': return { color: 'text-purple-400', bg: 'bg-purple-400/10', icon: <CheckCircle2 size={14} /> };
      case 'shipped': return { color: 'text-orange-400', bg: 'bg-orange-400/10', icon: <Package size={14} /> };
      case 'customs': return { color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: <AlertCircle size={14} /> };
      case 'out_for_delivery': return { color: 'text-[#D4FF3D]', bg: 'bg-[#D4FF3D]/10', icon: <Package size={14} /> };
      case 'delivered': return { color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: <CheckCircle2 size={14} /> };
      case 'completed': return { color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: <CheckCircle2 size={14} /> };
      case 'cancelled': return { color: 'text-red-400', bg: 'bg-red-400/10', icon: <X size={14} /> };
      default: return { color: 'text-gray-400', bg: 'bg-gray-400/10', icon: <Clock size={14} /> };
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-[#D4FF3D] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#D4FF3D]/10 flex items-center justify-center">
          <Box className="text-[#D4FF3D]" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-widest">My Orders</h2>
          <p className="text-[#8A93A6] text-xs">Manage your Tesla products and shipments</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-[#131A2E]/50 rounded-[24px] p-12 text-center border border-white/5">
          <Box className="mx-auto text-[#8A93A6] mb-4" size={48} />
          <h3 className="text-white text-lg font-black uppercase tracking-widest mb-2">No Orders Found</h3>
          <p className="text-[#8A93A6] text-sm mb-6">You haven't placed any orders yet.</p>
          <button 
            onClick={() => navigate('/app/tesla')}
            className="bg-[#D4FF3D] text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-transform"
          >
            Shop Tesla Products
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#131A2E]/50 border border-white/5 rounded-[24px] p-6 hover:bg-[#131A2E]/80 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/app/orders/${order.id}`)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-white font-black text-sm">{order.orderNumber}</span>
                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${statusConfig.bg} ${statusConfig.color}`}>
                          {statusConfig.icon}
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[#8A93A6] text-xs">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    
                    <div className="text-left md:text-right">
                      <p className="text-white font-black">{formatCurrency(order.totalAmount, order.currency)}</p>
                      <p className="text-[#8A93A6] text-[10px] uppercase font-bold tracking-widest">
                        To: {order.shippingAddress?.country || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="w-8 h-8 rounded-full border-2 border-[#131A2E] bg-black/50 overflow-hidden">
                          <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-[#131A2E] bg-[#D4FF3D] flex items-center justify-center text-black text-[10px] font-black">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    
                    <button className="flex items-center gap-1 text-[#D4FF3D] text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Track Order <ChevronRight size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
