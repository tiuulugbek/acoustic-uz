import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { TelegramService } from './telegram/telegram.service';
import { AmoCRMService } from './amocrm/amocrm.service';
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
    private readonly telegramService: TelegramService,
    private readonly amoCrmService: AmoCRMService
  ) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create lead (public)' })
  create(@Body() createDto: unknown) {
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
        const lead = await this.leadsService.create({
          name: fullName,
          phone: phone || 'N/A',
          source: 'telegram_button',
          message: messageText,
        });

        // Send to AmoCRM (only, not to Telegram forms bot)
        try {
          await this.amoCrmService.sendLead(lead);
        } catch (error) {
          console.error('Failed to send Telegram button lead to AmoCRM:', error);
        }

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

