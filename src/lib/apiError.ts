import axios from 'axios';
import type { ApiErrorPayload } from './contracts';

export const getErrorMessage = (
    error: unknown,
    fallback = 'An unexpected error occurred.',
) => {
    if (axios.isAxiosError(error)) {
        const payload = error.response?.data as ApiErrorPayload | undefined;

        const fieldErrors =
            payload && typeof payload === 'object'
                ? Object.entries(payload)
                    .filter(([, value]) => Array.isArray(value) && value.length > 0)
                    .map(([field, value]) => {
                        const firstValue = (value as unknown[])[0];
                        return `${field}: ${String(firstValue)}`;
                    })
                : [];

        if (fieldErrors.length > 0) {
            return fieldErrors.join(', ');
        }

        const candidates = [payload?.detail, payload?.message, payload?.error, error.message];

        for (const candidate of candidates) {
            if (typeof candidate === 'string' && candidate.trim()) {
                return candidate;
            }
        }
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    return fallback;
};