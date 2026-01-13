import { MediaService } from './media.service';
import { UploadedFile as StoredFile } from './storage/storage.service';
export declare class MediaController {
    private readonly mediaService;
    private readonly logger;
    constructor(mediaService: MediaService);
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
    upload(file: StoredFile, alt_uz?: string, alt_ru?: string, skipWebp?: string): Promise<{
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
    update(id: string, updateDto: {
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
    remove(id: string): Promise<{
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
//# sourceMappingURL=media.controller.d.ts.map