import { ProductCategoriesService } from './product-categories.service';
export declare class ProductCategoriesController {
    private readonly service;
    constructor(service: ProductCategoriesService);
    findAll(): Promise<({
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
        children: {
            id: string;
            slug: string;
            name_uz: string;
            name_ru: string;
            description_uz: string | null;
            description_ru: string | null;
            imageId: string | null;
            order: number;
            icon: string | null;
            parentId: string | null;
        }[];
        parent: {
            id: string;
            slug: string;
            name_uz: string;
            name_ru: string;
            description_uz: string | null;
            description_ru: string | null;
            imageId: string | null;
            order: number;
            icon: string | null;
            parentId: string | null;
        } | null;
    } & {
        id: string;
        slug: string;
        name_uz: string;
        name_ru: string;
        description_uz: string | null;
        description_ru: string | null;
        imageId: string | null;
        order: number;
        icon: string | null;
        parentId: string | null;
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
        children: {
            id: string;
            slug: string;
            name_uz: string;
            name_ru: string;
            description_uz: string | null;
            description_ru: string | null;
            imageId: string | null;
            order: number;
            icon: string | null;
            parentId: string | null;
        }[];
        parent: {
            id: string;
            slug: string;
            name_uz: string;
            name_ru: string;
            description_uz: string | null;
            description_ru: string | null;
            imageId: string | null;
            order: number;
            icon: string | null;
            parentId: string | null;
        } | null;
    } & {
        id: string;
        slug: string;
        name_uz: string;
        name_ru: string;
        description_uz: string | null;
        description_ru: string | null;
        imageId: string | null;
        order: number;
        icon: string | null;
        parentId: string | null;
    }) | null>;
    create(dto: unknown): Promise<{
        id: string;
        slug: string;
        name_uz: string;
        name_ru: string;
        description_uz: string | null;
        description_ru: string | null;
        imageId: string | null;
        order: number;
        icon: string | null;
        parentId: string | null;
    }>;
    update(id: string, dto: unknown): Promise<{
        id: string;
        slug: string;
        name_uz: string;
        name_ru: string;
        description_uz: string | null;
        description_ru: string | null;
        imageId: string | null;
        order: number;
        icon: string | null;
        parentId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        slug: string;
        name_uz: string;
        name_ru: string;
        description_uz: string | null;
        description_ru: string | null;
        imageId: string | null;
        order: number;
        icon: string | null;
        parentId: string | null;
    }>;
}
//# sourceMappingURL=product-categories.controller.d.ts.map