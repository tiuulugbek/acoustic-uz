import { Controller, Get, Query, Res, UseGuards, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AmoCRMService } from './amocrm.service';
import { SettingsService } from '../../settings/settings.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

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
  @ApiOperation({ summary: 'Get AmoCRM OAuth authorization URL' })
  @ApiResponse({ status: 200, description: 'Authorization URL generated' })
  async getAuthorizationUrl(@Res({ passthrough: false }) res: Response) {
    // Disable caching for this endpoint
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const settings = await this.settingsService.get();
    
    if (!settings.amocrmDomain || !settings.amocrmClientId) {
      throw new Error('AmoCRM domain and Client ID must be configured first');
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
    
    const redirectUri = `${this.configService.get('APP_URL') || 'http://localhost:3001'}/api/amocrm/callback`;
    const authUrl = `https://${cleanDomain}/oauth2/authorize?client_id=${settings.amocrmClientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    console.log('[AmoCRM] Generated auth URL:', authUrl);

    return res.json({ authUrl });
  }

  @Get('callback')
  @ApiOperation({ summary: 'AmoCRM OAuth callback endpoint' })
  @ApiResponse({ status: 200, description: 'Authorization successful' })
  async callback(@Query('code') code: string, @Res() res: Response) {
    if (!code) {
      return res.redirect(`${this.configService.get('ADMIN_URL') || 'http://localhost:3002'}/settings?error=no_code`);
    }

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

      // Save tokens to settings
      await this.settingsService.update({
        amocrmAccessToken: access_token,
        amocrmRefreshToken: refresh_token,
      });

      return res.redirect(`${this.configService.get('ADMIN_URL') || 'http://localhost:3002'}/settings?success=amocrm_connected`);
    } catch (error) {
      console.error('AmoCRM OAuth callback error:', error);
      return res.redirect(`${this.configService.get('ADMIN_URL') || 'http://localhost:3002'}/settings?error=oauth_failed`);
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







