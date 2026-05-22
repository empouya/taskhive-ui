import axios, {
    AxiosError,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from 'axios';
// import { generateIdempotencyKey, generateTraceId, isMutableMethod } from './requestMeta';


export const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ---------------------------------------------------------------------------
// Auth handler registration (set by AuthProvider at runtime)
// ---------------------------------------------------------------------------

type AuthHandlers = {
    getAccessToken: () => string | null;
    refreshAccessToken: () => Promise<string | null>;
    logout: () => Promise<void> | void;
};

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let authHandlers: AuthHandlers = {
    getAccessToken: () => null,
    refreshAccessToken: async () => null,
    logout: () => undefined,
};

let refreshPromise: Promise<string | null> | null = null;

export const registerApiAuth = (handlers: AuthHandlers) => {
    authHandlers = handlers;
};

// ---------------------------------------------------------------------------
// JSend envelope shape
// ---------------------------------------------------------------------------

interface JSendSuccess<T> {
    status: 'success';
    data: T;
}

/**
 * Returns true when the response body looks like a JSend success envelope.
 * The backend wraps all successful JSON responses in { status: "success", data: ... }.
 * 204 No Content responses have no body, so we skip unwrapping for those.
 */
const isJSendSuccess = (data: unknown): data is JSendSuccess<unknown> =>
    data !== null &&
    typeof data === 'object' &&
    (data as Record<string, unknown>)['status'] === 'success' &&
    'data' in (data as Record<string, unknown>);

// ---------------------------------------------------------------------------
// Auth route detection (skip refresh for these)
// ---------------------------------------------------------------------------

const AUTH_ROUTES = [
    '/auth/login/',
    '/auth/register/',
    '/auth/logout/',
    '/auth/token/refresh/',
];

const isAuthRoute = (url?: string): boolean => {
    if (!url) return false;
    return AUTH_ROUTES.some((route) => url.includes(route));
};

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // sends HttpOnly refresh_token cookie automatically
    headers: {
        'Content-Type': 'application/json',
    },
});

// ---------------------------------------------------------------------------
// Request interceptor — attach Bearer token, X-Trace-ID and Idempotency-Key
// ---------------------------------------------------------------------------

apiClient.interceptors.request.use((config) => {
    config.headers = config.headers ?? {};

    // Attach Bearer token when available
    // Only set Authorization if the caller has not already provided one
    if (!config.headers['Authorization']) {
        const access = authHandlers.getAccessToken();
        if (access) {
            config.headers['Authorization'] = `Bearer ${access}`;
        }
    }

    // X-Trace-ID — attach on every request; preserve if caller already set one
    // config.headers['X-Trace-ID'] = generateTraceId(
    //     config.headers['X-Trace-ID'] as string | undefined,
    // );

    // Idempotency-Key — attach only on mutable methods (POST, PUT, PATCH)
    // if (isMutableMethod(config.method)) {
    //     // Preserve if caller has already set one for explicit retry scenarios
    //     if (!config.headers['Idempotency-Key']) {
    //         config.headers['Idempotency-Key'] = generateIdempotencyKey();
    //     }
    // }

    return config;
});

// ---------------------------------------------------------------------------
// Response interceptor — unwrap JSend envelope
// ---------------------------------------------------------------------------

apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // 204 No Content — nothing to unwrap
        if (response.status === 204 || response.data === undefined || response.data === null) {
            return response;
        }

        // Unwrap JSend success envelope transparently
        if (isJSendSuccess(response.data)) {
            response.data = response.data.data;
        }

        return response;
    },

    // ---------------------------------------------------------------------------
    // Error interceptor — 401 → attempt token refresh once, then logout
    // ---------------------------------------------------------------------------
    async (error: AxiosError) => {
        const originalRequest = error.config as RetriableRequestConfig | undefined;

        if (
            !originalRequest ||
            error.response?.status !== 401 ||
            originalRequest._retry ||
            isAuthRoute(originalRequest.url)
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            if (!refreshPromise) {
                refreshPromise = authHandlers
                    .refreshAccessToken()
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            const newAccess = await refreshPromise;

            if (!newAccess) {
                await authHandlers.logout();
                return Promise.reject(error);
            }

            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;

            return apiClient(originalRequest);
        } catch (refreshError) {
            await authHandlers.logout();
            return Promise.reject(refreshError);
        }
    },
);