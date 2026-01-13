import { PrismaService } from '../prisma/prisma.service';
export declare class BrandsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        logo: {
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
        name: string;
        id: string;
        slug: string;
        desc_uz: string | null;
        desc_ru: string | null;
        logoId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        logo: {
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
        name: string;
        id: string;
        slug: string;
        desc_uz: string | null;
        desc_ru: string | null;
        logoId: string | null;
    }>;
    create(data: unknown): Promise<{
        logo: {
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
        name: string;
        id: string;
        slug: string;
        desc_uz: string | null;
        desc_ru: string | null;
        logoId: string | null;
    }>;
    update(id: string, data: unknown): Promise<{
        logo: {
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
        name: string;
        id: string;
        slug: string;
        desc_uz: string | null;
        desc_ru: string | null;
        logoId: string | null;
    }>;
    delete(id: string): Promise<{
        name: string;
        id: string;
        slug: string;
        desc_uz: string | null;
        desc_ru: string | null;
        logoId: string | null;
    }>;
}
//# sourceMappingURL=brands.service.d.ts.map