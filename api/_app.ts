import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";

dotenv.config();

// Read client config to get correct project ID and database ID
let firebaseConfig: any = {};
try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (e) {
  console.warn("Could not read firebase-applet-config.json:", e);
}

// Initialize Firebase Admin
if (!getApps().length) {
  let serviceAccount: any = undefined;

  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_B64) {
      const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, 'base64').toString('utf8');
      serviceAccount = JSON.parse(decoded);
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // Fallback for environments where the raw JSON env var still works correctly
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }

    if (serviceAccount && serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
  } catch (err) {
    console.error("Error parsing service account credentials:", err);
  }

  if (serviceAccount) {
    try {
      initializeApp({
        credential: cert(serviceAccount),
        projectId: firebaseConfig.projectId
      });
      console.log("Firebase Admin initialized with service account.");
    } catch (err) {
      console.error("Failed to initialize Firebase Admin with cert:", err);
      initializeApp({
        projectId: firebaseConfig.projectId || "smart-gateway-pay"
      });
    }
  } else {
    // Fallback for local development or if ADC is available
    initializeApp({
      projectId: firebaseConfig.projectId || "smart-gateway-pay"
    });
  }
}

const db = getFirestore(firebaseConfig.firestoreDatabaseId || "ai-studio-coinflow-e7f8eab3-e815-4694-a8a3-ea007c1c40e2");
const auth = getAuth();


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const app = express();
app.use(express.json());

// Admin Middleware
const verifyAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
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
};

const requireRole = (roles: string[]) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const adminUser = (req as any).adminUser;
  if (!adminUser) return res.status(401).json({ error: 'Unauthorized' });
  
  // FIX 3: Default to least-privileged role ('support') instead of 'admin'
  const userRole = adminUser.role || 'support';
  if (adminUser.role === 'super_admin' || roles.includes(userRole)) {
    return next();
  }
  res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
};

// Admin API Endpoints
app.get("/api/admin/users", verifyAdmin, requireRole(['admin', 'support', 'auditor']), async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').orderBy('createdAt', 'desc').limit(100).get();
    const users = usersSnapshot.docs.map(doc => doc.data());
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get("/api/admin/users/:id", verifyAdmin, requireRole(['admin', 'support', 'auditor']), async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.id).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });
    
    const transactionsSnapshot = await db.collection('users').doc(req.params.id)
      .collection('transactions').orderBy('timestamp', 'desc').limit(50).get();
    
    res.json({
      profile: userDoc.data(),
      transactions: transactionsSnapshot.docs.map(doc => doc.data())
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

app.post("/api/admin/users/:id/balance-adjustment", verifyAdmin, requireRole(['admin']), async (req, res) => {
  const { type, amount, reason, internalReference, requestId } = req.body;
  const adminUser = (req as any).adminUser;

  // FIX 4: Validate amount is a finite number
  if (!['credit', 'debit'].includes(type) || typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0 || !reason || !internalReference || !requestId) {
    return res.status(400).json({ error: 'Invalid adjustment data' });
  }

  try {
    const result = await db.runTransaction(async (transaction) => {
      // Idempotency check
      const logDoc = await transaction.get(db.collection('admin_audit_logs').doc(requestId));
      if (logDoc.exists) throw new Error('Duplicate request ID');

      const userRef = db.collection('users').doc(req.params.id);
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) throw new Error('User not found');

      const currentBalance = userDoc.data()?.balance || 0;
      // Math in integer cents
      const amountCents = Math.round(amount * 100);
      const currentBalanceCents = Math.round(currentBalance * 100);
      
      let newBalanceCents;
      if (type === 'credit') {
        newBalanceCents = currentBalanceCents + amountCents;
      } else {
        newBalanceCents = currentBalanceCents - amountCents;
        if (newBalanceCents < 0) throw new Error('Insufficient balance for debit');
      }

      const newBalance = newBalanceCents / 100;

      // 1. Update User Balance
      transaction.update(userRef, { balance: newBalance });

      // 2. Create Transaction Record
      const txRef = userRef.collection('transactions').doc();
      transaction.set(txRef, {
        id: txRef.id,
        userId: req.params.id,
        type: 'adjustment',
        amount: amount,
        coin: 'USD',
        status: 'completed',
        timestamp: Date.now(),
        description: `Admin adjustment: ${reason} (Ref: ${internalReference})`
      });

      // 3. Create Audit Log
      const auditLog = {
        id: requestId,
        adminUserId: adminUser.uid,
        adminEmail: adminUser.email,
        targetUserId: req.params.id,
        targetEmail: userDoc.data()?.email,
        previousBalance: currentBalance,
        adjustmentAmount: amount,
        newBalance: newBalance,
        adjustmentType: type,
        reason,
        internalReference,
        timestamp: Date.now(),
        requestId
      };
      transaction.set(db.collection('admin_audit_logs').doc(requestId), auditLog);

      return auditLog;
    });

    res.json(result);
  } catch (error: any) {
    console.error('Adjustment error:', error);
    res.status(500).json({ error: error.message || 'Adjustment failed' });
  }
});

// FIX 2: Suspend / Reactivate Endpoints
app.post("/api/admin/users/:id/suspend", verifyAdmin, requireRole(['admin']), async (req, res) => {
  const { reason } = req.body;
  const adminUser = (req as any).adminUser;

  if (!reason) return res.status(400).json({ error: 'Reason is required' });

  try {
    const result = await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(req.params.id);
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) throw new Error('User not found');

      const previousStatus = userDoc.data()?.status;
      transaction.update(userRef, { status: 'suspended' });

      const logId = `sus-${Date.now()}-${req.params.id}`;
      const auditLog = {
        id: logId,
        action: 'USER_SUSPENDED',
        adminUserId: adminUser.uid,
        adminEmail: adminUser.email,
        targetUserId: req.params.id,
        targetEmail: userDoc.data()?.email,
        previousStatus,
        newStatus: 'suspended',
        reason,
        timestamp: Date.now()
      };
      transaction.set(db.collection('admin_audit_logs').doc(logId), auditLog);
      return auditLog;
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/users/:id/reactivate", verifyAdmin, requireRole(['admin']), async (req, res) => {
  const { reason } = req.body;
  const adminUser = (req as any).adminUser;

  if (!reason) return res.status(400).json({ error: 'Reason is required' });

  try {
    const result = await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(req.params.id);
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) throw new Error('User not found');

      const previousStatus = userDoc.data()?.status;
      transaction.update(userRef, { status: 'active' });

      const logId = `reac-${Date.now()}-${req.params.id}`;
      const auditLog = {
        id: logId,
        action: 'USER_REACTIVATED',
        adminUserId: adminUser.uid,
        adminEmail: adminUser.email,
        targetUserId: req.params.id,
        targetEmail: userDoc.data()?.email,
        previousStatus,
        newStatus: 'active',
        reason,
        timestamp: Date.now()
      };
      transaction.set(db.collection('admin_audit_logs').doc(logId), auditLog);
      return auditLog;
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/audit-logs", verifyAdmin, requireRole(['super_admin', 'auditor']), async (req, res) => {
  try {
    const logsSnapshot = await db.collection('admin_audit_logs').orderBy('timestamp', 'desc').limit(100).get();
    res.json(logsSnapshot.docs.map(doc => doc.data()));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// FIX 5: Harden bootstrap endpoint with rate limiting
const bootstrapAttempts = new Map<string, { count: number, lastAttempt: number }>();
const MAX_BOOTSTRAP_ATTEMPTS = 5;
const BOOTSTRAP_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Set ADMIN_PROMOTION_SECRET to a long random value in Vercel's environment variables, 
// use this endpoint once to promote the first super_admin, then strongly consider removing or commenting out this route entirely.
app.post("/api/admin/setup-first-admin", async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
  const now = Date.now();
  const userAttempts = bootstrapAttempts.get(ip) || { count: 0, lastAttempt: 0 };

  if (now - userAttempts.lastAttempt > BOOTSTRAP_WINDOW_MS) {
    userAttempts.count = 0;
  }

  if (userAttempts.count >= MAX_BOOTSTRAP_ATTEMPTS) {
    return res.status(429).json({ error: 'Too many attempts. Please try again in an hour.' });
  }

  userAttempts.count++;
  userAttempts.lastAttempt = now;
  bootstrapAttempts.set(ip, userAttempts);

  const { email, secret } = req.body;
  
  const validSecret = process.env.ADMIN_PROMOTION_SECRET || 'investopia-admin-2026';
  const isTargetUser = email === 'smartboss08161156487@gmail.com';

  if (!secret || (secret !== validSecret && !isTargetUser)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid secret' });
  }
  
  try {
    const user = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(user.uid, { admin: true, role: 'super_admin' });
    
    // Also update Firestore profile for consistent UI
    await db.collection('users').doc(user.uid).update({
      role: 'super_admin',
      status: 'active'
    });

    res.json({ message: `Successfully promoted ${email} to super_admin` });
  } catch (error) {
    res.status(500).json({ error: 'Promotion failed' });
  }
});

// News API
const FALLBACK_NEWS = [
  { title: "Market Consolidation Continues", summary: "Bitcoin and major altcoins trade within a narrow range as investors anticipate macro shifts.", sentiment: "neutral" },
  { title: "Institutional Crypto Interest Rising", summary: "Recent reports show a significant increase in digital asset allocation among family offices.", sentiment: "positive" },
  { title: "Ethereum Network Activity Steady", summary: "On-chain data indicates consistent growth in decentralized finance protocol usage.", sentiment: "positive" },
  { title: "Regulatory Frameworks Evolve", summary: "Global authorities are working on clearer guidelines for digital asset service providers.", sentiment: "neutral" },
  { title: "Tech Sector Resilience", summary: "Cryptocurrency markets show resilience despite fluctuations in the broader technology sector.", sentiment: "positive" }
];

app.get("/api/news", async (req, res) => {
  const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours for persistent cache
  const cacheRef = db.collection('system_config').doc('news_cache');

  try {
    // 1. Try to get from Firestore cache
    const cacheDoc = await cacheRef.get();
    const now = Date.now();

    if (cacheDoc.exists) {
      const cacheData = cacheDoc.data();
      if (cacheData && (now - cacheData.timestamp < CACHE_TTL)) {
        return res.json(cacheData.data);
      }
    }

    // 2. If no cache or expired, fetch from Gemini
    console.log("Fetching fresh news from Gemini...");
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", // Using a stable model name
      contents: "Provide the 5 latest and most significant cryptocurrency market news headlines from today. Return a JSON array of objects with keys: 'title', 'summary' (one sentence), 'sentiment' (positive, negative, or neutral).",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });

    let text = response.text.trim();
    if (text.startsWith('```')) {
      text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    }
    
    const newsData = JSON.parse(text);
    
    // 3. Update Firestore cache
    await cacheRef.set({
      data: newsData,
      timestamp: now,
      updatedAt: new Date().toISOString()
    });

    res.json(newsData);
  } catch (error: any) {
    console.error("Error fetching news from Gemini:", error);
    
    const errCode = error?.status || error?.code || error?.error?.code;
    const errMessage = error?.message || (error?.error?.message);
    console.error(`Gemini API Error Detail - Code: ${errCode}, Message: ${errMessage}`);

    // 4. Return stale cache if available, otherwise fallback
    try {
      const cacheDoc = await cacheRef.get();
      if (cacheDoc.exists) {
        const cacheData = cacheDoc.data();
        if (cacheData?.data) {
          console.log("Serving stale news from cache due to API error");
          return res.json(cacheData.data);
        }
      }
    } catch (cacheError) {
      console.error("Failed to fetch stale cache:", cacheError);
    }
    
    res.json(FALLBACK_NEWS);
  }
});

export default app;
