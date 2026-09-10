import fs from 'fs';

let content = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');

// Revert imports
content = content.replace(
  "import React, { useState, useEffect } from 'react';",
  "import React, { useState } from 'react';"
);

content = content.replace(
  "signInWithRedirect,\n  getRedirectResult,",
  "signInWithPopup,"
);

// We need to replace from useEffect(() => { ... down to handleGoogleSignIn
const targetRegex = /useEffect\(\(\) => \{[\s\S]*?const handleGoogleSignIn = async \(\) => \{[\s\S]*?\}\s*\};\s*const handleSubmit/m;

const restoredCode = `const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if profile exists
      const profileDoc = await getDoc(doc(db, 'users', user.uid));
      if (!profileDoc.exists()) {
        try {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            balance: 0,
            status: 'unverified',
            currency: 'USD',
            createdAt: Date.now()
          });
        } catch (fsErr: any) {
          console.error('Firestore Google Profile Error:', fsErr);
          setError('Logged in via Google, but profile setup failed. Please refresh or contact support.');
          setIsLoading(false);
          return;
        }
      }

      // Auto-promote if owner email
      const isOwner = user.email === 'smartcompany112234@gmail.com' || 
                      user.email === 'prince.hamad.managementhmdzs@gmail.com' ||
                      user.email === 'smartboss08161156487@gmail.com';
      
      if (isOwner) {
        try {
          const res = await fetch('/api/admin/setup-first-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email })
          });
          if (res.ok) {
            // Force token refresh to include the new admin claim
            await user.getIdToken(true);
            setSuccess('Welcome back, Admin! Redirecting to dashboard...');
            setTimeout(() => navigate('/admin'), 1500);
            return;
          }
        } catch (promoteErr) {
          console.error('Auto-promotion failed:', promoteErr);
        }
      }

      navigate(from, { replace: true });
    } catch (err: any) {
      setError(handleAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit`;

content = content.replace(targetRegex, restoredCode);

fs.writeFileSync('src/pages/LoginPage.tsx', content);
console.log("Reverted successfully.");
