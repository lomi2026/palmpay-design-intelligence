const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiError(response: Response) {
  let message = `API request failed with status ${response.status}`;
  try {
    const body = await response.json() as { message?: string | string[] };
    if (Array.isArray(body.message)) message = body.message.join('；');
    else if (body.message) message = body.message;
  } catch {}
  return new ApiError(response.status, message);
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  });

  if (!response.ok) {
    throw await apiError(response);
  }

  return response.json() as Promise<T>;
}

export async function serverApiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const serverApiBaseUrl = process.env.API_BASE_URL ?? apiBaseUrl;
  const response = await fetch(`${serverApiBaseUrl}${path}`, {
    ...init,
    cache: 'no-store',
    headers: { Accept: 'application/json', ...init?.headers },
  });

  if (!response.ok) {
    throw await apiError(response);
  }

  return response.json() as Promise<T>;
}

export async function optionalServerApiFetch<T>(
  path: string,
  init: RequestInit | undefined,
  fallback: T,
  timeoutMs = 3500,
): Promise<T> {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const signal = init?.signal ? AbortSignal.any([init.signal, timeoutSignal]) : timeoutSignal;

  try {
    return await serverApiFetch<T>(path, { ...init, signal });
  } catch {
    return fallback;
  }
}
