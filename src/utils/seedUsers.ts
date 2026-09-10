import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';

export const BASELINE_USERS: UserProfile[] = [
  {
    uid: 'usr_smartcompany_112234',
    email: 'smartcompany112234@gmail.com',
    displayName: 'Smart Company Corp',
    balance: 25450,
    currency: 'USD',
    status: 'active',
    createdAt: Date.now() - 86400000 * 7
  },
  {
    uid: 'usr_hamad_alzaabi',
    email: 'hamad.alzaabi@investopia.ae',
    displayName: 'Hamad Al Zaabi',
    balance: 142800,
    currency: 'USD',
    status: 'active',
    createdAt: Date.now() - 86400000 * 14
  },
  {
    uid: 'usr_sarah_jenkins',
    email: 'sarah.jenkins@cryptoassets.io',
    displayName: 'Sarah Jenkins',
    balance: 38500,
    currency: 'USD',
    status: 'active',
    createdAt: Date.now() - 86400000 * 10
  },
  {
    uid: 'usr_david_chen',
    email: 'david.chen@pacifictrading.com',
    displayName: 'David Chen',
    balance: 12350,
    currency: 'USD',
    status: 'active',
    createdAt: Date.now() - 86400000 * 4
  },
  {
    uid: 'usr_fatima_mansoor',
    email: 'fatima.mansoor@gulfwealth.ae',
    displayName: 'Fatima Mansoor',
    balance: 89120,
    currency: 'USD',
    status: 'unverified',
    createdAt: Date.now() - 86400000 * 2
  }
];

export async function syncBaselineUsers(): Promise<UserProfile[]> {
  try {
    for (const u of BASELINE_USERS) {
      await setDoc(doc(db, 'users', u.uid), u, { merge: true });
    }
  } catch (err) {
    console.warn('Sync baseline users warning:', err);
  }
  return BASELINE_USERS;
}
