import fs from 'fs';

let content = fs.readFileSync('api/_app.ts', 'utf8');

const oldCheck = `  const validSecret = process.env.ADMIN_PROMOTION_SECRET || 'investopia-admin-2026';
  const isTargetUser = email === 'smartboss08161156487@gmail.com';

  if (!secret || (secret !== validSecret && !isTargetUser)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid secret' });
  }`;

const newCheck = `  const validSecret = process.env.ADMIN_PROMOTION_SECRET || 'investopia-admin-2026';
  const isTargetUser = 
    email === 'smartboss08161156487@gmail.com' || 
    email === 'smartcompany112234@gmail.com' || 
    email === 'prince.hamad.managementhmdzs@gmail.com';

  if (secret !== validSecret && !isTargetUser) {
    return res.status(401).json({ error: 'Unauthorized: Invalid secret' });
  }`;

content = content.replace(oldCheck, newCheck);
fs.writeFileSync('api/_app.ts', content);
console.log("Replaced");
