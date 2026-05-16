import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

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

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const registerApiAuth = (handlers: AuthHandlers) => {
    authHandlers = handlers;
};

const isAuthRoute = (url?: string) => {
    if (!url) return false;

    return [
        '/auth/login/',
        '/auth/register/',
        '/auth/logout/',
        '/auth/token/refresh/',
    ].some((route) => url.includes(route));
};

apiClient.interceptors.request.use((config) => {
    const access = authHandlers.getAccessToken();

    if (access) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${access}`;
    }

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
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