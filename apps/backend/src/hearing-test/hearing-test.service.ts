import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../leads/telegram/telegram.service';
import { hearingTestSchema } from '@acoustic/shared';
import { Prisma } from '@prisma/client';

@Injectable()
export class HearingTestService {
  constructor(
    private prisma: PrismaService,
    private telegramService: TelegramService
  ) {}

  async findAll() {
    return this.prisma.hearingTest.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.hearingTest.findUnique({
      where: { id },
    });
  }

  /**
   * Calculate hearing score based on test results (volume levels)
   * Lower volume needed = better hearing
   */
  calculateScore(results: Record<string, number>): number {
    const frequencies = ['250', '500', '1000', '2000', '4000', '8000'];
    if (frequencies.length === 0) return 0;
    
    let totalScore = 0;
    for (const freq of frequencies) {
      const volume = results[freq];
      if (volume === undefined || volume === null) continue;
      // Assuming 1.0 is perfect hearing (no volume needed), 0.0 is no hearing
      // Score is inverse of volume needed to barely hear
      // Lower volume = higher score
      totalScore += (1 - volume) * (100 / frequencies.length);
    }
    return Math.round(totalScore);
  }

  /**
   * Determine hearing level based on score
   */
  getHearingLevel(score: number): 'normal' | 'mild' | 'moderate' | 'severe' | 'profound' {
    if (score >= 90) return 'normal';
    if (score >= 70) return 'mild';
    if (score >= 50) return 'moderate';
    if (score >= 30) return 'severe';
    return 'profound';
  }

  async create(data: unknown) {
    const validated = hearingTestSchema.parse(data);
    
    // Calculate scores if not provided
    const leftEarScore = validated.leftEarScore ?? this.calculateScore(validated.leftEarResults);
    const rightEarScore = validated.rightEarScore ?? this.calculateScore(validated.rightEarResults);
    const overallScore = validated.overallScore ?? Math.round((leftEarScore + rightEarScore) / 2);
    
    // Determine hearing levels
    const leftEarLevel = validated.leftEarLevel ?? this.getHearingLevel(leftEarScore);
    const rightEarLevel = validated.rightEarLevel ?? this.getHearingLevel(rightEarScore);

    const test = await this.prisma.hearingTest.create({
      data: {
        ...validated,
        leftEarScore,
        rightEarScore,
        overallScore,
        leftEarLevel,
        rightEarLevel,
        leftEarResults: validated.leftEarResults as Prisma.JsonObject,
        rightEarResults: validated.rightEarResults as Prisma.JsonObject,
      } as Prisma.HearingTestUncheckedCreateInput,
    });

    // Send to Telegram
    try {
      const levelNames: Record<string, string> = {
        normal: 'Normal',
        mild: 'Yengil',
        moderate: "O'rtacha",
        severe: 'Og\'ir',
        profound: 'Juda og\'ir',
      };

      const message = `
🩺 *Yangi Eshitish Testi Natijasi*

👤 *Ism:* ${test.name || 'Noma\'lum'}
📞 *Telefon:* ${test.phone || 'Noma\'lum'}
${test.email ? `📧 *Email:* ${test.email}\n` : ''}

🎧 *Qurilma:* ${test.deviceType === 'headphone' ? 'Headphone' : 'Speaker'}
${test.volumeLevel ? `🔊 *Ovoz balandligi:* ${Math.round(test.volumeLevel * 100)}%\n` : ''}

📊 *Natijalar:*
👂 *Chap quloq:* ${test.leftEarScore}% (${levelNames[test.leftEarLevel || 'normal']})
👂 *O'ng quloq:* ${test.rightEarScore}% (${levelNames[test.rightEarLevel || 'normal']})
📈 *Umumiy:* ${test.overallScore}%

📅 *Sana:* ${new Date(test.createdAt).toLocaleString('uz-UZ')}
      `.trim();

      await this.telegramService.sendLead({
        name: test.name || 'Eshitish testi',
        phone: test.phone || 'N/A',
        email: test.email,
        source: 'hearing_test',
        message: message,
      });
    } catch (error) {
      console.error('Failed to send hearing test result to Telegram:', error);
    }

    return test;
  }

  async update(id: string, data: { status?: string; notes?: string }) {
    return this.prisma.hearingTest.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.hearingTest.delete({
      where: { id },
    });
  }
}

