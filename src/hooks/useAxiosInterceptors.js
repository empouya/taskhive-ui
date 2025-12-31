// src/hooks/useAxiosInterceptors.js
import { useEffect } from "react";
import { useAuth} from '../app/providers/AuthProvider';
import axios from "axios";

export default function useAxiosInterceptors() {
    const api = axios.create({
        baseURL: "http://localhost:8000/api/v1",
        withCredentials: true,
    });
    const { access, refreshAccessToken, setAccess, logout } = useAuth();

    useEffect(() => {
        // Request interceptor: attach access
        const reqInterceptor = api.interceptors.request.use((config) => {
            if (access) {
                config.headers.Authorization = `Bearer ${access}`;
            }
            return config;
        }, (error) => Promise.reject(error));

        // Response interceptor: handle 401
        const resInterceptor = api.interceptors.response.use((res) => res, async (error) => {
            const originalRequest = error.config;
            if (error.response && error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                // try to refresh
                const newAccess = await refreshAccessToken();
                if (newAccess) {
                    setAccess(newAccess);
                    originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                    return api(originalRequest);
                } else {
                    // could not refresh -> logout
                    logout();
                    return Promise.reject(error);
                }
            }
            return Promise.reject(error);
        });

        return () => {
            api.interceptors.request.eject(reqInterceptor);
            api.interceptors.response.eject(resInterceptor);
        };
    }, [access, refreshAccessToken, setAccess, logout]);
}
