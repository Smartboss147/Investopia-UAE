import fs from 'fs';

// 1. Update AdminProtectedRoute.tsx
let adminRouteContent = fs.readFileSync('src/components/admin/AdminProtectedRoute.tsx', 'utf8');

const oldCheck = `const idTokenResult = await user.getIdTokenResult();
        setIsAdmin(!!idTokenResult.claims.admin);`;

const newCheck = `const idTokenResult = await user.getIdTokenResult();
        const isHardcodedAdmin = 
          user.email === 'smartboss08161156487@gmail.com' || 
          user.email === 'smartcompany112234@gmail.com' || 
          user.email === 'prince.hamad.managementhmdzs@gmail.com';
        setIsAdmin(!!idTokenResult.claims.admin || isHardcodedAdmin);`;

adminRouteContent = adminRouteContent.replace(oldCheck, newCheck);
fs.writeFileSync('src/components/admin/AdminProtectedRoute.tsx', adminRouteContent);

// 2. Update Sidebar.tsx (if needed for visual navigation)
let sidebarContent = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
const oldSidebarCheck = "const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin';";
const newSidebarCheck = `const { user } = useAuth();
  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin' || 
                  user?.email === 'smartboss08161156487@gmail.com' || 
                  user?.email === 'smartcompany112234@gmail.com' || 
                  user?.email === 'prince.hamad.managementhmdzs@gmail.com';`;

sidebarContent = sidebarContent.replace(oldSidebarCheck, newSidebarCheck);
fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebarContent);

console.log("Patched");
