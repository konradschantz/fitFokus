import { NextResponse, type NextRequest } from 'next/server';

const COOKIE_KEY = 'fitfokus_user';
const ONE_YEAR = 60 * 60 * 24 * 365;

export function middleware(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_KEY);

  // If valid cookie exists, just continue
  if (cookie) {
    try {
      const parsed = JSON.parse(cookie.value) as { id?: string };
      if (parsed?.id) return NextResponse.next();
    } catch {
      // fall through to regenerate
    }
  }

  // Generate a new user id and pass it along for this request
  const id = globalThis.crypto.randomUUID();

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-fitfokus-user', id);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.cookies.set({
    name: COOKIE_KEY,
    value: JSON.stringify({ id }),
    maxAge: ONE_YEAR,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
  return res;
}

// Apply to all paths by default. If you want to exclude assets, uncomment below.
// export const config = { matcher: ['/((?!_next|.*\.(?:png|jpg|svg|ico|css|js)).*)'] };
