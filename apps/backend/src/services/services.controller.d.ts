import { ServicesService } from './services.service';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    findAll(publicOnly?: string, categoryId?: string): Promise<({
        category: {
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
            icon: string | null;
            parentId: string | null;
        } | null;
        cover: {
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
        body_uz: string | null;
        body_ru: string | null;
        slug: string;
        categoryId: string | null;
        excerpt_uz: string | null;
        excerpt_ru: string | null;
        coverId: string | null;
        status: string;
        order: number;
    })[]>;
    findBySlug(slug: string): Promise<{
        category: {
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
            icon: string | null;
            parentId: string | null;
        } | null;
        cover: {
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
        body_uz: string | null;
        body_ru: string | null;
        slug: string;
        categoryId: string | null;
        excerpt_uz: string | null;
        excerpt_ru: string | null;
        coverId: string | null;
        status: string;
        order: number;
    }>;
    findAllAdmin(): Promise<({
        category: {
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
            icon: string | null;
            parentId: string | null;
        } | null;
        cover: {
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
        body_uz: string | null;
        body_ru: string | null;
        slug: string;
        categoryId: string | null;
        excerpt_uz: string | null;
        excerpt_ru: string | null;
        coverId: string | null;
        status: string;
        order: number;
    })[]>;
    findOne(id: string): Promise<{
        category: {
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
            icon: string | null;
            parentId: string | null;
        } | null;
        cover: {
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
        body_uz: string | null;
        body_ru: string | null;
        slug: string;
        categoryId: string | null;
        excerpt_uz: string | null;
        excerpt_ru: string | null;
        coverId: string | null;
        status: string;
        order: number;
    }>;
    create(createDto: unknown): Promise<{
        category: {
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
            icon: string | null;
            parentId: string | null;
        } | null;
        cover: {
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
        body_uz: string | null;
        body_ru: string | null;
        slug: string;
        categoryId: string | null;
        excerpt_uz: string | null;
        excerpt_ru: string | null;
        coverId: string | null;
        status: string;
        order: number;
    }>;
    update(id: string, updateDto: unknown): Promise<{
        category: {
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
            icon: string | null;
            parentId: string | null;
        } | null;
        cover: {
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
        body_uz: string | null;
        body_ru: string | null;
        slug: string;
        categoryId: string | null;
        excerpt_uz: string | null;
        excerpt_ru: string | null;
        coverId: string | null;
        status: string;
        order: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title_uz: string;
        title_ru: string;
        body_uz: string | null;
        body_ru: string | null;
        slug: string;
        categoryId: string | null;
        excerpt_uz: string | null;
        excerpt_ru: string | null;
        coverId: string | null;
        status: string;
        order: number;
    }>;
}
//# sourceMappingURL=services.controller.d.ts.map