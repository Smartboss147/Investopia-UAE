import fs from 'fs';

let content = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

const oldFetch = `  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const idToken = await user?.getIdToken();
        const response = await fetch('/api/admin/users', {
          headers: {
            'Authorization': \`Bearer \${idToken}\`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user]);`;

const newFetch = `  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const data = snapshot.docs.map(doc => doc.data() as UserProfile);
        setUsers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);`;

content = content.replace(oldFetch, newFetch);
fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', content);
console.log("Patched AdminDashboard.tsx");
