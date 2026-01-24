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
   * Calculate score from SRT-50 (Speech Reception Threshold)
   * Lower SRT = better hearing
   * SRT range: -10 to 15 dB, normalize to 0-100
   */
  calculateScoreFromSRT(srt: number): number {
    const minSRT = -10;
    const maxSRT = 15;
    const normalized = ((srt - minSRT) / (maxSRT - minSRT)) * 100;
    // Invert: lower SRT = higher score
    return Math.max(0, Math.min(100, Math.round(100 - normalized)));
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
    const validated = hearingTestSchema.parse(data) as any;
    
    // Calculate scores based on test method
    let leftEarScore: number;
    let rightEarScore: number;
    let overallScore: number;
    
    if (validated.testMethod === 'digits-in-noise') {
      // Digits-in-Noise test: use SRT-50
      const leftSRT = validated.leftEarSRT ?? 0;
      const rightSRT = validated.rightEarSRT ?? 0;
      
      leftEarScore = validated.leftEarScore ?? this.calculateScoreFromSRT(leftSRT);
      rightEarScore = validated.rightEarScore ?? this.calculateScoreFromSRT(rightSRT);
      overallScore = validated.overallScore ?? Math.round((leftEarScore + rightEarScore) / 2);
    } else {
      // Frequency test: use volume levels
      const leftResults = validated.leftEarResults as Record<string, number> | undefined;
      const rightResults = validated.rightEarResults as Record<string, number> | undefined;
      
      leftEarScore = validated.leftEarScore ?? (leftResults ? this.calculateScore(leftResults) : 0);
      rightEarScore = validated.rightEarScore ?? (rightResults ? this.calculateScore(rightResults) : 0);
      overallScore = validated.overallScore ?? Math.round((leftEarScore + rightEarScore) / 2);
    }
    
    // Determine hearing levels
    const leftEarLevel = validated.leftEarLevel ?? this.getHearingLevel(leftEarScore);
    const rightEarLevel = validated.rightEarLevel ?? this.getHearingLevel(rightEarScore);

    const createData: any = {
      ...validated,
      leftEarScore,
      rightEarScore,
      overallScore,
      leftEarLevel,
      rightEarLevel,
    };
    
    // Add optional fields
    if (validated.leftEarResults) {
      createData.leftEarResults = validated.leftEarResults as Prisma.JsonObject;
    }
    if (validated.rightEarResults) {
      createData.rightEarResults = validated.rightEarResults as Prisma.JsonObject;
    }
    if (validated.testMethod) {
      createData.testMethod = validated.testMethod;
    }
    if (validated.leftEarSRT !== undefined) {
      createData.leftEarSRT = validated.leftEarSRT;
    }
    if (validated.rightEarSRT !== undefined) {
      createData.rightEarSRT = validated.rightEarSRT;
    }
    if (validated.overallSRT !== undefined) {
      createData.overallSRT = validated.overallSRT;
    }
    if (validated.leftEarSINResults) {
      createData.leftEarSINResults = validated.leftEarSINResults as Prisma.JsonObject;
    }
    if (validated.rightEarSINResults) {
      createData.rightEarSINResults = validated.rightEarSINResults as Prisma.JsonObject;
    }

    const test = await this.prisma.hearingTest.create({
      data: createData as Prisma.HearingTestUncheckedCreateInput,
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

      const testData = test as any;
      const testMethodText = testData.testMethod === 'digits-in-noise' ? 'Digits-in-Noise' : 'Frequency';
      const srtInfo = testData.testMethod === 'digits-in-noise' && testData.overallSRT 
        ? `\n🎯 *SRT-50:* ${testData.overallSRT} dB` 
        : '';

      const message = `
🩺 *Yangi Eshitish Testi Natijasi*

👤 *Ism:* ${test.name || 'Noma\'lum'}
📞 *Telefon:* ${test.phone || 'Noma\'lum'}
${test.email ? `📧 *Email:* ${test.email}\n` : ''}

🎧 *Qurilma:* ${test.deviceType === 'headphone' ? 'Headphone' : 'Speaker'}
🔬 *Test turi:* ${testMethodText}
${test.volumeLevel ? `🔊 *Ovoz balandligi:* ${Math.round(test.volumeLevel * 100)}%\n` : ''}

📊 *Natijalar:*
👂 *Chap quloq:* ${test.leftEarScore}% (${levelNames[test.leftEarLevel || 'normal']})
👂 *O'ng quloq:* ${test.rightEarScore}% (${levelNames[test.rightEarLevel || 'normal']})
📈 *Umumiy:* ${test.overallScore}%${srtInfo}

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

