/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Package, 
  CheckCircle2, 
  XCircle,
  Save,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { TeslaProduct, TeslaCategory, ProductAvailability } from '../../types/tesla';
import { formatCurrency } from '../../utils/currency';
import { cn } from '../../lib/utils';

export const AdminTeslaProducts: React.FC = () => {
  const [products, setProducts] = useState<TeslaProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<TeslaProduct> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'tesla_products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeslaProduct)));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const productData = {
        ...editingProduct,
        slug: editingProduct.name?.toLowerCase().replace(/\s+/g, '-'),
        updatedAt: new Date().toISOString(),
      };

      if (editingProduct.id) {
        const productRef = doc(db, 'tesla_products', editingProduct.id);
        await updateDoc(productRef, productData);
      } else {
        await addDoc(collection(db, 'tesla_products'), {
          ...productData,
          createdAt: new Date().toISOString(),
          featured: productData.featured || false,
          images: productData.images || [productData.thumbnail],
        });
      }

      setIsEditing(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'tesla_products', id));
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Tesla Marketplace Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage vehicles, accessories, and technology catalog.</p>
        </div>
        <button 
          onClick={() => {
            setEditingProduct({
              name: '',
              category: 'Vehicles',
              price: 0,
              currency: 'AED',
              availability: 'Available',
              thumbnail: '',
              description: '',
              specifications: {}
            });
            setIsEditing(true);
          }}
          className="bg-[#D4FF3D] text-black px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Products', value: products.length, icon: Package, color: 'text-blue-400' },
          { label: 'Vehicles', value: products.filter(p => p.category === 'Vehicles').length, icon: Package, color: 'text-purple-400' },
          { label: 'Available', value: products.filter(p => p.availability === 'Available').length, icon: CheckCircle2, color: 'text-[#D4FF3D]' },
          { label: 'Out of Stock', value: products.filter(p => p.availability === 'Out of Stock').length, icon: XCircle, color: 'text-red-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#131A2E]/50 border border-white/5 p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={stat.color} size={24} />
            </div>
            <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">{stat.label}</p>
            <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D4FF3D] transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Search catalog..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none focus:border-[#D4FF3D]/50 transition-all"
        />
      </div>

      {/* Product List */}
      <div className="bg-[#131A2E]/50 border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Price</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-black/40 overflow-hidden flex-shrink-0">
                        <img 
                          src={product.thumbnail} 
                          alt="" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{product.name}</p>
                        <p className="text-gray-500 text-[10px] truncate max-w-[200px]">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-400 font-medium px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white font-black text-sm">
                    {formatCurrency(product.price, product.currency)}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={async () => {
                        const newStatus: ProductAvailability = 
                          product.availability === 'Available' ? 'Out of Stock' : 
                          product.availability === 'Out of Stock' ? 'Coming Soon' : 'Available';
                        await updateDoc(doc(db, 'tesla_products', product.id), {
                          availability: newStatus,
                          updatedAt: new Date().toISOString()
                        });
                        fetchProducts();
                      }}
                      className="flex items-center gap-2 group/status"
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        product.availability === 'Available' ? "bg-[#D4FF3D]" : 
                        product.availability === 'Coming Soon' ? "bg-blue-400" : "bg-red-400"
                      )} />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover/status:text-white transition-colors">{product.availability}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setEditingProduct(product);
                          setIsEditing(true);
                        }}
                        className="p-2 text-gray-500 hover:text-[#D4FF3D] hover:bg-[#D4FF3D]/10 rounded-xl transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsEditing(false)} />
          <div className="bg-[#131A2E] border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden relative z-10 flex flex-col">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-black text-white uppercase tracking-widest">
                {editingProduct.id ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Product Name</label>
                  <input 
                    type="text" 
                    required
                    value={editingProduct.name || ''}
                    onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-[#D4FF3D]/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Category</label>
                  <select 
                    value={editingProduct.category || 'Vehicles'}
                    onChange={e => setEditingProduct({...editingProduct, category: e.target.value as TeslaCategory})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-[#D4FF3D]/50 transition-all appearance-none"
                  >
                    <option value="Vehicles">Vehicles</option>
                    <option value="Charging">Charging</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Technology">Technology</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Price (AED)</label>
                  <input 
                    type="number" 
                    required
                    value={editingProduct.price || ''}
                    onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-[#D4FF3D]/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Availability</label>
                  <select 
                    value={editingProduct.availability || 'Available'}
                    onChange={e => setEditingProduct({...editingProduct, availability: e.target.value as ProductAvailability})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-[#D4FF3D]/50 transition-all appearance-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Coming Soon">Coming Soon</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Thumbnail URL</label>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    required
                    value={editingProduct.thumbnail || ''}
                    onChange={e => setEditingProduct({...editingProduct, thumbnail: e.target.value})}
                    className="flex-grow bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-[#D4FF3D]/50 transition-all"
                  />
                  {editingProduct.thumbnail && (
                    <div className="w-14 h-14 rounded-2xl bg-black/40 overflow-hidden flex-shrink-0 border border-white/10">
                      <img 
                        src={editingProduct.thumbnail} 
                        alt="" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Description</label>
                <textarea 
                  rows={4}
                  value={editingProduct.description || ''}
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-[#D4FF3D]/50 transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-4 py-4 border-t border-white/5 mt-4">
                <button 
                  type="submit" 
                  className="flex-grow bg-[#D4FF3D] text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                >
                  <Save size={18} /> Save Product
                </button>
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-8 py-4 bg-white/5 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
