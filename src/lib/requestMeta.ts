/**
 * Generates a UUID v4 string using the Web Crypto API.
 * Available in all modern browsers and Node 19+.
 */
const uuid = (): string => crypto.randomUUID();

/**
 * Generates a trace ID in the format the backend expects:
 *   X-Trace-ID: req-<uuid>
 *
 * If the caller already provided a trace ID (e.g. for correlated
 * requests), that value is returned unchanged.
 */
export const generateTraceId = (existing?: string | null): string =>
    existing ?? `req-${uuid()}`;

/**
 * Generates a fresh idempotency key (plain UUID v4).
 * Should be created once per logical user action and reused
 * only on explicit retries of that same action.
 *
 * Used as:
 *   Idempotency-Key: <uuid>
 */
export const generateIdempotencyKey = (): string => uuid();

/**
 * HTTP methods that mutate state and therefore require an Idempotency-Key.
 * GET, DELETE, HEAD, OPTIONS are excluded per the backend contract.
 */
const MUTABLE_METHODS = new Set(['POST', 'PUT', 'PATCH']);

export const isMutableMethod = (method?: string): boolean =>
    MUTABLE_METHODS.has((method ?? '').toUpperCase());