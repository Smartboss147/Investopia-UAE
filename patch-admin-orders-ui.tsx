import fs from 'fs';

let content = fs.readFileSync('src/pages/admin/AdminOrdersPage.tsx', 'utf8');

const modalHeader = `              <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6">
                Manage Tracking: {selectedOrder.orderNumber}
              </h2>`;

// Replace the modal content with an expanded one that allows adding/editing fees and milestones
const newModalHeader = `              <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6">
                Manage Tracking: {selectedOrder.orderNumber}
              </h2>

              {/* Top Level Fees Configuration */}
              <div className="bg-black/40 border border-white/5 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Financials & Fees</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">Shipping Fee (USD)</label>
                    <div className="flex">
                      <input 
                        type="number" 
                        defaultValue={selectedOrder.shippingFee || 0}
                        className="w-full bg-black/50 border border-white/10 rounded-l-lg px-3 py-2 text-sm text-white focus:outline-none"
                        id="modal-shipping-fee"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">Clearance Fee (USD)</label>
                    <div className="flex">
                      <input 
                        type="number" 
                        defaultValue={selectedOrder.clearanceFee || 0}
                        className="w-full bg-black/50 border border-white/10 rounded-l-lg px-3 py-2 text-sm text-white focus:outline-none"
                        id="modal-clearance-fee"
                      />
                    </div>
                  </div>
                </div>
                <button 
                  onClick={async () => {
                    const sf = parseFloat((document.getElementById('modal-shipping-fee') as HTMLInputElement).value) || 0;
                    const cf = parseFloat((document.getElementById('modal-clearance-fee') as HTMLInputElement).value) || 0;
                    
                    try {
                      const { doc, updateDoc } = await import('firebase/firestore');
                      const { db } = await import('../../lib/firebase');
                      await updateDoc(doc(db, 'tesla_orders', selectedOrder.id), {
                        shippingFee: sf,
                        clearanceFee: cf
                      });
                      alert('Fees updated successfully');
                    } catch (e) {
                      alert('Failed to update fees');
                    }
                  }}
                  className="mt-3 bg-[#D4FF3D]/10 text-[#D4FF3D] hover:bg-[#D4FF3D]/20 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors w-full"
                >
                  Save Fees
                </button>
              </div>`;

content = content.replace(modalHeader, newModalHeader);
fs.writeFileSync('src/pages/admin/AdminOrdersPage.tsx', content);
console.log("Updated AdminOrdersPage Modal");
