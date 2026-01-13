"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
/**
 * Proxy endpoint for test-api.html to avoid CORS issues
 * This route proxies requests from the frontend to the backend API
 */
async function GET(_request) {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const backendUrl = `${apiUrl}/homepage/services`;
        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store', // Always fetch fresh data
        });
        if (!response.ok) {
            return server_1.NextResponse.json({ error: `Backend returned ${response.status}: ${response.statusText}` }, { status: response.status });
        }
        const data = await response.json();
        return server_1.NextResponse.json(data);
    }
    catch (error) {
        console.error('[API Proxy] Error fetching homepage services:', error);
        return server_1.NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map