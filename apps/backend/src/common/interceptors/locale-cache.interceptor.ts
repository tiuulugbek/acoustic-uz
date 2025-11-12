import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Interceptor to set Vary headers and Cache-Control for locale-dependent endpoints
 * This ensures that responses are cached per locale and not shared between languages
 * 
 * Only applies to public endpoints (decorated with @Public()) since these
 * return content that varies by locale (bilingual fields).
 */
@Injectable()
export class LocaleCacheInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Check if this is a public endpoint (locale-dependent)
    // Public endpoints return bilingual content that varies by locale
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Only apply cache headers to public endpoints (locale-dependent content)
    if (isPublic) {
      // Set Vary headers to indicate that responses vary by locale
      // This tells caches that different responses should be cached for different locales
      const varyHeaders = ['Cookie', 'Accept-Language', 'X-Locale'];
      const existingVary = response.getHeader('Vary');
      if (existingVary) {
        // Append to existing Vary header
        const existingHeaders = Array.isArray(existingVary)
          ? existingVary
          : existingVary.toString().split(',').map((h: string) => h.trim());
        const allHeaders = [...new Set([...existingHeaders, ...varyHeaders])];
        response.setHeader('Vary', allHeaders.join(', '));
      } else {
        response.setHeader('Vary', varyHeaders.join(', '));
      }

      // Set Cache-Control to prevent caching (or use private with short max-age)
      // Since locale can change via cookie, we don't want stale cached responses
      response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      response.setHeader('Pragma', 'no-cache');
      response.setHeader('Expires', '0');
    }

    return next.handle().pipe(
      map((data) => {
        // Return data as-is, headers are already set
        return data;
      }),
    );
  }
}

