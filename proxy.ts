import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isValidSessionCookie } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  if (!(await isValidSessionCookie(session))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!login|api/cron|manifest\\.webmanifest|icon|apple-icon|_next/static|_next/image|favicon\\.ico).*)',
  ],
};
