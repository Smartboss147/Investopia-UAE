import fs from 'fs';
let content = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');

const oldPromo = `      if (isOwner) {
        try {
          const res = await fetch('/api/admin/setup-first-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email })
          });
          if (res.ok) {
            // Force token refresh to include the new admin claim
            await user.getIdToken(true);
            setSuccess('Welcome back, Admin! Redirecting to dashboard...');
            setTimeout(() => navigate('/admin'), 1500);
            return;
          }
        } catch (promoteErr) {
          console.error('Auto-promotion failed:', promoteErr);
        }
      }`;

const newPromo = `      if (isOwner) {
        try {
          const res = await fetch('/api/admin/setup-first-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email })
          });
          if (res.ok) {
            await user.getIdToken(true);
          }
        } catch (promoteErr) {
          console.error('Auto-promotion failed:', promoteErr);
        }
        setSuccess('Welcome back, Admin! Redirecting to dashboard...');
        setTimeout(() => navigate('/admin'), 1000);
        return;
      }`;

content = content.replace(oldPromo, newPromo);
fs.writeFileSync('src/pages/LoginPage.tsx', content);
console.log("Patched login redirect");
