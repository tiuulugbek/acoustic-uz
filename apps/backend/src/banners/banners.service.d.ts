import { PrismaService } from '../prisma/prisma.service';
export declare class BannersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(publicOnly?: boolean): Promise<({
        image: {
            id: string;
            size: number | null;
            createdAt: Date;
            updatedAt: Date;
            alt_uz: string | null;
            alt_ru: string | null;
            url: string;
            filename: string | null;
            mimeType: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title_uz: string;
        title_ru: string;
        status: string;
        imageId: string | null;
        order: number;
        text_uz: string | null;
        text_ru: string | null;
        ctaText_uz: string | null;
        ctaText_ru: string | null;
        ctaLink: string | null;
    })[]>;
    findOne(id: string): Promise<{
        image: {
            id: string;
            size: number | null;
            createdAt: Date;
            updatedAt: Date;
            alt_uz: string | null;
            alt_ru: string | null;
            url: string;
            filename: string | null;
            mimeType: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title_uz: string;
        title_ru: string;
        status: string;
        imageId: string | null;
        order: number;
        text_uz: string | null;
        text_ru: string | null;
        ctaText_uz: string | null;
        ctaText_ru: string | null;
        ctaLink: string | null;
    }>;
    create(data: unknown): Promise<{
        image: {
            id: string;
            size: number | null;
            createdAt: Date;
            updatedAt: Date;
            alt_uz: string | null;
            alt_ru: string | null;
            url: string;
            filename: string | null;
            mimeType: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title_uz: string;
        title_ru: string;
        status: string;
        imageId: string | null;
        order: number;
        text_uz: string | null;
        text_ru: string | null;
        ctaText_uz: string | null;
        ctaText_ru: string | null;
        ctaLink: string | null;
    }>;
    update(id: string, data: unknown): Promise<{
        image: {
            id: string;
            size: number | null;
            createdAt: Date;
            updatedAt: Date;
            alt_uz: string | null;
            alt_ru: string | null;
            url: string;
            filename: string | null;
            mimeType: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title_uz: string;
        title_ru: string;
        status: string;
        imageId: string | null;
        order: number;
        text_uz: string | null;
        text_ru: string | null;
        ctaText_uz: string | null;
        ctaText_ru: string | null;
        ctaLink: string | null;
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title_uz: string;
        title_ru: string;
        status: string;
        imageId: string | null;
        order: number;
        text_uz: string | null;
        text_ru: string | null;
        ctaText_uz: string | null;
        ctaText_ru: string | null;
        ctaLink: string | null;
    }>;
}
//# sourceMappingURL=banners.service.d.ts.map