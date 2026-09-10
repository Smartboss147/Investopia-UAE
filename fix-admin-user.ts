import fs from 'fs';

let content = fs.readFileSync('src/pages/admin/AdminUserDetails.tsx', 'utf8');

const oldFetch = `  useEffect(() => {
    const fetchData = async () => {
      try {
        const idToken = await user?.getIdToken();
        const response = await fetch(\`/api/admin/users/\${id}\`, {
          headers: { 'Authorization': \`Bearer \${idToken}\` }
        });
        if (!response.ok) throw new Error('Failed to fetch user');
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (id && user) fetchData();
  }, [id, user]);`;

const newFetch = `  useEffect(() => {
    const fetchData = async () => {
      try {
        const { doc, collection, getDoc, getDocs, orderBy, query } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        
        const userDoc = await getDoc(doc(db, 'users', id!));
        if (!userDoc.exists()) throw new Error('User not found');
        
        const q = query(collection(db, 'users', id!, 'transactions'), orderBy('timestamp', 'desc'));
        const txSnapshot = await getDocs(q);
        
        setData({
          profile: userDoc.data() as UserProfile,
          transactions: txSnapshot.docs.map(d => d.data() as Transaction)
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);`;

content = content.replace(oldFetch, newFetch);
fs.writeFileSync('src/pages/admin/AdminUserDetails.tsx', content);
console.log("Patched AdminUserDetails.tsx fetch");
