import fs from 'fs';

let content = fs.readFileSync('firestore.rules', 'utf8');

const insertLog = `    match /admin_audit_logs/{logId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
  }
}`;

content = content.replace("  }\n}", insertLog);
fs.writeFileSync('firestore.rules', content);
console.log("Patched firestore.rules for audit logs");
