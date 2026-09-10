import fs from 'fs';

let content = fs.readFileSync('firestore.rules', 'utf8');

const oldUsersRule = `    match /users/{userId} {
      allow get: if isOwner(userId);
      allow create: if isOwner(userId) && isValidUserProfile(incoming());
      allow update: if isOwner(userId) && 
                    incoming().uid == existing().uid &&
                    incoming().email == existing().email &&
                    incoming().balance == existing().balance &&
                    incoming().status == existing().status &&
                    incoming().createdAt == existing().createdAt &&
                    incoming().diff(existing()).affectedKeys().hasOnly(['displayName', 'currency']);`;

const newUsersRule = `    match /users/{userId} {
      allow get, list: if isOwner(userId) || isAdmin();
      allow create: if isOwner(userId) && isValidUserProfile(incoming());
      allow update: if isAdmin() || (isOwner(userId) && 
                    incoming().uid == existing().uid &&
                    incoming().email == existing().email &&
                    incoming().balance == existing().balance &&
                    incoming().status == existing().status &&
                    incoming().createdAt == existing().createdAt &&
                    incoming().diff(existing()).affectedKeys().hasOnly(['displayName', 'currency']));`;

content = content.replace(oldUsersRule, newUsersRule);

// Now for wallets
const oldWalletsRule = `        allow list: if isOwner(userId);
        allow get: if isOwner(userId);
        // Clients can create wallets with 0 balance, but balance updates must be server-side
        allow create: if isOwner(userId) && isValidWallet(incoming()) && incoming().balance == 0;
        allow update: if false; // Lock down balance updates to Admin SDK
        allow delete: if isOwner(userId);`;

const newWalletsRule = `        allow list, get: if isOwner(userId) || isAdmin();
        // Clients can create wallets with 0 balance, but balance updates must be server-side
        allow create: if isOwner(userId) && isValidWallet(incoming()) && incoming().balance == 0;
        allow update: if isAdmin(); // Lock down balance updates to Admin SDK
        allow delete: if isOwner(userId) || isAdmin();`;

content = content.replace(oldWalletsRule, newWalletsRule);

// Now for transactions
const oldTxRule = `        allow list: if isOwner(userId);
        allow get: if isOwner(userId);
        allow create: if isOwner(userId) && isValidTransaction(incoming());
        
        // Clients can only cancel pending transactions
        allow update: if isOwner(userId) && 
                       existing().status == 'pending' &&
                      incoming().status == 'cancelled' &&
                      incoming().diff(existing()).affectedKeys().hasOnly(['status']);`;

const newTxRule = `        allow list, get: if isOwner(userId) || isAdmin();
        allow create: if isOwner(userId) && isValidTransaction(incoming());
        
        // Clients can only cancel pending transactions, but Admins can update anything
        allow update: if isAdmin() || (isOwner(userId) && 
                       existing().status == 'pending' &&
                      incoming().status == 'cancelled' &&
                      incoming().diff(existing()).affectedKeys().hasOnly(['status']));`;

content = content.replace(oldTxRule, newTxRule);

fs.writeFileSync('firestore.rules', content);
console.log("Patched firestore.rules for admin reads");
