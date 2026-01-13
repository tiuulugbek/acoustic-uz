interface BackendStatusWrapperProps {
    children: React.ReactNode;
    initialBackendAvailable?: boolean;
}
/**
 * Wrapper component that checks backend status and shows
 * either the normal site or the backend-down landing page
 *
 * CRITICAL: Initial state comes from window.__BACKEND_AVAILABLE__ (set by server)
 * This ensures no flash of wrong content on refresh
 */
export default function BackendStatusWrapper({ children, initialBackendAvailable }: BackendStatusWrapperProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=backend-status-wrapper.d.ts.map