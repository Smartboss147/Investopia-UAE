import fs from 'fs';

let content = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');

// Replace imports
content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect } from 'react';"
);

content = content.replace(
  "signInWithPopup,",
  "signInWithRedirect,\n  getRedirectResult,"
);

// Add useEffect
const useEffectStr = `
  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          setIsLoading(true);
          await processGoogleUser(result.user);
        }
      } catch (err: any) {
        setError(handleAuthError(err));
        setIsLoading(false);
      }
    };
    checkRedirect();
  }, []);

  const processGoogleUser = async (user: any) => {
    try {
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
            setIsLoading(false);
            setTimeout(() => navigate('/admin'), 1500);
            return;
          }
        } catch (promoteErr) {
          console.error('Auto-promotion failed:', promoteErr);
        }
      }

      setIsLoading(false);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(handleAuthError(err));
      setIsLoading(false);
    }
  };
`;

// Replace handleGoogleSignIn
const newHandleGoogleSignIn = `
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err: any) {
      setError(handleAuthError(err));
      setIsLoading(false);
    }
  };
`;

// We need to carefully replace handleGoogleSignIn and remove the old logic
const handleGoogleSignInRegex = /const handleGoogleSignIn = async \(\) => \{[\s\S]*?(?=const handleSubmit = async)/;

const match = content.match(handleGoogleSignInRegex);
if (match) {
  content = content.replace(handleGoogleSignInRegex, useEffectStr + "\n" + newHandleGoogleSignIn + "\n  ");
  fs.writeFileSync('src/pages/LoginPage.tsx', content);
  console.log("Patched successfully.");
} else {
  console.log("Regex not matched.");
}
