import { cookies } from 'next/headers';
import { ApiError, serverApiFetch } from './api';

export const DEVELOPMENT_USER_COOKIE = 'palmpay_dev_user_email';
export const TEST_SESSION_COOKIE = 'palmpay_test_session';

export interface CurrentUser {
  id: string;
  organizationId: string;
  primaryTeamId: string | null;
  employeeId: string | null;
  name: string;
  email: string;
  avatarUrl: string | null;
  status: 'INVITED' | 'ACTIVE' | 'DISABLED';
  locale: string;
  roles: Array<{ code: string; scopeType: 'ORGANIZATION' | 'TEAM'; scopeId: string }>;
  permissions: string[];
}

export async function loadCurrentUser() {
  const cookieStore = await cookies();
  const developmentEmail = cookieStore.get(DEVELOPMENT_USER_COOKIE)?.value;
  const testSession = cookieStore.get(TEST_SESSION_COOKIE)?.value;

  if (!developmentEmail && !testSession) return null;

  try {
    return await serverApiFetch<CurrentUser>('/api/me', {
      headers: testSession ? { Authorization: `Bearer ${testSession}` } : { 'x-dev-user-email': developmentEmail! },
    });
  } catch (error: unknown) {
    if (error instanceof ApiError && [401, 403, 404].includes(error.status)) return null;
    throw error;
  }
}

export async function authenticatedApiHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const developmentEmail = cookieStore.get(DEVELOPMENT_USER_COOKIE)?.value;
  const testSession = cookieStore.get(TEST_SESSION_COOKIE)?.value;
  if (testSession) return { Authorization: `Bearer ${testSession}` };
  return developmentEmail ? { 'x-dev-user-email': developmentEmail } : {};
}
