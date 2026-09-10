import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../components/AuthProvider';
import { TeslaOrder, TrackingMilestone } from '../types/tesla';
import { formatCurrency } from '../utils/currency';
import { MapPin, ArrowLeft, Package, Clock, CheckCircle2, Navigation, AlertTriangle, ShieldCheck } from 'lucide-react';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<TeslaOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingCustoms, setPayingCustoms] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !id) return;
      try {
        const docRef = doc(db, 'tesla_orders', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as TeslaOrder;
          if (data.userId === user.uid) {
            setOrder({ id: docSnap.id, ...data });
          }
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, user]);

  const handlePayCustoms = async () => {
    if (!order || !order.tracking) return;
    setPayingCustoms(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedMilestones = order.tracking.milestones.map(m => {
        if (m.stage === 'Customs Clearance') {
          return { ...m, customsPaid: true, completed: true };
        }
        return m;
      });
      
      // Also potentially update order status if it was stuck on customs
      let newStatus = order.status;
      if (order.status === 'customs') {
         newStatus = 'out_for_delivery';
      }

      await updateDoc(doc(db, 'tesla_orders', order.id), {
        'tracking.milestones': updatedMilestones,
        status: newStatus
      });
      
      setOrder({
        ...order,
        status: newStatus,
        tracking: {
          ...order.tracking,
          milestones: updatedMilestones
        }
      });
      
      alert('Customs fee paid successfully. Your shipment will now proceed to delivery.');
    } catch (error) {
      console.error('Error paying customs:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setPayingCustoms(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-[#D4FF3D] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h3 className="text-white text-xl font-black uppercase tracking-widest mb-4">Order Not Found</h3>
        <button onClick={() => navigate('/app/orders')} className="text-[#D4FF3D]">Return to Orders</button>
      </div>
    );
  }

  const tracking = order.tracking;
  if (!tracking) {
    return (
      <div className="text-center py-20">
        <h3 className="text-white text-xl font-black uppercase tracking-widest mb-4">No Tracking Information Available</h3>
        <button onClick={() => navigate('/app/orders')} className="text-[#D4FF3D]">Return to Orders</button>
      </div>
    );
  }

  const currentMilestoneIndex = tracking.milestones.findLastIndex(m => m.completed) || 0;
  const currentMilestone = tracking.milestones[currentMilestoneIndex] || tracking.milestones[0];
  const customsMilestone = tracking.milestones.find(m => m.stage === 'Customs Clearance');
  const needsCustomsPayment = customsMilestone && !customsMilestone.customsPaid && (currentMilestoneIndex === tracking.milestones.indexOf(customsMilestone) || currentMilestoneIndex + 1 === tracking.milestones.indexOf(customsMilestone));

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/app/orders')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-widest">Order {order.orderNumber}</h2>
          <p className="text-[#8A93A6] text-xs">Tracking Information</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tracking Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Map Simulation Box */}
          <div className="bg-[#131A2E]/50 rounded-[24px] border border-white/5 overflow-hidden relative h-64 md:h-80">
            {/* Fake Map Background */}
            <div className="absolute inset-0 bg-[#0A0F1E] opacity-50" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
              <div className="flex justify-between items-start">
                <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-3 inline-flex flex-col">
                  <span className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1">Origin</span>
                  <span className="text-white font-black text-sm flex items-center gap-1"><MapPin size={12} className="text-[#D4FF3D]" /> {tracking.origin}</span>
                </div>
                <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-3 inline-flex flex-col items-end">
                  <span className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1">Destination</span>
                  <span className="text-white font-black text-sm flex items-center gap-1">{tracking.destination} <MapPin size={12} className="text-red-400" /></span>
                </div>
              </div>
              
              <div className="bg-black/80 backdrop-blur-md border border-[#D4FF3D]/30 rounded-xl p-4 flex items-center gap-4 mx-auto max-w-sm w-full">
                <div className="w-10 h-10 rounded-full bg-[#D4FF3D]/20 flex items-center justify-center animate-pulse">
                  <Navigation className="text-[#D4FF3D]" size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Current Location</p>
                  <p className="text-white font-black">{currentMilestone.location}</p>
                </div>
              </div>
            </div>
            
            {/* Route Line SVG Simulation */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" preserveAspectRatio="none">
              <path d="M 50,50 Q 200,100 400,150 T 800,200" fill="none" stroke="#D4FF3D" strokeWidth="2" strokeDasharray="5,5" />
            </svg>
          </div>

          {/* Tracking Timeline */}
          <div className="bg-[#131A2E]/50 border border-white/5 rounded-[24px] p-6 md:p-8">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
              <Clock size={16} className="text-[#D4FF3D]" /> Shipment Progress
            </h3>
            
            <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#D4FF3D] before:via-white/10 before:to-transparent">
              {tracking.milestones.map((milestone, idx) => {
                const isCompleted = milestone.completed;
                const isCurrent = idx === currentMilestoneIndex;
                
                return (
                  <div key={idx} className="relative flex items-start gap-6">
                    <div className="absolute left-[-24px] bg-[#131A2E] w-6 h-6 flex items-center justify-center rounded-full z-10">
                      {isCompleted ? (
                        <div className="w-3 h-3 bg-[#D4FF3D] rounded-full shadow-[0_0_10px_rgba(212,255,61,0.5)]"></div>
                      ) : (
                        <div className="w-3 h-3 bg-white/10 rounded-full"></div>
                      )}
                    </div>
                    
                    <div className={`flex-grow ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1 mb-1">
                        <h4 className={`font-black uppercase tracking-widest text-sm ${isCurrent ? 'text-[#D4FF3D]' : 'text-white'}`}>
                          {milestone.stage}
                        </h4>
                        <span className="text-[#8A93A6] text-[10px] font-bold uppercase tracking-wider">
                          {new Date(milestone.date).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mb-1">{milestone.description}</p>
                      <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                        <MapPin size={10} /> {milestone.location}
                      </p>
                      
                      {milestone.stage === 'Customs Clearance' && needsCustomsPayment && isCurrent && (
                        <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="text-yellow-500 flex-shrink-0" size={20} />
                            <div>
                              <h5 className="text-yellow-500 text-xs font-black uppercase tracking-widest mb-1">Action Required: Customs Clearance</h5>
                              <p className="text-yellow-500/80 text-xs mb-3">Your shipment has arrived in {order.shippingAddress.country} and requires customs clearance before final delivery.</p>
                              
                              <div className="flex items-center justify-between mb-4 bg-black/30 rounded-lg p-3">
                                <span className="text-gray-400 text-xs">Clearance Fee</span>
                                <span className="text-white font-black">{formatCurrency(milestone.customsFee || 0, milestone.customsCurrency || 'USD')}</span>
                              </div>
                              
                              <button 
                                onClick={handlePayCustoms}
                                disabled={payingCustoms}
                                className="w-full bg-yellow-500 text-black py-3 rounded-lg font-black uppercase tracking-widest text-xs hover:bg-yellow-400 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                              >
                                {payingCustoms ? 'Processing Payment...' : 'Pay Clearance Fee'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {milestone.stage === 'Customs Clearance' && milestone.customsPaid && (
                        <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest">
                          <ShieldCheck size={12} /> Customs Cleared
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Details */}
        <div className="space-y-6">
          <div className="bg-[#131A2E]/50 border border-white/5 rounded-[24px] p-6">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6">Delivery Details</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Estimated Delivery</p>
                <p className="text-[#D4FF3D] font-black">{new Date(tracking.estimatedDeliveryDate).toLocaleDateString()}</p>
              </div>
              
              <div>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Carrier</p>
                <p className="text-white text-sm font-bold">{tracking.carrier}</p>
                <p className="text-gray-400 text-xs mt-1">Ref: {tracking.trackingReference}</p>
              </div>
              
              <div className="pt-4 border-t border-white/5">
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-2">Shipping Address</p>
                <p className="text-white text-sm font-bold">{order.customerInfo.fullName}</p>
                <p className="text-gray-400 text-xs mt-1">{order.shippingAddress.address}</p>
                <p className="text-gray-400 text-xs">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p className="text-gray-400 text-xs">{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#131A2E]/50 border border-white/5 rounded-[24px] p-6">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">Items</h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg bg-black/40 overflow-hidden flex-shrink-0 border border-white/5">
                    <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold line-clamp-1">{item.name}</p>
                    <p className="text-gray-400 text-[10px]">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Total</span>
              <span className="text-[#D4FF3D] font-black text-sm">{formatCurrency(order.totalAmount, order.currency)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
