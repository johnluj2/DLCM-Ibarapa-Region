import { cookies } from 'next/headers';
import { getDb, Profile } from './db';

const COOKIE_NAME = 'dlcm_session_user_id';

export async function getSessionUser(): Promise<Profile | null> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get(COOKIE_NAME)?.value;
    if (!userId) {
      return null;
    }
    const db = getDb();
    const profile = db.profiles.find((p) => p.id === userId);
    return profile || null;
  } catch (error) {
    console.error('Error getting session user:', error);
    return null;
  }
}

export async function setSessionUser(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: userId,
    httpOnly: true,
    path: '/',
    secure: true, // Required for SameSite=None inside preview cross-origin iframe
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'none', // Required for cross-origin iframe
  });
}

export async function clearSessionUser() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
