import axios from 'axios';

export const getErrorMessage = (
    error: unknown,
    fallback = 'An unexpected error occurred.',
) => {
    if (axios.isAxiosError(error)) {
        const detail =
            error.response?.data &&
                typeof error.response.data === 'object' &&
                'detail' in error.response.data
                ? error.response.data.detail
                : null;

        if (typeof detail === 'string' && detail.trim()) {
            return detail;
        }

        if (typeof error.message === 'string' && error.message.trim()) {
            return error.message;
        }
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    return fallback;
};