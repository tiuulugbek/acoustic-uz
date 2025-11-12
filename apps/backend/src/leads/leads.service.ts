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

    // Send to Telegram
    try {
      await this.telegramService.sendLead(lead);
    } catch (error) {
      console.error('Failed to send lead to Telegram:', error);
    }

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

