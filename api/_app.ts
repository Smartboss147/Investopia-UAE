import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

dotenv.config();

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
    : undefined;

  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    // Fallback for local development or if ADC is available
    initializeApp();
  }
}

const db = getFirestore("ai-studio-coinflow-e7f8eab3-e815-4694-a8a3-ea007c1c40e2");
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
  
  // Master Admin Bypass: Allow the owner's email to be promoted without a secret
  const isOwner = email === 'smartcompany112234@gmail.com' || email === 'prince.hamad.managementhmdzs@gmail.com';
  
  if (!isOwner && (!secret || secret !== process.env.ADMIN_PROMOTION_SECRET)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const user = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(user.uid, { admin: true, role: 'super_admin' });
    res.json({ message: `Successfully promoted ${email} to super_admin` });
  } catch (error) {
    res.status(500).json({ error: 'Promotion failed' });
  }
});

// News API
let newsCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const FALLBACK_NEWS = [
  { title: "Bitcoin Consolidation Continues", summary: "BTC remains in a tight range as traders await further macro indicators.", sentiment: "neutral" },
  { title: "Ethereum Layer-2 Growth Surges", summary: "Total value locked in Ethereum L2 networks reaches new all-time highs.", sentiment: "positive" },
  { title: "Solana Network Upgrade Successful", summary: "The latest mainnet update brings improved throughput and lower latency.", sentiment: "positive" },
  { title: "Regulatory Uncertainty Persists", summary: "Global regulators continue to debate the classification of stablecoins.", sentiment: "neutral" },
  { title: "Market Volatility Rises", summary: "Increased trading volume leads to significant price fluctuations across major pairs.", sentiment: "negative" }
];

app.get("/api/news", async (req, res) => {
  const now = Date.now();
  if (newsCache && (now - newsCache.timestamp < CACHE_TTL)) {
    return res.json(newsCache.data);
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: "Provide the 5 latest and most significant cryptocurrency market news headlines from today. Return a JSON array of objects with keys: 'title', 'summary' (one sentence), 'sentiment' (positive, negative, or neutral).",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });
    const newsData = JSON.parse(response.text);
    newsCache = { data: newsData, timestamp: now };
    res.json(newsData);
  } catch (error: any) {
    console.error("Error fetching news from Gemini:", error);
    if (error?.status === 429 || error?.code === 429) {
      return res.json(FALLBACK_NEWS);
    }
    res.json(newsCache?.data || FALLBACK_NEWS);
  }
});

export default app;
