import fs from 'fs';
let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

content = content.replace(
  "  const { profile } = useAuth();\n  const { user } = useAuth();",
  "  const { profile, user } = useAuth();"
);

// If it was structured differently:
content = content.replace(
  "  const { profile } = useAuth();\n  const isAdmin = profile?.role === 'super_admin'",
  "  const { profile, user } = useAuth();\n  const isAdmin = profile?.role === 'super_admin'"
);

fs.writeFileSync('src/components/layout/Sidebar.tsx', content);
