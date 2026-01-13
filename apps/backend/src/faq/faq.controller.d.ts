import { FaqService } from './faq.service';
export declare class FaqController {
    private readonly service;
    constructor(service: FaqService);
    findAll(publicOnly?: string): Promise<{
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
    create(dto: unknown): Promise<{
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
    update(id: string, dto: unknown): Promise<{
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
    remove(id: string): Promise<{
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
//# sourceMappingURL=faq.controller.d.ts.map