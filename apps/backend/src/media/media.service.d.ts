import { PrismaService } from '../prisma/prisma.service';
import { StorageService, UploadedFile } from './storage/storage.service';
export declare class MediaService {
    private prisma;
    private storageService;
    private readonly logger;
    constructor(prisma: PrismaService, storageService: StorageService);
    findAll(): Promise<{
        id: string;
        size: number | null;
        createdAt: Date;
        updatedAt: Date;
        alt_uz: string | null;
        alt_ru: string | null;
        url: string;
        filename: string | null;
        mimeType: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        size: number | null;
        createdAt: Date;
        updatedAt: Date;
        alt_uz: string | null;
        alt_ru: string | null;
        url: string;
        filename: string | null;
        mimeType: string | null;
    }>;
    create(file: UploadedFile, alt_uz?: string, alt_ru?: string, skipWebp?: boolean): Promise<{
        id: string;
        size: number | null;
        createdAt: Date;
        updatedAt: Date;
        alt_uz: string | null;
        alt_ru: string | null;
        url: string;
        filename: string | null;
        mimeType: string | null;
    }>;
    update(id: string, data: {
        alt_uz?: string;
        alt_ru?: string;
    }): Promise<{
        id: string;
        size: number | null;
        createdAt: Date;
        updatedAt: Date;
        alt_uz: string | null;
        alt_ru: string | null;
        url: string;
        filename: string | null;
        mimeType: string | null;
    }>;
    delete(id: string): Promise<{
        id: string;
        size: number | null;
        createdAt: Date;
        updatedAt: Date;
        alt_uz: string | null;
        alt_ru: string | null;
        url: string;
        filename: string | null;
        mimeType: string | null;
    }>;
}
//# sourceMappingURL=media.service.d.ts.map