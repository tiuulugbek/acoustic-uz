import { BrandsService } from './brands.service';
export declare class BrandsController {
    private readonly brandsService;
    constructor(brandsService: BrandsService);
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
    create(createDto: unknown): Promise<{
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
    update(id: string, updateDto: unknown): Promise<{
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
    remove(id: string): Promise<{
        name: string;
        id: string;
        slug: string;
        desc_uz: string | null;
        desc_ru: string | null;
        logoId: string | null;
    }>;
}
//# sourceMappingURL=brands.controller.d.ts.map