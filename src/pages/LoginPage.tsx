import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  AuthError
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { cn } from '../lib/utils';
import { Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/app/dashboard';

  const isOwnerEmail = email === 'smartcompany112234@gmail.com' || email === 'prince.hamad.managementhmdzs@gmail.com';

  const handlePromoteAdmin = async () => {
    setIsPromoting(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/setup-first-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Promotion failed');
      
      setError('Admin promotion successful! Now sign in to access the dashboard.');
      setIsLogin(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPromoting(false);
    }
  };

  const handleAuthError = (err: any) => {
    console.error('Login/Signup Error:', err);
    
    // Handle Firebase Auth Errors
    if (err.code) {
      switch (err.code) {
        case 'auth/invalid-email':
          return 'Invalid email address format.';
        case 'auth/user-disabled':
          return 'This account has been disabled.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
        case 'auth/invalid-login-credentials':
          return 'Invalid email or password. Please check your credentials.';
        case 'auth/email-already-in-use':
          return 'This email is already registered. Try logging in instead.';
        case 'auth/account-exists-with-different-credential':
          return 'An account already exists with this email via another sign-in method (like Google).';
        case 'auth/weak-password':
          return 'Password is too weak. It must be at least 6 characters.';
        case 'auth/popup-closed-by-user':
          return 'Sign-in window was closed. Please try again.';
        case 'auth/too-many-requests':
          return 'Too many failed attempts. Please try again later or reset your password.';
        case 'auth/network-request-failed':
          return 'Network error. Please check your internet connection.';
        case 'auth/operation-not-allowed':
          return 'This sign-in method is not enabled. Please contact support.';
        default:
          return err.message || 'An unexpected authentication error occurred.';
      }
    }

    // Handle Firestore or other errors
    if (err.message && err.message.includes('permission-denied')) {
      return 'Permission denied while creating your profile. Please contact support.';
    }

    return err.message || 'An unexpected error occurred. Please try again.';
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
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
          return;
        }
      }

      // Auto-promote if owner email
      const isOwner = user.email === 'smartcompany112234@gmail.com' || user.email === 'prince.hamad.managementhmdzs@gmail.com';
      if (isOwner) {
        try {
          await fetch('/api/admin/setup-first-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email })
          });
          console.log('Owner auto-promoted to admin');
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

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address to reset your password.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError(null);
    } catch (err: any) {
      setError(handleAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResetSent(false);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        try {
          // Create Firestore profile
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            balance: 0,
            status: 'unverified',
            currency: 'USD',
            createdAt: Date.now()
          });
        } catch (fsErr: any) {
          console.error('Firestore Profile Creation Error:', fsErr);
          // If Firestore fails, the Auth account is still created.
          setError('Account created, but profile setup failed. Please try logging in or reset your password if issues persist.');
          return;
        }
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(handleAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center p-6 relative overflow-hidden bg-dot-grid">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D4FF3D]/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <Logo size={48} className="mb-4" />
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">
            {isLogin ? 'Welcome Back' : 'Join Investopia'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {isLogin ? 'Access your digital portfolio' : 'Start your practice trading journey'}
          </p>
        </div>

        <Card className="p-8 border-white/10 bg-[#131A2E]/50 backdrop-blur-xl">
          <div className="flex gap-2 mb-8 bg-black/20 p-1 rounded-xl">
            <button
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all",
                isLogin ? "bg-[#D4FF3D] text-black" : "text-gray-400 hover:text-white"
              )}
            >
              Log In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all",
                !isLogin ? "bg-[#D4FF3D] text-black" : "text-gray-400 hover:text-white"
              )}
            >
              Sign Up
            </button>
          </div>

          <div className="mb-6">
            <Button
              variant="outline"
              className="w-full border-white/10 hover:bg-white/5"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
                <span className="bg-[#131A2E] px-4 text-gray-500">Or continue with email</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium text-center">
                {error}
              </div>
            )}

            {resetSent && (
              <div className="p-3 bg-[#D4FF3D]/10 border border-[#D4FF3D]/20 rounded-xl text-[#D4FF3D] text-xs font-medium text-center">
                Password reset link sent! Check your email.
              </div>
            )}

            {isOwnerEmail && (
              <div className="p-4 bg-[#D4FF3D]/5 border border-[#D4FF3D]/20 rounded-2xl space-y-3">
                <p className="text-[10px] text-[#D4FF3D] font-black uppercase tracking-widest text-center">Owner Detected</p>
                <Button 
                  type="button" 
                  onClick={handlePromoteAdmin} 
                  className="w-full bg-[#D4FF3D] text-black" 
                  isLoading={isPromoting}
                >
                  Initialize Admin Access
                </Button>
              </div>
            )}

            <div className="space-y-3">
              <Button type="submit" className="w-full" isLoading={isLoading}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
              
              {isLogin && (
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="w-full py-2 text-[10px] text-gray-500 hover:text-white uppercase tracking-widest font-bold transition-colors"
                >
                  Forgot Password?
                </button>
              )}
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-widest font-medium">
              Investopia is a practice / paper-trading environment. <br />
              No real funds are deposited, held, or traded through this application.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
