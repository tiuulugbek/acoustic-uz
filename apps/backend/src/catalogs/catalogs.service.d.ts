import { PrismaService } from '../prisma/prisma.service';
export declare class CatalogsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(publicOnly?: boolean, showOnHomepage?: boolean): Promise<({
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
        slug: string;
        status: string;
        name_uz: string;
        name_ru: string;
        description_uz: string | null;
        description_ru: string | null;
        imageId: string | null;
        order: number;
        icon: string | null;
        showOnHomepage: boolean;
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
    } & {
        id: string;
        slug: string;
        status: string;
        name_uz: string;
        name_ru: string;
        description_uz: string | null;
        description_ru: string | null;
        imageId: string | null;
        order: number;
        icon: string | null;
        showOnHomepage: boolean;
    }) | null>;
    findBySlug(slug: string, publicOnly?: boolean): Promise<({
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
        slug: string;
        status: string;
        name_uz: string;
        name_ru: string;
        description_uz: string | null;
        description_ru: string | null;
        imageId: string | null;
        order: number;
        icon: string | null;
        showOnHomepage: boolean;
    }) | null>;
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
        slug: string;
        status: string;
        name_uz: string;
        name_ru: string;
        description_uz: string | null;
        description_ru: string | null;
        imageId: string | null;
        order: number;
        icon: string | null;
        showOnHomepage: boolean;
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
        slug: string;
        status: string;
        name_uz: string;
        name_ru: string;
        description_uz: string | null;
        description_ru: string | null;
        imageId: string | null;
        order: number;
        icon: string | null;
        showOnHomepage: boolean;
    }>;
    delete(id: string): Promise<{
        id: string;
        slug: string;
        status: string;
        name_uz: string;
        name_ru: string;
        description_uz: string | null;
        description_ru: string | null;
        imageId: string | null;
        order: number;
        icon: string | null;
        showOnHomepage: boolean;
    }>;
}
//# sourceMappingURL=catalogs.service.d.ts.map