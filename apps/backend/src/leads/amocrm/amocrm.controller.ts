import { Controller, Get, Query, Res, UseGuards, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AmoCRMService } from './amocrm.service';
import { SettingsService } from '../../settings/settings.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

@ApiTags('amocrm')
@Controller('amocrm')
export class AmoCRMController {
  constructor(
    private amoCrmService: AmoCRMService,
    private settingsService: SettingsService,
    private configService: ConfigService,
    private httpService: HttpService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('authorize')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Redirect to AmoCRM OAuth authorization' })
  @ApiResponse({ status: 302, description: 'Redirect to AmoCRM OAuth page' })
  async getAuthorizationUrl(@Res({ passthrough: false }) res: Response) {
    console.log('[AmoCRM] Authorization request received');
    console.log('[AmoCRM] Request headers:', JSON.stringify(res.req.headers, null, 2));
    
    // Disable ALL caching for this endpoint - critical for OAuth flow
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.removeHeader('ETag'); // Remove ETag to prevent 304 responses
    res.removeHeader('Last-Modified'); // Remove Last-Modified to prevent 304 responses
    
    const settings = await this.settingsService.get();
    
    if (!settings.amocrmDomain || !settings.amocrmClientId) {
      console.log('[AmoCRM] Missing configuration, redirecting to admin');
      return res.redirect(`${this.configService.get('ADMIN_URL') || 'http://localhost:3002'}/settings?error=not_configured`);
    }

    // Clean domain: remove protocol, trim, remove all slashes
    let cleanDomain = String(settings.amocrmDomain).trim();
    
    // Remove protocol (http:// or https://) - case insensitive, multiple times if needed
    cleanDomain = cleanDomain.replace(/^https?:\/\//gi, '');
    cleanDomain = cleanDomain.replace(/https?:\/\//gi, ''); // Remove if appears anywhere
    
    // Remove all slashes
    cleanDomain = cleanDomain.replace(/\//g, '');
    
    // Remove leading/trailing dots and slashes
    cleanDomain = cleanDomain.replace(/^[.\/]+|[.\/]+$/g, '');
    
    // Log for debugging
    console.log('[AmoCRM] Original domain:', settings.amocrmDomain);
    console.log('[AmoCRM] Cleaned domain:', cleanDomain);
    
    // Generate CSRF state parameter
    const state = crypto.randomBytes(32).toString('hex');
    
    // Set state in HTTP-only cookie (valid for 10 minutes)
    res.cookie('amocrm_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000, // 10 minutes
    });
    
    const redirectUri = `${this.configService.get('APP_URL') || 'http://localhost:3001'}/api/amocrm/callback`;
    const authUrl = `https://${cleanDomain}/oauth2/authorize?client_id=${settings.amocrmClientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
    
    console.log('[AmoCRM] Redirecting to:', authUrl);
    console.log('[AmoCRM] State parameter:', state);
    console.log('[AmoCRM] Redirect URI:', redirectUri);
    console.log('[AmoCRM] Setting explicit 302 redirect with Location header');

    // CRITICAL: Explicitly set status and Location header, then end response
    // Do NOT return anything - NestJS will try to serialize return values
    res.status(302);
    res.setHeader('Location', authUrl);
    res.end();
    return; // Explicit return with no value to prevent NestJS serialization
  }

  @Get('callback')
  @ApiOperation({ summary: 'AmoCRM OAuth callback endpoint' })
  @ApiResponse({ status: 200, description: 'Authorization successful' })
  async callback(@Query('code') code: string, @Query('state') state: string, @Req() req: Request, @Res() res: Response) {
    // Check for error parameter from AmoCRM
    if (req.query.error) {
      return res.redirect(`${this.configService.get('ADMIN_URL') || 'http://localhost:3002'}/settings?error=${req.query.error}`);
    }

    if (!code) {
      return res.redirect(`${this.configService.get('ADMIN_URL') || 'http://localhost:3002'}/settings?error=no_code`);
    }

    // CSRF Protection: Verify state parameter
    const cookieState = req.cookies?.amocrm_oauth_state;
    if (!state || !cookieState || state !== cookieState) {
      console.error('[AmoCRM] CSRF protection failed: state mismatch');
      return res.redirect(`${this.configService.get('ADMIN_URL') || 'http://localhost:3002'}/settings?error=csrf_failed`);
    }

    // Clear state cookie after verification
    res.clearCookie('amocrm_oauth_state');

    try {
      const settings = await this.settingsService.get();
      
      if (!settings.amocrmDomain || !settings.amocrmClientId || !settings.amocrmClientSecret) {
        return res.redirect(`${this.configService.get('ADMIN_URL') || 'http://localhost:3002'}/settings?error=not_configured`);
      }

      const redirectUri = `${this.configService.get('APP_URL') || 'http://localhost:3001'}/api/amocrm/callback`;
      
      // Clean domain: remove protocol, trim, remove all slashes
      let cleanDomain = settings.amocrmDomain.trim();
      cleanDomain = cleanDomain.replace(/^https?:\/\//i, ''); // Remove http:// or https://
      cleanDomain = cleanDomain.replace(/\/+/g, ''); // Remove ALL slashes
      cleanDomain = cleanDomain.replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes (extra safety)
      
      // Exchange authorization code for tokens
      const response = await firstValueFrom(
        this.httpService.post(
          `https://${cleanDomain}/oauth2/access_token`,
          {
            client_id: settings.amocrmClientId,
            client_secret: settings.amocrmClientSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      );

      const { access_token, refresh_token, expires_in } = response.data;

      // Calculate token expiration time
      const tokenExpiresAt = expires_in 
        ? new Date(Date.now() + expires_in * 1000)
        : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default 24 hours

      // Save tokens to settings
      await this.settingsService.update({
        amocrmAccessToken: access_token,
        amocrmRefreshToken: refresh_token,
        amocrmTokenExpiresAt: tokenExpiresAt,
      });

      return res.redirect(`${this.configService.get('ADMIN_URL') || 'http://localhost:3002'}/settings?success=amocrm_connected`);
    } catch (error: any) {
      console.error('AmoCRM OAuth callback error:', error);
      
      // Handle specific error cases
      let errorMessage = 'oauth_failed';
      if (error.response?.status === 400) {
        errorMessage = 'invalid_request';
      } else if (error.response?.status === 401) {
        errorMessage = 'unauthorized';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      return res.redirect(`${this.configService.get('ADMIN_URL') || 'http://localhost:3002'}/settings?error=${errorMessage}`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('leads')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get leads from AmoCRM' })
  @ApiResponse({ status: 200, description: 'Leads retrieved successfully' })
  async getLeads(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    try {
      const settings = await this.settingsService.get();
      
      if (!settings.amocrmDomain || !settings.amocrmClientId || !settings.amocrmClientSecret) {
        throw new Error('AmoCRM is not configured. Please fill in Domain, Client ID, and Client Secret.');
      }

      if (!settings.amocrmAccessToken) {
        throw new Error('AmoCRM is not authorized. Please click "Authorize AmoCRM" to connect.');
      }

      // Ensure we have a valid access token
      await this.amoCrmService.ensureAccessToken({
        amocrmDomain: settings.amocrmDomain,
        amocrmClientId: settings.amocrmClientId,
        amocrmClientSecret: settings.amocrmClientSecret,
        amocrmAccessToken: settings.amocrmAccessToken,
        amocrmRefreshToken: settings.amocrmRefreshToken,
        amocrmTokenExpiresAt: settings.amocrmTokenExpiresAt,
      });

      // Clean domain
      let cleanDomain = settings.amocrmDomain.trim();
      cleanDomain = cleanDomain.replace(/^https?:\/\//i, '');
      cleanDomain = cleanDomain.replace(/\/+/g, '');
      cleanDomain = cleanDomain.replace(/^\/+|\/+$/g, '');

      // Get leads from AmoCRM
      const limitParam = limit ? parseInt(limit, 10) : 50;
      const offsetParam = offset ? parseInt(offset, 10) : 0;

      const response = await firstValueFrom(
        this.httpService.get(
          `https://${cleanDomain}/api/v4/leads`,
          {
            params: {
              limit: limitParam,
              offset: offsetParam,
            },
            headers: {
              Authorization: `Bearer ${settings.amocrmAccessToken}`,
            },
          }
        )
      );

      return {
        success: true,
        data: response.data,
        pagination: {
          limit: limitParam,
          offset: offsetParam,
          total: response.data?._page?.total || 0,
        },
      };
    } catch (error: any) {
      console.error('Failed to get leads from AmoCRM:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        // Token expired or invalid - try to refresh
        try {
          const settings = await this.settingsService.get();
          await this.amoCrmService.ensureAccessToken({
            amocrmDomain: settings.amocrmDomain,
            amocrmClientId: settings.amocrmClientId,
            amocrmClientSecret: settings.amocrmClientSecret,
            amocrmAccessToken: settings.amocrmAccessToken,
            amocrmRefreshToken: settings.amocrmRefreshToken,
            amocrmTokenExpiresAt: settings.amocrmTokenExpiresAt,
          });
          // Retry the request (simplified - in production, you might want to retry automatically)
          throw new Error('Token expired. Please try again.');
        } catch (refreshError) {
          throw new Error('Authentication failed. Please re-authorize AmoCRM.');
        }
      }
      
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      throw new Error(error.response?.data?.detail || error.response?.data?.title || error.message || 'Failed to get leads from AmoCRM');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('test')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Test AmoCRM connection' })
  @ApiResponse({ status: 200, description: 'Connection test result' })
  async testConnection() {
    try {
      const settings = await this.settingsService.get();
      
      if (!settings.amocrmDomain || !settings.amocrmClientId || !settings.amocrmClientSecret) {
        return { 
          success: false, 
          message: 'AmoCRM is not configured. Please fill in Domain, Client ID, and Client Secret.' 
        };
      }

      if (!settings.amocrmAccessToken) {
        return { 
          success: false, 
          message: 'AmoCRM is not authorized. Please click "Authorize AmoCRM" to connect.' 
        };
      }

      // Clean domain: remove protocol, trim, remove all slashes
      let cleanDomain = settings.amocrmDomain.trim();
      cleanDomain = cleanDomain.replace(/^https?:\/\//i, ''); // Remove http:// or https://
      cleanDomain = cleanDomain.replace(/\/+/g, ''); // Remove ALL slashes
      cleanDomain = cleanDomain.replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes (extra safety)
      
      // Test API call to AmoCRM
      const response = await firstValueFrom(
        this.httpService.get(
          `https://${cleanDomain}/api/v4/account`,
          {
            headers: {
              Authorization: `Bearer ${settings.amocrmAccessToken}`,
            },
          }
        )
      );

      return {
        success: true,
        message: 'Connection successful!',
        account: {
          id: response.data.id,
          name: response.data.name,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.detail || error.message || 'Connection test failed',
      };
    }
  }
}







