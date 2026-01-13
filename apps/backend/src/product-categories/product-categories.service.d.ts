import { PrismaService } from '../prisma/prisma.service';
export declare class ProductCategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findOne(id: string): Promise<({
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
    create(data: unknown): Promise<{
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
    update(id: string, data: unknown): Promise<{
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
    delete(id: string): Promise<{
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
//# sourceMappingURL=product-categories.service.d.ts.map