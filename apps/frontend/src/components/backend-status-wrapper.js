"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BackendStatusWrapper;
const react_1 = require("react");
const use_backend_status_1 = require("@/hooks/use-backend-status");
const backend_down_landing_1 = __importDefault(require("./backend-down-landing"));
/**
 * Wrapper component that checks backend status and shows
 * either the normal site or the backend-down landing page
 *
 * CRITICAL: Initial state comes from window.__BACKEND_AVAILABLE__ (set by server)
 * This ensures no flash of wrong content on refresh
 */
function BackendStatusWrapper({ children, initialBackendAvailable = false // Default to false (pessimistic - safer)
 }) {
    // Get initial state from server-set window variable (set in <script> tag before React loads)
    // This MUST match the server render to prevent hydration mismatch
    const [isAvailable, setIsAvailable] = (0, react_1.useState)(() => {
        if (typeof window !== 'undefined') {
            // Priority 1: Read from window.__BACKEND_AVAILABLE__ (set by server in <script> tag)
            if (window.__BACKEND_AVAILABLE__ !== undefined) {
                const serverState = window.__BACKEND_AVAILABLE__;
                console.log('[BackendStatusWrapper] Initial state from window.__BACKEND_AVAILABLE__:', serverState);
                return serverState;
            }
        }
        // Fallback to prop (should not happen if server check worked)
        console.warn('[BackendStatusWrapper] window.__BACKEND_AVAILABLE__ not found, using prop:', initialBackendAvailable);
        return initialBackendAvailable;
    });
    // Only check backend status on client if server says backend is available
    // This prevents unnecessary API calls when backend is already known to be down
    const { isAvailable: clientCheckAvailable, isChecking } = (0, use_backend_status_1.useBackendStatus)();
    // Update state when client-side check completes (only if different from server state)
    // Only update if server initially said backend was available (might have gone down)
    (0, react_1.useEffect)(() => {
        // Only verify if server initially said backend was available
        // If server said backend was down, trust it and don't check again
        if (isAvailable && !isChecking && clientCheckAvailable !== null) {
            if (clientCheckAvailable !== isAvailable) {
                console.log('[BackendStatusWrapper] Client check differs from server state:', {
                    server: isAvailable ? 'Available' : 'Unavailable',
                    client: clientCheckAvailable ? 'Available' : 'Unavailable',
                });
                // Backend was up but now appears down - update state
                setIsAvailable(clientCheckAvailable);
            }
        }
    }, [isChecking, clientCheckAvailable, isAvailable]);
    // Show landing page if backend is down
    if (!isAvailable) {
        return <backend_down_landing_1.default />;
    }
    // Show normal site if backend is available
    return <>{children}</>;
}
//# sourceMappingURL=backend-status-wrapper.js.map