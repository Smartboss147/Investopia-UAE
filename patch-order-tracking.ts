import fs from 'fs';

let content = fs.readFileSync('src/pages/OrderTrackingPage.tsx', 'utf8');

const oldTotals = `            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Amount</span>
              <span className="text-[#D4FF3D] font-black text-sm">{formatCurrency(order.totalAmount, order.currency)}</span>
            </div>`;

const newTotals = `            {order.shippingFee !== undefined && order.shippingFee > 0 && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Shipping Fee</span>
                <span className="text-white font-black text-sm">{formatCurrency(order.shippingFee, order.currency)}</span>
              </div>
            )}
            {order.clearanceFee !== undefined && order.clearanceFee > 0 && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Clearance Fee</span>
                <span className="text-white font-black text-sm">{formatCurrency(order.clearanceFee, order.currency)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-2">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Amount</span>
              <span className="text-[#D4FF3D] font-black text-sm">{formatCurrency(order.totalAmount + (order.shippingFee || 0) + (order.clearanceFee || 0), order.currency)}</span>
            </div>`;

content = content.replace(oldTotals, newTotals);
fs.writeFileSync('src/pages/OrderTrackingPage.tsx', content);
console.log("Updated OrderTrackingPage Totals");
