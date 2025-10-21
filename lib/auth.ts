import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

const COOKIE_KEY = 'fitfokus_user';
const ONE_YEAR = 60 * 60 * 24 * 365;

type UserCookie = {
  id: string;
};

export function getOrCreateUserId(): string {
  const cookieStore = cookies();
  const existing = cookieStore.get(COOKIE_KEY);
  if (existing) {
    try {
      const parsed = JSON.parse(existing.value) as UserCookie;
      if (parsed.id) return parsed.id;
    } catch (error) {
      console.warn('Invalid user cookie, regenerating', error);
    }
  }
  const id = randomUUID();
  cookieStore.set({
    name: COOKIE_KEY,
    value: JSON.stringify({ id }),
    maxAge: ONE_YEAR,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
  return id;
}
