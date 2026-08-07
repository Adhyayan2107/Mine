'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSessionCookieValue } from '@/lib/auth';

export async function login(formData: FormData): Promise<void> {
  const password = formData.get('password');
  if (password !== process.env.APP_PASSWORD) {
    redirect('/login?error=1');
  }

  const cookieStore = await cookies();
  cookieStore.set('session', await createSessionCookieValue(), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  });
  redirect('/dashboard');
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/login');
}
