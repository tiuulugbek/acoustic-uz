import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from './telegram/telegram.service';
import { leadSchema } from '@acoustic/shared';
import { Prisma } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private telegramService: TelegramService
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
    if (lead.source !== 'telegram_button') {
      try {
        await this.telegramService.sendLead(lead);
      } catch (error) {
        console.error('Failed to send lead to Telegram:', error);
      }
    }

    return lead;
  }

  async update(id: string, data: { status?: string }) {
    // Get old lead data before update
    const oldLead = await this.prisma.lead.findUnique({
      where: { id },
    });

    const updatedLead = await this.prisma.lead.update({
      where: { id },
      data,
    });

    // Send status update notification to Telegram if status changed
    if (oldLead && data.status && oldLead.status !== data.status) {
      try {
        await this.telegramService.sendLeadStatusUpdate({
          id: updatedLead.id,
          name: updatedLead.name,
          phone: updatedLead.phone,
          status: updatedLead.status,
          oldStatus: oldLead.status,
        });
      } catch (error) {
        console.error('Failed to send lead status update to Telegram:', error);
      }
    }

    return updatedLead;
  }

  async delete(id: string) {
    // Get lead data before deletion
    const lead = await this.prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    // Delete the lead
    const deletedLead = await this.prisma.lead.delete({
      where: { id },
    });

    // Send deletion notification to Telegram
    try {
      await this.telegramService.sendLeadDeletion({
        id: deletedLead.id,
        name: deletedLead.name,
        phone: deletedLead.phone,
        source: deletedLead.source,
      });
    } catch (error) {
      console.error('Failed to send lead deletion notification to Telegram:', error);
    }

    return deletedLead;
  }
}

