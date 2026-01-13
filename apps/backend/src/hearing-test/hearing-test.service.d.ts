import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../leads/telegram/telegram.service';
import { Prisma } from '@prisma/client';
export declare class HearingTestService {
    private prisma;
    private telegramService;
    constructor(prisma: PrismaService, telegramService: TelegramService);
    findAll(): Promise<{
        name: string | null;
        source: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        email: string | null;
        phone: string | null;
        deviceType: string;
        volumeLevel: number | null;
        leftEarResults: Prisma.JsonValue;
        rightEarResults: Prisma.JsonValue;
        leftEarScore: number | null;
        rightEarScore: number | null;
        overallScore: number | null;
        leftEarLevel: string | null;
        rightEarLevel: string | null;
        notes: string | null;
    }[]>;
    findOne(id: string): Promise<{
        name: string | null;
        source: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        email: string | null;
        phone: string | null;
        deviceType: string;
        volumeLevel: number | null;
        leftEarResults: Prisma.JsonValue;
        rightEarResults: Prisma.JsonValue;
        leftEarScore: number | null;
        rightEarScore: number | null;
        overallScore: number | null;
        leftEarLevel: string | null;
        rightEarLevel: string | null;
        notes: string | null;
    } | null>;
    /**
     * Calculate hearing score based on test results (volume levels)
     * Lower volume needed = better hearing
     */
    calculateScore(results: Record<string, number>): number;
    /**
     * Determine hearing level based on score
     */
    getHearingLevel(score: number): 'normal' | 'mild' | 'moderate' | 'severe' | 'profound';
    create(data: unknown): Promise<{
        name: string | null;
        source: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        email: string | null;
        phone: string | null;
        deviceType: string;
        volumeLevel: number | null;
        leftEarResults: Prisma.JsonValue;
        rightEarResults: Prisma.JsonValue;
        leftEarScore: number | null;
        rightEarScore: number | null;
        overallScore: number | null;
        leftEarLevel: string | null;
        rightEarLevel: string | null;
        notes: string | null;
    }>;
    update(id: string, data: {
        status?: string;
        notes?: string;
    }): Promise<{
        name: string | null;
        source: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        email: string | null;
        phone: string | null;
        deviceType: string;
        volumeLevel: number | null;
        leftEarResults: Prisma.JsonValue;
        rightEarResults: Prisma.JsonValue;
        leftEarScore: number | null;
        rightEarScore: number | null;
        overallScore: number | null;
        leftEarLevel: string | null;
        rightEarLevel: string | null;
        notes: string | null;
    }>;
    delete(id: string): Promise<{
        name: string | null;
        source: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        email: string | null;
        phone: string | null;
        deviceType: string;
        volumeLevel: number | null;
        leftEarResults: Prisma.JsonValue;
        rightEarResults: Prisma.JsonValue;
        leftEarScore: number | null;
        rightEarScore: number | null;
        overallScore: number | null;
        leftEarLevel: string | null;
        rightEarLevel: string | null;
        notes: string | null;
    }>;
}
//# sourceMappingURL=hearing-test.service.d.ts.map