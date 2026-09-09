/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Speaker {
  id: string;
  name: string;
  role: string;
  organization: string;
  image: string;
}

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'trade' | 'reward' | 'adjustment';

export type AdminRole = 'super_admin' | 'admin' | 'support' | 'auditor';

export interface AuditLogEntry {
  id: string;
  adminUserId: string;
  adminEmail: string;
  targetUserId: string;
  targetEmail: string;
  previousBalance: number;
  adjustmentAmount: number;
  newBalance: number;
  adjustmentType: 'credit' | 'debit';
  reason: string;
  internalReference: string;
  timestamp: number;
  requestId: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
  balance: number;
  currency: string;
  status: 'active' | 'suspended' | 'unverified';
  createdAt: number;
}

export interface Wallet {
  id: string;
  coin: string;
  symbol: string;
  balance: number;
  address: string;
  network: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  coin: string;
  status: TransactionStatus;
  timestamp: number;
  description?: string;
  txHash?: string;
}

export interface MarketCoin {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  sparkline?: number[];
}

export interface TradeOrder {
  id: string;
  userId: string;
  coin: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  price: number;
  amount: number;
  status: 'open' | 'filled' | 'cancelled';
  timestamp: number;
}

export interface PriceAlert {
  id: string;
  userId: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: number;
}
