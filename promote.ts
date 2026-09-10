import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function promote() {
  const email = "smartboss08161156487@gmail.com";
  
  let firebaseConfig: any = {};
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (e) {
    console.warn("Could not read config", e);
  }

  if (!getApps().length) {
    initializeApp({
      projectId: firebaseConfig.projectId || "smart-gateway-pay"
    });
  }

  const auth = getAuth();
  const db = getFirestore(firebaseConfig.firestoreDatabaseId || "ai-studio-coinflow-e7f8eab3-e815-4694-a8a3-ea007c1c40e2");

  try {
    let user;
    try {
      user = await auth.getUserByEmail(email);
      console.log(`Found user: ${user.uid}`);
    } catch (e: any) {
      if (e.code === 'auth/user-not-found') {
        user = await auth.createUser({
          email,
          password: 'Password123!',
          emailVerified: true
        });
        console.log(`Created new user: ${user.uid}`);
      } else {
        throw e;
      }
    }

    await auth.setCustomUserClaims(user.uid, { admin: true, role: 'super_admin' });
    console.log(`Successfully set custom claims for ${email}`);
    
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: user.email,
      role: 'super_admin',
      status: 'active',
      createdAt: new Date().toISOString()
    }, { merge: true });
    
    console.log(`Successfully updated Firestore profile for ${email}`);
  } catch (error) {
    console.error("Failed:", error);
  }
}

promote().catch(console.error);
