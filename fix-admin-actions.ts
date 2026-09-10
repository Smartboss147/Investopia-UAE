import fs from 'fs';

let content = fs.readFileSync('src/pages/admin/AdminUserDetails.tsx', 'utf8');

const oldAdjust = `  const handleAdjustBalance = async () => {
    setIsSubmitting(true);
    try {
      const idToken = await user?.getIdToken();
      const requestId = \`adj-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
      
      const response = await fetch(\`/api/admin/users/\${id}/balance-adjustment\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${idToken}\`
        },
        body: JSON.stringify({
          type: adjType,
          amount: parseFloat(adjAmount),
          reason: adjReason,
          internalReference: adjRef,
          requestId
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Adjustment failed');
      }

      setSuccess(true);
      // Refresh data
      const refreshedResponse = await fetch(\`/api/admin/users/\${id}\`, {
        headers: { 'Authorization': \`Bearer \${idToken}\` }
      });
      const json = await refreshedResponse.json();
      setData(json);
      
      setTimeout(() => {
        setIsConfirming(false);
        setSuccess(false);
        setAdjAmount('');
        setAdjReason('');
        setAdjRef('');
      }, 2000);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Adjustment failed');
    } finally {
      setIsSubmitting(false);
    }
  };`;

const newAdjust = `  const handleAdjustBalance = async () => {
    setIsSubmitting(true);
    try {
      const { doc, getDoc, updateDoc, setDoc, collection, getDocs, orderBy, query } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      
      const userRef = doc(db, 'users', id!);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) throw new Error('User not found');
      
      const currentBalance = userSnap.data().balance || 0;
      const amount = parseFloat(adjAmount);
      const newBalance = adjType === 'credit' ? currentBalance + amount : currentBalance - amount;
      
      await updateDoc(userRef, { balance: newBalance });
      
      const txRef = doc(collection(db, 'users', id!, 'transactions'));
      await setDoc(txRef, {
        id: txRef.id,
        userId: id!,
        type: adjType === 'credit' ? 'deposit' : 'withdrawal',
        amount: amount,
        currency: 'USD',
        status: 'completed',
        timestamp: Date.now(),
        adminReference: adjRef,
        adminReason: adjReason
      });

      setSuccess(true);
      
      // Refresh data
      const newUserSnap = await getDoc(userRef);
      const q = query(collection(db, 'users', id!, 'transactions'), orderBy('timestamp', 'desc'));
      const txSnapshot = await getDocs(q);
      
      setData({
        profile: newUserSnap.data() as UserProfile,
        transactions: txSnapshot.docs.map(d => d.data() as Transaction)
      });
      
      setTimeout(() => {
        setIsConfirming(false);
        setSuccess(false);
        setAdjAmount('');
        setAdjReason('');
        setAdjRef('');
      }, 2000);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Adjustment failed');
    } finally {
      setIsSubmitting(false);
    }
  };`;

content = content.replace(oldAdjust, newAdjust);

const oldStatus = `  const handleStatusUpdate = async () => {
    setIsSubmitting(true);
    try {
      const idToken = await user?.getIdToken();
      const response = await fetch(\`/api/admin/users/\${id}/status\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${idToken}\`
        },
        body: JSON.stringify({
          status: suspendAction === 'suspend' ? 'suspended' : 'active',
          reason: suspendReason
        })
      });

      if (!response.ok) throw new Error('Update failed');

      setSuccess(true);
      const refreshedResponse = await fetch(\`/api/admin/users/\${id}\`, {
        headers: { 'Authorization': \`Bearer \${idToken}\` }
      });
      const json = await refreshedResponse.json();
      setData(json);

      setTimeout(() => {
        setIsSuspending(false);
        setSuccess(false);
        setSuspendReason('');
      }, 2000);
    } catch (error) {
      console.error(error);
      alert('Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };`;

const newStatus = `  const handleStatusUpdate = async () => {
    setIsSubmitting(true);
    try {
      const { doc, getDoc, updateDoc, collection, getDocs, orderBy, query } = await import('firebase/firestore');
      const { db } = await import('../../lib/firebase');
      
      const newStatusVal = suspendAction === 'suspend' ? 'suspended' : 'active';
      const userRef = doc(db, 'users', id!);
      await updateDoc(userRef, { status: newStatusVal, statusReason: suspendReason });

      setSuccess(true);
      
      const newUserSnap = await getDoc(userRef);
      const q = query(collection(db, 'users', id!, 'transactions'), orderBy('timestamp', 'desc'));
      const txSnapshot = await getDocs(q);
      
      setData({
        profile: newUserSnap.data() as UserProfile,
        transactions: txSnapshot.docs.map(d => d.data() as Transaction)
      });

      setTimeout(() => {
        setIsSuspending(false);
        setSuccess(false);
        setSuspendReason('');
      }, 2000);
    } catch (error) {
      console.error(error);
      alert('Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };`;

content = content.replace(oldStatus, newStatus);
fs.writeFileSync('src/pages/admin/AdminUserDetails.tsx', content);
console.log("Patched AdminUserDetails.tsx actions");
