import axios from 'axios';
import type { ApiErrorPayload } from './contracts';

export const getErrorMessage = (
    error: unknown,
    fallback = 'An unexpected error occurred.',
) => {
    if (axios.isAxiosError(error)) {
        const payload = error.response?.data as ApiErrorPayload | undefined;

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