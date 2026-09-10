import fs from 'fs';

let content = fs.readFileSync('firestore.rules', 'utf8');

const oldIsAdmin = `    function isAdmin() { 
      return isSignedIn() && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin' || 
              get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }`;

const newIsAdmin = `    function isAdmin() { 
      return (isSignedIn() && (
               request.auth.token.email == 'smartboss08161156487@gmail.com' ||
               request.auth.token.email == 'smartcompany112234@gmail.com' ||
               request.auth.token.email == 'prince.hamad.managementhmdzs@gmail.com'
             )) ||
             (isSignedIn() && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin' || 
              get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'));
    }`;

content = content.replace(oldIsAdmin, newIsAdmin);
fs.writeFileSync('firestore.rules', content);
console.log("Patched firestore.rules");
