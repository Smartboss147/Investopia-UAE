import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { TeslaProduct, TeslaOrderItem } from '../../types/tesla';
import { formatCurrency } from '../../utils/currency';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../AuthProvider';
import { useNavigate } from 'react-router-dom';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: { product: TeslaProduct; quantity: number }[];
  onSuccess: () => void;
}

const COUNTRIES = [
  'United Arab Emirates',
  'United States',
  'United Kingdom',
  'Germany',
  'France',
  'Italy',
  'Spain',
  'Netherlands',
  'Canada',
  'Saudi Arabia',
  'Nigeria'
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, cart, onSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    country: 'United Arab Emirates',
    state: '',
    city: '',
    address: '',
    postalCode: ''
  });

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const currency = cart.length > 0 ? cart[0].product.currency : 'USD';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    try {
      const orderNumber = `INV-TESLA-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
      
      const orderData = {
        orderNumber,
        userId: user.uid,
        userEmail: user.email,
        status: 'confirmed', // confirmed status allowed by firestore rules
        currency,
        totalAmount: cartTotal,
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.price,
          currency: item.product.currency,
          thumbnail: item.product.thumbnail
        })),
        customerInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone
        },
        shippingAddress: {
          country: formData.country,
          state: formData.state,
          city: formData.city,
          address: formData.address,
          postalCode: formData.postalCode
        },
        tracking: {
          origin: 'United Arab Emirates',
          destination: formData.country,
          startDate: new Date().toISOString(),
          estimatedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          carrier: 'Tesla Global Logistics',
          trackingReference: `TRK-${Math.floor(Math.random() * 100000000)}`,
          milestones: [
            {
              stage: 'Order Confirmed',
              location: 'United Arab Emirates',
              description: 'Your order has been confirmed and is being processed.',
              date: new Date().toISOString(),
              completed: true
            },
            {
              stage: 'Preparing for Shipment',
              location: 'United Arab Emirates',
              description: 'Your order is being prepared for shipment.',
              date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
              completed: false
            },
            {
              stage: 'Dispatched',
              location: 'United Arab Emirates',
              description: 'Your shipment has been dispatched from the UAE.',
              date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              completed: false
            },
            {
              stage: 'In Transit',
              location: 'International Transit',
              description: 'Your shipment is currently in international transit.',
              date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              completed: false
            },
            {
              stage: 'Customs Clearance',
              location: formData.country,
              description: 'Your shipment is awaiting customs clearance.',
              date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
              completed: false,
              customsFee: Math.floor(cartTotal * 0.05), // Example 5% fee
              customsCurrency: currency,
              customsPaid: false
            },
            {
              stage: 'Delivered',
              location: formData.country,
              description: 'Your order has been delivered.',
              date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              completed: false
            }
          ]
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'tesla_orders'), orderData);
      onSuccess();
      navigate('/app/orders'); // Navigate to Orders page after success
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0A0F1E]/95 backdrop-blur-xl"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#131A2E] border border-white/10 rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col md:flex-row"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-500 hover:text-white z-20 bg-black/50 p-2 rounded-full backdrop-blur-md"
          >
            <X size={24} />
          </button>

          {/* Order Summary */}
          <div className="md:w-1/3 bg-black/40 p-8 border-r border-white/5 overflow-y-auto hidden md:block">
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6">Order Summary</h3>
            <div className="space-y-4 mb-8">
              {cart.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 flex-shrink-0">
                    <img src={item.product.thumbnail} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{item.product.name}</p>
                    <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                    <p className="text-[#D4FF3D] text-sm font-black mt-1">
                      {formatCurrency(item.product.price * item.quantity, item.product.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-white/10 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal</span>
                <span>{formatCurrency(cartTotal, currency)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Shipping</span>
                <span>Calculated at next step</span>
              </div>
              <div className="flex justify-between text-lg text-white font-black pt-2 border-t border-white/10 mt-2">
                <span>Total</span>
                <span className="text-[#D4FF3D]">{formatCurrency(cartTotal, currency)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="md:w-2/3 p-6 md:p-10 overflow-y-auto">
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-8">Checkout</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Customer Info */}
              <div>
                <h3 className="text-xs font-bold text-[#8A93A6] tracking-[0.2em] uppercase mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">Full Name</label>
                    <input 
                      type="text" name="fullName" required
                      value={formData.fullName} onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-[#D4FF3D]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">Email</label>
                    <input 
                      type="email" name="email" required
                      value={formData.email} onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-[#D4FF3D]/50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">Phone Number</label>
                    <input 
                      type="tel" name="phone" required
                      value={formData.phone} onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-[#D4FF3D]/50"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div>
                <h3 className="text-xs font-bold text-[#8A93A6] tracking-[0.2em] uppercase mb-4">Delivery Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">Country</label>
                    <select 
                      name="country" required
                      value={formData.country} onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-[#D4FF3D]/50 appearance-none"
                    >
                      {COUNTRIES.map(c => <option key={c} value={c} className="bg-[#131A2E]">{c}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">Delivery Address</label>
                    <input 
                      type="text" name="address" required
                      value={formData.address} onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-[#D4FF3D]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">City</label>
                    <input 
                      type="text" name="city" required
                      value={formData.city} onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-[#D4FF3D]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">State/Province/Region</label>
                    <input 
                      type="text" name="state" required
                      value={formData.state} onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-[#D4FF3D]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">Postal / ZIP Code</label>
                    <input 
                      type="text" name="postalCode" required
                      value={formData.postalCode} onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-[#D4FF3D]/50"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#D4FF3D] text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Complete Purchase'}
                  {!loading && <Check size={18} />}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
