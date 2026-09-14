export const ADMIN_EMAILS = [
  'smartcompany112234@gmail.com',
  'prince.hamad.managementhmdzs@gmail.com',
];

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === normalized);
};
