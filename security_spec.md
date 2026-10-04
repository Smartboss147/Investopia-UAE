# Security Specification: Staking

## 1. Data Invariants
- A stake cannot exist without a valid user ID.
- Access to stakes is derived from the user's ownership.
- Stakes cannot be created by users (system-generated rewards/locking).

## 2. The "Dirty Dozen" Payloads (for Stake entity)
1. { "userId": "other-uid", ... } // Spoof user ID
2. { "asset": 123, ... } // Invalid asset type
3. { "amount": "100", ... } // String instead of number
4. { "status": "invalid", ... } // Invalid status
5. { "createdAt": "not-a-timestamp", ... } // Invalid timestamp
6. { "apy": "high", ... } // String for APY
7. { "earned": -10, ... } // Negative earnings
8. { "duration": 100, ... } // Number instead of string
9. { "symbol": "TOOLONGSYMBOLNAME", ... } // Long symbol
10. { "extraField": "malicious" } // Ghost field
11. { } // Missing fields
12. { ... } // Partial data

## 3. The Test Runner (firestore.rules.test.ts)
(To be implemented in test environment)
- Verifies all above payloads are PERMISSION_DENIED.
