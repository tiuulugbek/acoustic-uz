import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from './telegram/telegram.service';
import { AmoCRMService } from './amocrm/amocrm.service';
import { leadSchema } from '@acoustic/shared';
import { Prisma } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private telegramService: TelegramService,
    private amoCrmService: AmoCRMService
  ) {}

  async findAll() {
    return this.prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.lead.findUnique({
      where: { id },
    });
  }

  async create(data: unknown) {
    const validated = leadSchema.parse(data) as Prisma.LeadUncheckedCreateInput;
    const lead = await this.prisma.lead.create({
      data: validated,
    });

    // Send to Telegram forms bot (for all form sources)
    // All leads from website forms go to Telegram bot
    // AmoCRM integration is disabled - all leads go to Telegram bot instead
    if (lead.source !== 'telegram_button') {
      try {
        await this.telegramService.sendLead(lead);
      } catch (error) {
        console.error('Failed to send lead to Telegram:', error);
      }
    }

    // Note: AmoCRM integration is disabled - all leads go to Telegram bot instead
    // Uncomment below if you want to send to AmoCRM:
    // try {
    //   await this.amoCrmService.sendLead(lead);
    // } catch (error) {
    //   console.error('Failed to send lead to AmoCRM:', error);
    // }

    return lead;
  }

  async update(id: string, data: { status?: string }) {
    return this.prisma.lead.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.lead.delete({
      where: { id },
    });
  }
}

