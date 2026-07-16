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

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API request failed with status ${response.status}`);
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
    throw new ApiError(response.status, `API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
