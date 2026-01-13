import { PrismaService } from '../prisma/prisma.service';
export declare class SearchService {
    private prisma;
    constructor(prisma: PrismaService);
    search(q: string): Promise<{
        products: ({
            category: {
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
            brand: {
                name: string;
                id: string;
                slug: string;
                desc_uz: string | null;
                desc_ru: string | null;
                logoId: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            categoryId: string | null;
            status: string;
            name_uz: string;
            name_ru: string;
            description_uz: string | null;
            description_ru: string | null;
            galleryIds: string[];
            usefulArticleSlugs: string[];
            productType: string | null;
            price: import("@prisma/client/runtime/library").Decimal | null;
            stock: number | null;
            brandId: string | null;
            specsText: string | null;
            galleryUrls: string[];
            audience: string[];
            formFactors: string[];
            signalProcessing: string | null;
            powerLevel: string | null;
            hearingLossLevels: string[];
            smartphoneCompatibility: string[];
            tinnitusSupport: boolean | null;
            paymentOptions: string[];
            availabilityStatus: string | null;
            intro_uz: string | null;
            intro_ru: string | null;
            features_uz: string[];
            features_ru: string[];
            benefits_uz: string[];
            benefits_ru: string[];
            tech_uz: string | null;
            tech_ru: string | null;
            fittingRange_uz: string | null;
            fittingRange_ru: string | null;
            regulatoryNote_uz: string | null;
            regulatoryNote_ru: string | null;
            relatedProductIds: string[];
            thumbnailId: string | null;
        })[];
        services: ({
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
        })[];
        posts: ({
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
        })[];
    }>;
}
//# sourceMappingURL=search.service.d.ts.map