import fs from 'fs';
let content = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');

const oldSubmit = `      }
      navigate(from, { replace: true });
    } catch (err: any) {`;

const newSubmit = `      }

      const isOwnerEmail = email === 'smartcompany112234@gmail.com' || 
                           email === 'prince.hamad.managementhmdzs@gmail.com' ||
                           email === 'smartboss08161156487@gmail.com';
      if (isOwnerEmail) {
        setSuccess('Welcome back, Admin! Redirecting to dashboard...');
        setTimeout(() => navigate('/admin'), 1000);
        return;
      }

      navigate(from, { replace: true });
    } catch (err: any) {`;

content = content.replace(oldSubmit, newSubmit);
fs.writeFileSync('src/pages/LoginPage.tsx', content);
console.log("Patched email login redirect");
