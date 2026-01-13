import { PrismaService } from '../prisma/prisma.service';
export declare class FaqService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(publicOnly?: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        order: number;
        question_uz: string;
        question_ru: string;
        answer_uz: string;
        answer_ru: string;
    }[]>;
    create(data: unknown): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        order: number;
        question_uz: string;
        question_ru: string;
        answer_uz: string;
        answer_ru: string;
    }>;
    update(id: string, data: unknown): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        order: number;
        question_uz: string;
        question_ru: string;
        answer_uz: string;
        answer_ru: string;
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        order: number;
        question_uz: string;
        question_ru: string;
        answer_uz: string;
        answer_ru: string;
    }>;
}
//# sourceMappingURL=faq.service.d.ts.map