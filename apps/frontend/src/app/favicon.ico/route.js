"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
// Simple favicon handler to prevent 404 errors
// Returns a minimal 1x1 transparent PNG
async function GET() {
    // Return a minimal transparent 1x1 PNG
    const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    return new server_1.NextResponse(transparentPng, {
        headers: {
            'Content-Type': 'image/x-icon',
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    });
}
//# sourceMappingURL=route.js.map