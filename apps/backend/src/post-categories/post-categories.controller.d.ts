import { PostCategoriesService } from './post-categories.service';
export declare class PostCategoriesController {
    private readonly service;
    constructor(service: PostCategoriesService);
    findAll(section?: string): Promise<({
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
        section: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        status: string;
        name_uz: string;
        name_ru: string;
        description_uz: string | null;
        description_ru: string | null;
        imageId: string | null;
        order: number;
    })[]>;
    findBySlug(slug: string): Promise<({
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
        section: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        status: string;
        name_uz: string;
        name_ru: string;
        description_uz: string | null;
        description_ru: string | null;
        imageId: string | null;
        order: number;
    }) | null>;
    create(dto: unknown): Promise<{
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
        section: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        status: string;
        name_uz: string;
        name_ru: string;
        description_uz: string | null;
        description_ru: string | null;
        imageId: string | null;
        order: number;
    }>;
    update(id: string, dto: unknown): Promise<{
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
        section: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        status: string;
        name_uz: string;
        name_ru: string;
        description_uz: string | null;
        description_ru: string | null;
        imageId: string | null;
        order: number;
    }>;
    remove(id: string): Promise<{
        section: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        status: string;
        name_uz: string;
        name_ru: string;
        description_uz: string | null;
        description_ru: string | null;
        imageId: string | null;
        order: number;
    }>;
}
//# sourceMappingURL=post-categories.controller.d.ts.map