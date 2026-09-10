import fs from 'fs';

let content = fs.readFileSync('src/pages/admin/AdminAuditLogs.tsx', 'utf8');

const oldFetch = `    const fetchLogs = async () => {
      try {
        const idToken = await user?.getIdToken();
        const response = await fetch('/api/admin/audit-logs', {
          headers: { 'Authorization': \`Bearer \${idToken}\` }
        });
        if (!response.ok) throw new Error('Failed to fetch logs');
        const data = await response.json();
        setLogs(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [user]);`;

const newFetch = `    const fetchLogs = async () => {
      try {
        const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
        const { db } = await import('../../lib/firebase');
        
        const q = query(collection(db, 'admin_audit_logs'), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        
        setLogs(snapshot.docs.map(doc => doc.data() as any));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);`;

content = content.replace(oldFetch, newFetch);
fs.writeFileSync('src/pages/admin/AdminAuditLogs.tsx', content);
console.log("Patched AdminAuditLogs.tsx");
