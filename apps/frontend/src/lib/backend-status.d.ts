/**
 * Backend status detection utilities
 * Used to determine if the backend is available and show appropriate UI
 */
/**
 * Check if backend is available (client-side)
 * Returns a promise that resolves to true if backend responds, false otherwise
 */
export declare function checkBackendStatus(): Promise<boolean>;
/**
 * Check if backend is available (server-side)
 * Used in server components to conditionally render UI
 * This check MUST be fresh - no caching allowed
 */
export declare function isBackendAvailable(): Promise<boolean>;
//# sourceMappingURL=backend-status.d.ts.map