import { PostsService } from './posts.service';
export declare class PostsController {
    private readonly service;
    constructor(service: PostsService);
    findAll(publicOnly?: string, categoryId?: string, postType?: string): Promise<({
        category: {
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
        } | null;
        author: ({
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
            slug: string;
            status: string;
            name_uz: string;
            name_ru: string;
            description_uz: string | null;
            description_ru: string | null;
            imageId: string | null;
            order: number;
            position_uz: string | null;
            position_ru: string | null;
            experience_uz: string | null;
            experience_ru: string | null;
            branchIds: string[];
            patientTypes: string[];
        }) | null;
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
        body_uz: string;
        body_ru: string;
        slug: string;
        postType: string;
        categoryId: string | null;
        authorId: string | null;
        excerpt_uz: string | null;
        excerpt_ru: string | null;
        coverId: string | null;
        tags: string[];
        status: string;
        publishAt: Date;
    })[]>;
    findBySlug(slug: string, publicOnly?: string): Promise<({
        category: {
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
        } | null;
        author: ({
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
            slug: string;
            status: string;
            name_uz: string;
            name_ru: string;
            description_uz: string | null;
            description_ru: string | null;
            imageId: string | null;
            order: number;
            position_uz: string | null;
            position_ru: string | null;
            experience_uz: string | null;
            experience_ru: string | null;
            branchIds: string[];
            patientTypes: string[];
        }) | null;
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
        body_uz: string;
        body_ru: string;
        slug: string;
        postType: string;
        categoryId: string | null;
        authorId: string | null;
        excerpt_uz: string | null;
        excerpt_ru: string | null;
        coverId: string | null;
        tags: string[];
        status: string;
        publishAt: Date;
    }) | null>;
    create(dto: unknown): Promise<{
        category: {
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
        } | null;
        author: ({
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
            slug: string;
            status: string;
            name_uz: string;
            name_ru: string;
            description_uz: string | null;
            description_ru: string | null;
            imageId: string | null;
            order: number;
            position_uz: string | null;
            position_ru: string | null;
            experience_uz: string | null;
            experience_ru: string | null;
            branchIds: string[];
            patientTypes: string[];
        }) | null;
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
        body_uz: string;
        body_ru: string;
        slug: string;
        postType: string;
        categoryId: string | null;
        authorId: string | null;
        excerpt_uz: string | null;
        excerpt_ru: string | null;
        coverId: string | null;
        tags: string[];
        status: string;
        publishAt: Date;
    }>;
    update(id: string, dto: unknown): Promise<{
        category: {
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
        } | null;
        author: ({
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
            slug: string;
            status: string;
            name_uz: string;
            name_ru: string;
            description_uz: string | null;
            description_ru: string | null;
            imageId: string | null;
            order: number;
            position_uz: string | null;
            position_ru: string | null;
            experience_uz: string | null;
            experience_ru: string | null;
            branchIds: string[];
            patientTypes: string[];
        }) | null;
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
        body_uz: string;
        body_ru: string;
        slug: string;
        postType: string;
        categoryId: string | null;
        authorId: string | null;
        excerpt_uz: string | null;
        excerpt_ru: string | null;
        coverId: string | null;
        tags: string[];
        status: string;
        publishAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title_uz: string;
        title_ru: string;
        body_uz: string;
        body_ru: string;
        slug: string;
        postType: string;
        categoryId: string | null;
        authorId: string | null;
        excerpt_uz: string | null;
        excerpt_ru: string | null;
        coverId: string | null;
        tags: string[];
        status: string;
        publishAt: Date;
    }>;
}
//# sourceMappingURL=posts.controller.d.ts.map