"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBackendStatus = useBackendStatus;
const react_1 = require("react");
const backend_status_1 = require("@/lib/backend-status");
/**
 * React hook to check backend status on client
 * Returns the current backend status and loading state
 */
function useBackendStatus() {
    // Initialize with server-set state if available
    const [isAvailable, setIsAvailable] = (0, react_1.useState)(() => {
        if (typeof window !== 'undefined' && window.__BACKEND_AVAILABLE__ !== undefined) {
            return window.__BACKEND_AVAILABLE__;
        }
        return null;
    });
    const [isChecking, setIsChecking] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        let mounted = true;
        async function checkStatus() {
            if (!mounted)
                return;
            setIsChecking(true);
            try {
                const available = await (0, backend_status_1.checkBackendStatus)();
                if (mounted) {
                    setIsAvailable(available);
                    setIsChecking(false);
                }
            }
            catch (error) {
                // Silently handle errors - backend is down
                if (mounted) {
                    setIsAvailable(false);
                    setIsChecking(false);
                }
            }
        }
        // Only verify if initial state suggests backend might be available
        // If initial state is false, don't check (backend is confirmed down)
        const initialState = typeof window !== 'undefined' && window.__BACKEND_AVAILABLE__;
        if (initialState === true || initialState === undefined) {
            // Server said backend is up OR state is unknown - verify with API call
            checkStatus();
            // Check periodically (every 30 seconds) to detect when backend goes down or comes back online
            const interval = setInterval(checkStatus, 30000);
            return () => {
                mounted = false;
                clearInterval(interval);
            };
        }
        else {
            // Server confirmed backend is down - don't check again
            setIsChecking(false);
            return () => {
                mounted = false;
            };
        }
    }, []);
    return { isAvailable, isChecking };
}
//# sourceMappingURL=use-backend-status.js.map