import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
/**
 * Interceptor to set Vary headers and Cache-Control for locale-dependent endpoints
 * This ensures that responses are cached per locale and not shared between languages
 *
 * Only applies to public endpoints (decorated with @Public()) since these
 * return content that varies by locale (bilingual fields).
 */
export declare class LocaleCacheInterceptor implements NestInterceptor {
    private reflector;
    constructor(reflector: Reflector);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
//# sourceMappingURL=locale-cache.interceptor.d.ts.map