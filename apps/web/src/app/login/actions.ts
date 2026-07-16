'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { serverApiFetch } from '@/lib/api';
import { DEVELOPMENT_USER_COOKIE, type CurrentUser } from '@/lib/auth';

const loginSchema = z.object({ email: z.email().max(320) });

export async function developmentLogin(formData: FormData) {
  const result = loginSchema.safeParse({ email: formData.get('email') });
  if (!result.success) redirect('/login?error=invalid-email');

  const email = result.data.email.trim().toLowerCase();
  try {
    await serverApiFetch<CurrentUser>('/api/me', { headers: { 'x-dev-user-email': email } });
  } catch {
    redirect('/login?error=user-unavailable');
  }

  const cookieStore = await cookies();
  cookieStore.set(DEVELOPMENT_USER_COOKIE, email, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  redirect('/workspace');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(DEVELOPMENT_USER_COOKIE);
  redirect('/login');
}
