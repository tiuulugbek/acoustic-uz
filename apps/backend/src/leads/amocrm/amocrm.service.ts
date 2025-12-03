import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../../settings/settings.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface AmoCRMLead {
  name: string;
  phone: string;
  email?: string;
  source?: string;
  message?: string;
  productId?: string;
}

interface AmoCRMSettings {
  amocrmDomain?: string;
  amocrmClientId?: string;
  amocrmClientSecret?: string;
  amocrmAccessToken?: string;
  amocrmRefreshToken?: string;
  amocrmPipelineId?: string;
  amocrmStatusId?: string;
}

@Injectable()
export class AmoCRMService {
  private readonly logger = new Logger(AmoCRMService.name);
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(
    private configService: ConfigService,
    private settingsService: SettingsService,
    private httpService: HttpService
  ) {}

  /**
   * Send lead to AmoCRM
   */
  async sendLead(lead: AmoCRMLead): Promise<boolean> {
    try {
      const settings = await this.settingsService.get();
      const amoSettings: AmoCRMSettings = {
        amocrmDomain: settings.amocrmDomain,
        amocrmClientId: settings.amocrmClientId,
        amocrmClientSecret: settings.amocrmClientSecret,
        amocrmAccessToken: settings.amocrmAccessToken,
        amocrmRefreshToken: settings.amocrmRefreshToken,
        amocrmPipelineId: settings.amocrmPipelineId,
        amocrmStatusId: settings.amocrmStatusId,
      };

      // Check if AmoCRM is configured
      if (!amoSettings.amocrmDomain || !amoSettings.amocrmClientId || !amoSettings.amocrmClientSecret) {
        this.logger.warn('AmoCRM is not configured. Skipping lead send.');
        return false;
      }

      // Ensure we have a valid access token
      // Use access token from settings if available
      if (amoSettings.amocrmAccessToken) {
        this.accessToken = amoSettings.amocrmAccessToken;
        // Token expires in 24 hours (AmoCRM default)
        this.tokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
      } else {
        // Try to refresh token if refresh token exists
        await this.ensureAccessToken(amoSettings);
      }

      // Create contact in AmoCRM
      const contactId = await this.createContact(lead, amoSettings);
      if (!contactId) {
        return false;
      }

      // Create deal (lead) in AmoCRM
      const dealId = await this.createDeal(lead, contactId, amoSettings);
      if (!dealId) {
        return false;
      }

      // Add note with message if exists
      if (lead.message) {
        await this.addNote(dealId, lead.message, amoSettings);
      }

      this.logger.log(`Lead successfully sent to AmoCRM. Contact ID: ${contactId}, Deal ID: ${dealId}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to send lead to AmoCRM:', error);
      return false;
    }
  }

  /**
   * Ensure we have a valid access token
   */
  private async ensureAccessToken(settings: AmoCRMSettings): Promise<void> {
    const now = Date.now();

    // Check if token is still valid (with 5 minute buffer)
    if (this.accessToken && this.tokenExpiresAt > now + 5 * 60 * 1000) {
      return;
    }

    // If we have a refresh token, use it to get a new access token
    if (settings.amocrmRefreshToken) {
      try {
        await this.refreshAccessToken(settings);
        return;
      } catch (error) {
        this.logger.warn('Failed to refresh access token, trying to get new one:', error);
      }
    }

    // Get new access token using client credentials
    await this.getNewAccessToken(settings);
  }

  /**
   * Get new access token using client credentials (for server-to-server)
   * Note: This requires OAuth authorization code first time
   */
  private async getNewAccessToken(settings: AmoCRMSettings): Promise<void> {
    // If we already have access token in settings, use it
    if (settings.amocrmAccessToken) {
      this.accessToken = settings.amocrmAccessToken;
      // Assume token expires in 24 hours (AmoCRM default)
      this.tokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
      return;
    }

    // If no access token, log warning - user needs to authorize first
    this.logger.warn('AmoCRM access token not found. Please authorize AmoCRM integration first.');
    throw new Error('AmoCRM not authorized. Please complete OAuth flow.');
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(settings: AmoCRMSettings): Promise<void> {
    try {
      // Clean domain: remove protocol, trim, remove all slashes
      let cleanDomain = settings.amocrmDomain.trim();
      cleanDomain = cleanDomain.replace(/^https?:\/\//i, ''); // Remove http:// or https://
      cleanDomain = cleanDomain.replace(/\/+/g, ''); // Remove ALL slashes
      cleanDomain = cleanDomain.replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes (extra safety)
      
      const response = await firstValueFrom(
        this.httpService.post(
          `https://${cleanDomain}/oauth2/access_token`,
          {
            client_id: settings.amocrmClientId,
            client_secret: settings.amocrmClientSecret,
            grant_type: 'refresh_token',
            refresh_token: settings.amocrmRefreshToken,
            redirect_uri: `${this.configService.get('APP_URL') || 'http://localhost:3001'}/api/amocrm/callback`,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + response.data.expires_in * 1000;

      // Update settings with new tokens
      await this.settingsService.update({
        amocrmAccessToken: this.accessToken,
        amocrmRefreshToken: response.data.refresh_token || settings.amocrmRefreshToken,
      });
    } catch (error) {
      this.logger.error('Failed to refresh access token:', error);
      throw error;
    }
  }

  /**
   * Create contact in AmoCRM
   */
  private async createContact(lead: AmoCRMLead, settings: AmoCRMSettings): Promise<number | null> {
    try {
      // Clean domain: remove protocol, trim, remove all slashes
      let cleanDomain = settings.amocrmDomain.trim();
      cleanDomain = cleanDomain.replace(/^https?:\/\//i, ''); // Remove http:// or https://
      cleanDomain = cleanDomain.replace(/\/+/g, ''); // Remove ALL slashes
      cleanDomain = cleanDomain.replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes (extra safety)
      
      const contactData = {
        name: lead.name,
        custom_fields_values: [
          {
            field_id: 123456, // Phone field ID (should be configured)
            values: [
              {
                value: lead.phone,
                enum_code: 'WORK',
              },
            ],
          },
          ...(lead.email
            ? [
                {
                  field_id: 123457, // Email field ID (should be configured)
                  values: [
                    {
                      value: lead.email,
                      enum_code: 'WORK',
                    },
                  ],
                },
              ]
            : []),
        ],
      };

      const response = await firstValueFrom(
        this.httpService.post(
          `https://${cleanDomain}/api/v4/contacts`,
          [contactData],
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      if (response.data && response.data._embedded && response.data._embedded.contacts) {
        return response.data._embedded.contacts[0].id;
      }

      return null;
    } catch (error) {
      this.logger.error('Failed to create contact in AmoCRM:', error);
      return null;
    }
  }

  /**
   * Create deal (lead) in AmoCRM
   */
  private async createDeal(
    lead: AmoCRMLead,
    contactId: number,
    settings: AmoCRMSettings
  ): Promise<number | null> {
    try {
      // Clean domain: remove protocol, trim, remove all slashes
      let cleanDomain = settings.amocrmDomain.trim();
      cleanDomain = cleanDomain.replace(/^https?:\/\//i, ''); // Remove http:// or https://
      cleanDomain = cleanDomain.replace(/\/+/g, ''); // Remove ALL slashes
      cleanDomain = cleanDomain.replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes (extra safety)
      
      const dealName = lead.productId
        ? `So'rov: ${lead.name}`
        : `Yangi so'rov: ${lead.name}`;

      const dealData = {
        name: dealName,
        price: 0,
        pipeline_id: parseInt(settings.amocrmPipelineId || '0'),
        status_id: parseInt(settings.amocrmStatusId || '0'),
        _embedded: {
          contacts: [
            {
              id: contactId,
            },
          ],
        },
        custom_fields_values: [
          ...(lead.source
            ? [
                {
                  field_id: 123458, // Source field ID (should be configured)
                  values: [
                    {
                      value: lead.source,
                    },
                  ],
                },
              ]
            : []),
          ...(lead.productId
            ? [
                {
                  field_id: 123459, // Product ID field ID (should be configured)
                  values: [
                    {
                      value: lead.productId,
                    },
                  ],
                },
              ]
            : []),
        ],
      };

      const response = await firstValueFrom(
        this.httpService.post(
          `https://${cleanDomain}/api/v4/leads`,
          [dealData],
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      if (response.data && response.data._embedded && response.data._embedded.leads) {
        return response.data._embedded.leads[0].id;
      }

      return null;
    } catch (error) {
      this.logger.error('Failed to create deal in AmoCRM:', error);
      return null;
    }
  }

  /**
   * Add note to deal
   */
  private async addNote(dealId: number, message: string, settings: AmoCRMSettings): Promise<void> {
    try {
      // Clean domain: remove protocol, trim, remove all slashes
      let cleanDomain = settings.amocrmDomain.trim();
      cleanDomain = cleanDomain.replace(/^https?:\/\//i, ''); // Remove http:// or https://
      cleanDomain = cleanDomain.replace(/\/+/g, ''); // Remove ALL slashes
      cleanDomain = cleanDomain.replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes (extra safety)
      
      const noteData = {
        entity_id: dealId,
        note_type: 'common',
        params: {
          text: message,
        },
      };

      await firstValueFrom(
        this.httpService.post(
          `https://${cleanDomain}/api/v4/leads/${dealId}/notes`,
          [noteData],
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );
    } catch (error) {
      this.logger.error('Failed to add note to AmoCRM:', error);
      // Don't throw, note is optional
    }
  }
}

