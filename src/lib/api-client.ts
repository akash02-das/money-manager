/**
 * Money Manager - Production API Client
 * Handles communication with the NestJS backend, JWT authentication,
 * token rotation, standard envelope unwrapping, and resilient error parsing.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const ACCESS_TOKEN_KEY = 'money_manager_access_token';
const REFRESH_TOKEN_KEY = 'money_manager_refresh_token';

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  data: T;
  message?: string;
  error?: string;
}

export class ApiError extends Error {
  statusCode: number;
  errorName?: string;

  constructor(message: string, statusCode = 500, errorName?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorName = errorName;
  }
}

// Token Storage Helpers (Client-side memory/storage)
export const tokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setAccessToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string | null) => void) {
  refreshSubscribers.push(cb);
}

/**
 * Attempts to exchange the stored refresh token for a new token pair
 */
async function refreshAuthTokens(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    tokenStorage.clearTokens();
    return null;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      tokenStorage.clearTokens();
      return null;
    }

    const payload: ApiResponse<{ accessToken: string; refreshToken: string }> =
      await res.json();

    if (payload.data?.accessToken) {
      tokenStorage.setAccessToken(payload.data.accessToken);
      if (payload.data.refreshToken) {
        tokenStorage.setRefreshToken(payload.data.refreshToken);
      }
      return payload.data.accessToken;
    }

    tokenStorage.clearTokens();
    return null;
  } catch {
    tokenStorage.clearTokens();
    return null;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, skipAuth = false, headers = {}, ...customConfig } = options;

  let url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = !skipAuth ? tokenStorage.getAccessToken() : null;

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...customConfig,
    headers: reqHeaders,
    credentials: 'include',
  };

  try {
    let response = await fetch(url, config);

    // If 401 Unauthorized, attempt token refresh and retry request
    if (response.status === 401 && !skipAuth && tokenStorage.getRefreshToken()) {
      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await refreshAuthTokens();
        isRefreshing = false;
        onRefreshed(newToken);

        if (newToken) {
          reqHeaders['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(url, { ...config, headers: reqHeaders });
        }
      } else {
        // Wait for the ongoing refresh to finish
        const retryToken = await new Promise<string | null>((resolve) => {
          addRefreshSubscriber((t) => resolve(t));
        });

        if (retryToken) {
          reqHeaders['Authorization'] = `Bearer ${retryToken}`;
          response = await fetch(url, { ...config, headers: reqHeaders });
        }
      }
    }

    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}`;
      let errorName = 'ApiError';

      try {
        const errorJson = await response.json();
        if (errorJson.message) {
          errorMessage = Array.isArray(errorJson.message)
            ? errorJson.message.join(', ')
            : errorJson.message;
        }
        if (errorJson.error) {
          errorName = errorJson.error;
        }
      } catch {
        // Not a JSON error
      }

      throw new ApiError(errorMessage, response.status, errorName);
    }

    // 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    const json = await response.json();

    // If wrapped in our standard backend envelope ({ success, statusCode, data }), unwrap data
    if (json && typeof json === 'object' && 'data' in json && 'success' in json) {
      return json.data as T;
    }

    return json as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Network error';
    throw new ApiError(message, 0, 'NetworkError');
  }
}

export const apiClient = {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'DELETE' });
  },

  async isBackendAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        cache: 'no-store',
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};

