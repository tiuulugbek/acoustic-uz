import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { TelegramService } from './telegram/telegram.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';

interface TelegramUpdate {
  message?: {
    chat: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
    text?: string;
    contact?: {
      phone_number: string;
      first_name?: string;
    };
    from: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
  };
}

@ApiTags('public', 'admin')
@Controller('leads')
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly telegramService: TelegramService
  ) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create lead (public)' })
  async create(@Body() createDto: unknown) {
    // Track Telegram button clicks
    const data = createDto as { source?: string };
    if (data.source === 'telegram_button_click') {
      // Create a minimal lead entry for tracking
      return this.leadsService.create({
        name: 'Telegram Button Click',
        phone: 'N/A',
        source: 'telegram_button_click',
        message: 'User clicked Telegram button',
      });
    }
    return this.leadsService.create(createDto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get()
  @RequirePermissions('leads.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all leads' })
  findAll() {
    return this.leadsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get('stats/telegram-button')
  @RequirePermissions('leads.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Telegram button click statistics' })
  getTelegramButtonStats() {
    return this.leadsService.getTelegramButtonStats();
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get('stats/overview')
  @RequirePermissions('leads.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get overview statistics' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  getStatisticsOverview(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.leadsService.getStatisticsOverview(start, end);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get('stats/by-source')
  @RequirePermissions('leads.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get statistics grouped by source' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  getStatisticsBySource(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.leadsService.getStatisticsBySource(start, end);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get('stats/by-page')
  @RequirePermissions('leads.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get statistics grouped by page URL' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  getStatisticsByPage(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.leadsService.getStatisticsByPage(start, end);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get('stats/by-date')
  @RequirePermissions('leads.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get statistics grouped by date' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  getStatisticsByDate(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.leadsService.getStatisticsByDate(start, end);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get(':id')
  @RequirePermissions('leads.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get lead by ID' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Patch(':id')
  @RequirePermissions('leads.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update lead' })
  update(@Param('id') id: string, @Body() updateDto: { status?: string }) {
    return this.leadsService.update(id, updateDto);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Delete(':id')
  @RequirePermissions('leads.read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete lead' })
  remove(@Param('id') id: string) {
    return this.leadsService.delete(id);
  }

  @Public()
  @Post('telegram-webhook')
  @ApiOperation({ summary: 'Telegram webhook endpoint for button bot' })
  async telegramWebhook(@Body() update: TelegramUpdate) {
    try {
      // Only process messages
      if (!update.message) {
        return { ok: true };
      }

      const { message } = update;
      const chatId = message.chat.id;
      const userId = message.from.id;
      const firstName = message.from.first_name || '';
      const lastName = message.from.last_name || '';
      const username = message.from.username || '';
      const fullName = [firstName, lastName].filter(Boolean).join(' ') || username || `User ${userId}`;

      // Extract phone number from contact or text
      let phone = '';
      if (message.contact?.phone_number) {
        phone = message.contact.phone_number;
      } else if (message.text) {
        // Try to extract phone number from text
        const phoneMatch = message.text.match(/\+?998\d{9}|\d{9}/);
        if (phoneMatch) {
          phone = phoneMatch[0].startsWith('+') ? phoneMatch[0] : `+998${phoneMatch[0]}`;
        }
      }

      // Extract message text
      const messageText = message.text || message.contact?.phone_number || '';

      // If we have at least a name or phone, create a lead
      if (fullName || phone) {
        // Create lead in database
        // Note: Telegram button leads are stored in database but not sent to Telegram forms bot
        // (they are handled separately if needed)
        await this.leadsService.create({
          name: fullName,
          phone: phone || 'N/A',
          source: 'telegram_button',
          message: messageText,
        });

        // Optionally send confirmation back to user
        const buttonBot = await this.telegramService.getButtonBot();
        if (buttonBot && phone) {
          try {
            await buttonBot.sendMessage(chatId, 
              '✅ Xabaringiz qabul qilindi! Tez orada siz bilan bog\'lanamiz.',
              { parse_mode: 'HTML' }
            );
          } catch (error) {
            console.error('Failed to send confirmation message:', error);
          }
        }
      }

      return { ok: true };
    } catch (error) {
      console.error('Telegram webhook error:', error);
      return { ok: true }; // Always return ok to prevent Telegram from retrying
    }
  }
}

