import { ShowcasesService } from './showcases.service';
export declare class ShowcasesController {
    private readonly service;
    constructor(service: ShowcasesService);
    findOne(type: 'interacoustics' | 'cochlear'): Promise<{
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
        id: string;
        updatedAt: Date;
        type: string;
        productMetadata: import("@prisma/client/runtime/library").JsonValue | null;
        productIds: string[];
    }>;
    update(type: 'interacoustics' | 'cochlear', dto: {
        productIds: string[];
    }): Promise<{
        id: string;
        updatedAt: Date;
        type: string;
        productMetadata: import("@prisma/client/runtime/library").JsonValue | null;
        productIds: string[];
    }>;
}
//# sourceMappingURL=showcases.controller.d.ts.map