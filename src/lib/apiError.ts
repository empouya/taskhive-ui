import axios from 'axios';

/**
 * RFC 7807 Problem Details shape returned by the TaskHive backend.
 */
export interface ProblemDetails {
    type?: string;
    title?: string;
    status?: number;
    detail?: string;
    instance?: string;
    invalid_params?: Array<{ name: string; reason: string }>;
    trace_id?: string;
}

/**
 * Extracts a user-facing message from any thrown value.
 *
 * Priority order:
 *  1. RFC 7807 invalid_params  → "field: reason, …"
 *  2. RFC 7807 detail
 *  3. RFC 7807 title
 *  4. Legacy flat-object fields (detail / message / error)
 *  5. Axios network message
 *  6. Plain Error message
 *  7. Provided fallback
 */
export const getErrorMessage = (
    error: unknown,
    fallback = 'An unexpected error occurred.',
): string => {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as ProblemDetails | Record<string, unknown> | undefined;

        if (data && typeof data === 'object') {
            // 1. RFC 7807 invalid_params
            const invalidParams = (data as ProblemDetails).invalid_params;
            if (Array.isArray(invalidParams) && invalidParams.length > 0) {
                return invalidParams
                    .map((p) => `${p.name}: ${p.reason}`)
                    .join(', ');
            }

            // 2. RFC 7807 detail
            const detail = (data as ProblemDetails).detail;
            if (typeof detail === 'string' && detail.trim()) {
                return detail.trim();
            }

            // 3. RFC 7807 title
            const title = (data as ProblemDetails).title;
            if (typeof title === 'string' && title.trim()) {
                return title.trim();
            }

            // 4. Legacy flat-object fallbacks
            const legacyCandidates = [
                (data as Record<string, unknown>)['message'],
                (data as Record<string, unknown>)['error'],
            ];
            for (const candidate of legacyCandidates) {
                if (typeof candidate === 'string' && candidate.trim()) {
                    return candidate.trim();
                }
            }

            // 5. Array-style field errors  e.g. { email: ["This field is required."] }
            const fieldErrors = Object.entries(data)
                .filter(([, value]) => Array.isArray(value) && (value as unknown[]).length > 0)
                .map(([field, value]) => {
                    const first = (value as unknown[])[0];
                    return `${field}: ${String(first)}`;
                });

            if (fieldErrors.length > 0) {
                return fieldErrors.join(', ');
            }
        }

        // 6. Axios network-level message
        if (error.message?.trim()) {
            return error.message.trim();
        }
    }

    // 7. Plain JS Error
    if (error instanceof Error && error.message.trim()) {
        return error.message.trim();
    }

    return fallback;
};

/**
 * Returns the raw ProblemDetails object if the error is an RFC 7807 response,
 * otherwise returns null. Useful for components that need to inspect trace_id
 * or invalid_params directly.
 */
export const getProblemDetails = (error: unknown): ProblemDetails | null => {
    if (!axios.isAxiosError(error)) return null;
    const data = error.response?.data;
    if (data && typeof data === 'object' && ('detail' in data || 'invalid_params' in data || 'type' in data)) {
        return data as ProblemDetails;
    }
    return null;
};