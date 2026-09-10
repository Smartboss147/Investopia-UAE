import fs from 'fs';
let content = fs.readFileSync('src/types/tesla.ts', 'utf8');
content = content.replace(
  '  totalAmount: number;',
  '  totalAmount: number;\n  shippingFee?: number;\n  clearanceFee?: number;'
);
fs.writeFileSync('src/types/tesla.ts', content);
