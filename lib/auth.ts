import { cookies, headers } from 'next/headers';
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
      console.warn('Invalid user cookie, will try header fallback', error);
    }
  }

  // Middleware passes the generated id via a request header on first visit
  const hdrs = headers();
  const headerId = hdrs.get('x-fitfokus-user');
  if (headerId) return headerId;

  // Last resort: generate an ephemeral id (no cookie write here)
  // Route handlers can still persist if needed, but pages will just use this temporarily.
  return randomUUID();
}
