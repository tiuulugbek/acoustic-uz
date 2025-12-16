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

  async getTelegramButtonStats() {
    // Count both telegram_button and telegram_button_click sources
    const sourceFilter = {
      OR: [
        { source: 'telegram_button' },
        { source: 'telegram_button_click' },
      ],
    };

    const totalClicks = await this.prisma.lead.count({
      where: sourceFilter,
    });

    const todayClicks = await this.prisma.lead.count({
      where: {
        ...sourceFilter,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const thisWeekClicks = await this.prisma.lead.count({
      where: {
        ...sourceFilter,
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      },
    });

    const thisMonthClicks = await this.prisma.lead.count({
      where: {
        ...sourceFilter,
        createdAt: {
          gte: new Date(new Date().setDate(1)),
        },
      },
    });

    return {
      total: totalClicks,
      today: todayClicks,
      thisWeek: thisWeekClicks,
      thisMonth: thisMonthClicks,
    };
  }

  /**
   * Get statistics grouped by source
   */
  async getStatisticsBySource(startDate?: Date, endDate?: Date) {
    const where: Prisma.LeadWhereInput = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Exclude telegram button clicks from form statistics
    where.NOT = {
      OR: [
        { source: 'telegram_button_click' },
        { source: 'telegram_button' },
      ],
    };

    const leads = await this.prisma.lead.findMany({
      where,
      select: {
        source: true,
        createdAt: true,
      },
    });

    // Group by source
    const grouped = leads.reduce((acc, lead) => {
      const source = lead.source || 'unknown';
      if (!acc[source]) {
        acc[source] = 0;
      }
      acc[source]++;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort by count
    return Object.entries(grouped)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get statistics grouped by page URL
   */
  async getStatisticsByPage(startDate?: Date, endDate?: Date) {
    const where: Prisma.LeadWhereInput = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Exclude telegram button clicks
    where.NOT = {
      OR: [
        { source: 'telegram_button_click' },
        { source: 'telegram_button' },
      ],
    };

    where.pageUrl = { not: null };

    const leads = await this.prisma.lead.findMany({
      where,
      select: {
        pageUrl: true,
        createdAt: true,
      },
    });

    // Group by page URL and extract page name
    const grouped = leads.reduce((acc, lead) => {
      if (!lead.pageUrl) return acc;
      
      // Extract page name from URL (e.g., /products/slug -> products)
      const url = new URL(lead.pageUrl);
      const pathParts = url.pathname.split('/').filter(Boolean);
      const pageName = pathParts.length > 0 ? pathParts[0] : 'home';
      
      if (!acc[pageName]) {
        acc[pageName] = { count: 0, pages: {} as Record<string, number> };
      }
      acc[pageName].count++;
      
      // Also track specific pages
      const fullPath = url.pathname;
      if (!acc[pageName].pages[fullPath]) {
        acc[pageName].pages[fullPath] = 0;
      }
      acc[pageName].pages[fullPath]++;
      
      return acc;
    }, {} as Record<string, { count: number; pages: Record<string, number> }>);

    // Convert to array and sort by count
    return Object.entries(grouped)
      .map(([pageName, data]) => ({
        pageName,
        count: data.count,
        pages: Object.entries(data.pages)
          .map(([path, count]) => ({ path, count }))
          .sort((a, b) => b.count - a.count),
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get statistics grouped by date (daily)
   */
  async getStatisticsByDate(startDate?: Date, endDate?: Date) {
    const where: Prisma.LeadWhereInput = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Exclude telegram button clicks
    where.NOT = {
      OR: [
        { source: 'telegram_button_click' },
        { source: 'telegram_button' },
      ],
    };

    const leads = await this.prisma.lead.findMany({
      where,
      select: {
        createdAt: true,
      },
    });

    // Group by date (YYYY-MM-DD)
    const grouped = leads.reduce((acc, lead) => {
      const date = new Date(lead.createdAt);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!acc[dateKey]) {
        acc[dateKey] = 0;
      }
      acc[dateKey]++;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort by date
    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get overview statistics
   */
  async getStatisticsOverview(startDate?: Date, endDate?: Date) {
    const where: Prisma.LeadWhereInput = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Exclude telegram button clicks
    where.NOT = {
      OR: [
        { source: 'telegram_button_click' },
        { source: 'telegram_button' },
      ],
    };

    const total = await this.prisma.lead.count({ where });

    const today = await this.prisma.lead.count({
      where: {
        ...where,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const thisWeek = await this.prisma.lead.count({
      where: {
        ...where,
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      },
    });

    const thisMonth = await this.prisma.lead.count({
      where: {
        ...where,
        createdAt: {
          gte: new Date(new Date().setDate(1)),
        },
      },
    });

    // Get top sources
    const bySource = await this.getStatisticsBySource(startDate, endDate);
    const topSources = bySource.slice(0, 5);

    // Get top pages
    const byPage = await this.getStatisticsByPage(startDate, endDate);
    const topPages = byPage.slice(0, 5);

    return {
      total,
      today,
      thisWeek,
      thisMonth,
      topSources,
      topPages,
    };
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
    // Don't send telegram_button_click events to Telegram (they're just for tracking)
    if (lead.source !== 'telegram_button' && lead.source !== 'telegram_button_click') {
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

