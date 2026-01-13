import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class BranchesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<any[]>;
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
        slug: string | null;
        name_uz: string;
        name_ru: string;
        imageId: string | null;
        order: number;
        address_uz: string;
        address_ru: string;
        phone: string;
        phones: string[];
        map_iframe: string | null;
        tour3d_iframe: string | null;
        tour3d_config: Prisma.JsonValue | null;
        latitude: number | null;
        longitude: number | null;
        workingHours_uz: string | null;
        workingHours_ru: string | null;
        serviceIds: string[];
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
        slug: string | null;
        name_uz: string;
        name_ru: string;
        imageId: string | null;
        order: number;
        address_uz: string;
        address_ru: string;
        phone: string;
        phones: string[];
        map_iframe: string | null;
        tour3d_iframe: string | null;
        tour3d_config: Prisma.JsonValue | null;
        latitude: number | null;
        longitude: number | null;
        workingHours_uz: string | null;
        workingHours_ru: string | null;
        serviceIds: string[];
    }>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string | null;
        name_uz: string;
        name_ru: string;
        imageId: string | null;
        order: number;
        address_uz: string;
        address_ru: string;
        phone: string;
        phones: string[];
        map_iframe: string | null;
        tour3d_iframe: string | null;
        tour3d_config: Prisma.JsonValue | null;
        latitude: number | null;
        longitude: number | null;
        workingHours_uz: string | null;
        workingHours_ru: string | null;
        serviceIds: string[];
    }>;
}
//# sourceMappingURL=branches.service.d.ts.map