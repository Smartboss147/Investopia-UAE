import fs from 'fs';
let content = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');

const handleReset = `
  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address to reset your password.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setResetSent(false);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err: any) {
      setError(handleAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {`;

content = content.replace("const handleGoogleSignIn = async () => {", handleReset);
fs.writeFileSync('src/pages/LoginPage.tsx', content);
console.log("done");
