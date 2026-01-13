import { cookies } from 'next/headers';

const ADMIN_COOKIE_NAME = 'shop_admin_session';
const DEFAULT_PASSWORD = 'admin123';

export async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME);
  
  // In a real app, this would verify a JWT or session ID.
  // For this local demo, we just check if the cookie exists and matches our "token".
  return session?.value === 'authenticated_admin_user';
}

export async function loginAdmin(password: string) {
  const correctPassword = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
  
  if (password === correctPassword) {
    const cookieStore = await cookies();
    // Set a simple cookie
    cookieStore.set(ADMIN_COOKIE_NAME, 'authenticated_admin_user', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    return true;
  }
  
  return false;
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
