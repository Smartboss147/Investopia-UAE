/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Car, 
  Zap, 
  ShoppingBag, 
  ChevronRight,
  ArrowRight,
  X,
  Plus,
  Minus,
  ShoppingCart
} from 'lucide-react';
import { TeslaProduct, TeslaCategory } from '../types/tesla';
import { initialTeslaProducts } from '../data/teslaProducts';
import { formatCurrency } from '../utils/currency';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, addDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { useAuth } from '../components/AuthProvider';

export const TeslaMarketplacePage: React.FC = () => {
  const [products, setProducts] = useState<TeslaProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TeslaCategory | 'All'>('All');
  const [selectedProduct, setSelectedProduct] = useState<TeslaProduct | null>(null);
  const [cart, setCart] = useState<{product: TeslaProduct, quantity: number}[]>([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'tesla_products'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeslaProduct));
        
        if (productsData.length === 0) {
          // If Firestore is empty, use initial data
          setProducts(initialTeslaProducts.map((p, i) => ({ ...p, id: `init-${i}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as TeslaProduct)));
        } else {
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback
        setProducts(initialTeslaProducts.map((p, i) => ({ ...p, id: `init-${i}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as TeslaProduct)));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredProduct = products.find(p => p.featured) || products[0];

  const addToCart = (product: TeslaProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const { user } = useAuth();

  const handleSubmitOrder = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        status: 'pending',
        currency: cart[0].product.currency,
        totalAmount: cartTotal,
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.price,
          currency: item.product.currency,
          thumbnail: item.product.thumbnail
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'tesla_orders'), orderData);
      setCart([]);
      setShowCart(false);
      alert('Order request submitted successfully! Our team will contact you soon.');
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] pb-20">
      {/* Hero Section */}
      {featuredProduct && (
        <section className="relative h-[70vh] min-h-[500px] flex items-center overflow-hidden rounded-[32px] mb-12">
          <div className="absolute inset-0 z-0">
            <img 
              src={featuredProduct.images[0]} 
              alt={featuredProduct.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0F1E] via-[#0A0F1E]/80 to-transparent" />
          </div>

          <div className="container mx-auto px-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-xl"
            >
              <span className="inline-block px-3 py-1 bg-[#D4FF3D]/10 text-[#D4FF3D] text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6">
                Featured Vehicle
              </span>
              <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter">
                {featuredProduct.name}
              </h1>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                {featuredProduct.description}
              </p>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedProduct(featuredProduct)}
                  className="bg-[#D4FF3D] text-black px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform flex items-center gap-2"
                >
                  Explore Now <ArrowRight size={18} />
                </button>
                <div className="text-white">
                  <span className="text-[10px] text-gray-500 uppercase block tracking-widest mb-1">Starting from</span>
                  <span className="text-2xl font-black">{formatCurrency(featuredProduct.price, featuredProduct.currency)}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Main Marketplace */}
      <div className="container mx-auto px-8">
        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['All', 'Vehicles', 'Charging', 'Accessories', 'Technology', 'Lifestyle'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as any)}
                className={cn(
                  "px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  selectedCategory === cat 
                    ? "bg-[#D4FF3D] text-black" 
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative group max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D4FF3D] transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search Tesla products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-[#D4FF3D]/50 transition-all"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -8 }}
                className="bg-[#131A2E]/50 border border-white/5 rounded-[32px] overflow-hidden group cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img 
                    src={product.thumbnail} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-6 right-6">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                      product.availability === 'Available' ? "bg-[#D4FF3D] text-black" : "bg-white/10 text-white"
                    )}>
                      {product.availability}
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[#8A93A6] text-[10px] font-bold uppercase tracking-widest mb-1">{product.category}</p>
                      <h3 className="text-white text-2xl font-black tracking-tight">{product.name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Price</p>
                      <p className="text-[#D4FF3D] text-xl font-black">{formatCurrency(product.price, product.currency)}</p>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm line-clamp-2 mb-8 h-10">
                    {product.description}
                  </p>

                  <div className="flex items-center gap-3">
                    <button className="flex-grow bg-white/5 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">
                      View Details
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="bg-[#D4FF3D] p-4 rounded-2xl text-black hover:scale-105 transition-all"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="text-gray-600" size={32} />
            </div>
            <h3 className="text-white text-2xl font-black mb-2">No products found</h3>
            <p className="text-gray-400">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      {/* Cart Button */}
      {cart.length > 0 && (
        <button 
          onClick={() => setShowCart(true)}
          className="fixed bottom-8 right-8 bg-[#D4FF3D] text-black px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs shadow-2xl shadow-[#D4FF3D]/20 hover:scale-105 transition-all z-50 flex items-center gap-3"
        >
          <ShoppingCart size={20} />
          Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
        </button>
      )}

      {/* Product Details Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-[#0A0F1E]/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#131A2E] border border-white/10 rounded-[40px] w-full max-w-6xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-8 right-8 text-gray-500 hover:text-white z-20"
              >
                <X size={32} />
              </button>

              <div className="md:w-3/5 bg-black/40 flex items-center justify-center p-8">
                <img 
                  src={selectedProduct.images[0]} 
                  alt={selectedProduct.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              <div className="md:w-2/5 p-12 overflow-y-auto">
                <div className="mb-8">
                  <span className="text-[#D4FF3D] text-xs font-black uppercase tracking-[0.2em] mb-4 block">
                    {selectedProduct.category}
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-2 leading-none">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-[#D4FF3D] text-3xl font-black mt-4">
                    {formatCurrency(selectedProduct.price, selectedProduct.currency)}
                  </p>
                </div>

                <div className="space-y-8 mb-12">
                  <div>
                    <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Overview</h4>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      {selectedProduct.description}
                    </p>
                  </div>

                  {selectedProduct.specifications && (
                    <div>
                      <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Specifications</h4>
                      <div className="grid grid-cols-2 gap-6">
                        {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                          <div key={key} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                            <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1">{key}</p>
                            <p className="text-white text-sm font-black tracking-tight">{value as any}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-auto space-y-4">
                  <button 
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="w-full bg-[#D4FF3D] text-black py-6 rounded-[20px] font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] transition-transform"
                  >
                    Add to Cart
                  </button>
                  <p className="text-center text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                    Free shipping within UAE
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart Modal */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-[110] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="absolute inset-0 bg-[#0A0F1E]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-[#131A2E] w-full max-w-md h-full relative z-10 shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="text-[#D4FF3D]" size={24} />
                  <h2 className="text-xl font-black text-white uppercase tracking-widest">Your Cart</h2>
                </div>
                <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-6">
                {cart.length === 0 ? (
                  <div className="text-center py-20">
                    <ShoppingBag className="text-gray-700 mx-auto mb-4" size={48} />
                    <p className="text-gray-500 font-medium">Your cart is empty</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product.id} className="flex gap-4 group">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black/40 flex-shrink-0">
                        <img src={item.product.thumbnail} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <h4 className="text-white font-black text-sm mb-1">{item.product.name}</h4>
                          <button 
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <p className="text-[#D4FF3D] text-sm font-bold mb-3">
                          {formatCurrency(item.product.price, item.product.currency)}
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center bg-white/5 rounded-lg p-1">
                            <button 
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="p-1 text-gray-500 hover:text-white"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-white text-xs font-black">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="p-1 text-gray-500 hover:text-white"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-8 bg-black/20 border-t border-white/10">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500 text-xs font-black uppercase tracking-widest">Subtotal</span>
                    <span className="text-white text-2xl font-black">{formatCurrency(cartTotal, cart[0].product.currency)}</span>
                  </div>
                  <button 
                    onClick={handleSubmitOrder}
                    disabled={loading}
                    className="w-full bg-[#D4FF3D] text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-transform disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Submit Order Request'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
