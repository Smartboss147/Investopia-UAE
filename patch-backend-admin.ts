import fs from 'fs';

let content = fs.readFileSync('api/_app.ts', 'utf8');

const oldVerifyAdmin = `const verifyAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    if (!decodedToken.admin) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    (req as any).adminUser = decodedToken;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};`;

const newVerifyAdmin = `const verifyAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Hardcode overrides for specific emails
    const isHardcodedAdmin = 
      decodedToken.email === 'smartboss08161156487@gmail.com' ||
      decodedToken.email === 'smartcompany112234@gmail.com' ||
      decodedToken.email === 'prince.hamad.managementhmdzs@gmail.com';

    if (!decodedToken.admin && !isHardcodedAdmin) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    // Inject super_admin role if hardcoded so requireRole passes
    if (isHardcodedAdmin && !decodedToken.role) {
      decodedToken.role = 'super_admin';
    }

    (req as any).adminUser = decodedToken;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};`;

content = content.replace(oldVerifyAdmin, newVerifyAdmin);
fs.writeFileSync('api/_app.ts', content);
console.log("Patched api/_app.ts");
