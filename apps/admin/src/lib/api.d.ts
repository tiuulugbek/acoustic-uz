export declare class ApiError extends Error {
    status: number;
    constructor(message: string, status: number);
}
export interface UserDto {
    id: string;
    email: string;
    fullName?: string | null;
    role?: {
        id: string;
        name: string;
    } | null;
}
export interface PostDto {
    id: string;
    title_uz: string;
    title_ru: string;
    body_uz: string;
    body_ru: string;
    slug: string;
    postType?: 'article' | 'news';
    categoryId?: string | null;
    category?: PostCategoryDto | null;
    authorId?: string | null;
    author?: DoctorDto | null;
    excerpt_uz?: string | null;
    excerpt_ru?: string | null;
    coverId?: string | null;
    cover?: {
        id: string;
        url: string;
    } | null;
    tags: string[];
    status: 'published' | 'draft' | 'archived';
    publishAt: string;
    createdAt: string;
    updatedAt: string;
}
export type CreatePostPayload = Omit<PostDto, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePostPayload = Partial<CreatePostPayload>;
export declare const login: (payload: {
    email: string;
    password: string;
}) => Promise<{
    user: UserDto;
}>;
export declare const logout: () => Promise<void>;
export declare const getCurrentUser: () => Promise<UserDto>;
export declare const getPosts: () => Promise<PostDto[]>;
export declare const createPost: (payload: CreatePostPayload) => Promise<PostDto>;
export declare const updatePost: (id: string, payload: UpdatePostPayload) => Promise<PostDto>;
export declare const deletePost: (id: string) => Promise<void>;
export interface PostCategoryDto {
    id: string;
    name_uz: string;
    name_ru: string;
    slug: string;
    description_uz?: string | null;
    description_ru?: string | null;
    section?: string | null;
    imageId?: string | null;
    image?: MediaDto | null;
    order: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}
export type CreatePostCategoryPayload = Omit<PostCategoryDto, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePostCategoryPayload = Partial<CreatePostCategoryPayload>;
export declare const getPostCategories: (section?: string) => Promise<PostCategoryDto[]>;
export declare const createPostCategory: (payload: CreatePostCategoryPayload) => Promise<PostCategoryDto>;
export declare const updatePostCategory: (id: string, payload: UpdatePostCategoryPayload) => Promise<PostCategoryDto>;
export declare const deletePostCategory: (id: string) => Promise<void>;
export interface ServiceDto {
    id: string;
    title_uz: string;
    title_ru: string;
    excerpt_uz?: string | null;
    excerpt_ru?: string | null;
    body_uz?: string | null;
    body_ru?: string | null;
    slug: string;
    order: number;
    status: 'published' | 'draft' | 'archived';
    categoryId?: string | null;
    category?: {
        id: string;
        name_uz: string;
        name_ru: string;
        slug: string;
    } | null;
    cover?: {
        id: string;
        url: string;
    } | null;
    createdAt: string;
    updatedAt: string;
}
export type CreateServicePayload = {
    title_uz: string;
    title_ru: string;
    excerpt_uz?: string | null;
    excerpt_ru?: string | null;
    body_uz?: string | null;
    body_ru?: string | null;
    slug: string;
    order?: number;
    status?: ServiceDto['status'];
    coverId?: string | null;
    categoryId?: string | null;
};
export type UpdateServicePayload = Partial<CreateServicePayload>;
export declare const getServices: () => Promise<ServiceDto[]>;
export declare const createService: (payload: CreateServicePayload) => Promise<ServiceDto>;
export declare const updateService: (id: string, payload: UpdateServicePayload) => Promise<ServiceDto>;
export declare const deleteService: (id: string) => Promise<void>;
export interface DoctorDto {
    id: string;
    name_uz: string;
    name_ru: string;
    position_uz?: string | null;
    position_ru?: string | null;
    experience_uz?: string | null;
    experience_ru?: string | null;
    description_uz?: string | null;
    description_ru?: string | null;
    slug: string;
    imageId?: string | null;
    image?: {
        id: string;
        url: string;
        alt_uz?: string | null;
        alt_ru?: string | null;
    } | null;
    branchIds: string[];
    patientTypes: string[];
    order: number;
    status: 'published' | 'draft' | 'archived';
    createdAt: string;
    updatedAt: string;
}
export type CreateDoctorPayload = {
    name_uz: string;
    name_ru: string;
    position_uz?: string | null;
    position_ru?: string | null;
    experience_uz?: string | null;
    experience_ru?: string | null;
    description_uz?: string | null;
    description_ru?: string | null;
    slug: string;
    imageId?: string | null;
    order?: number;
    status?: DoctorDto['status'];
};
export type UpdateDoctorPayload = Partial<CreateDoctorPayload>;
export declare const getDoctors: () => Promise<DoctorDto[]>;
export declare const createDoctor: (payload: CreateDoctorPayload) => Promise<DoctorDto>;
export declare const updateDoctor: (id: string, payload: UpdateDoctorPayload) => Promise<DoctorDto>;
export declare const deleteDoctor: (id: string) => Promise<void>;
export interface ServiceCategoryDto {
    id: string;
    name_uz: string;
    name_ru: string;
    slug: string;
    description_uz?: string | null;
    description_ru?: string | null;
    icon?: string | null;
    imageId?: string | null;
    image?: {
        id: string;
        url: string;
    } | null;
    parentId?: string | null;
    parent?: ServiceCategoryDto | null;
    children?: ServiceCategoryDto[];
    services?: ServiceDto[];
    order: number;
    status: 'published' | 'draft' | 'archived';
    createdAt: string;
    updatedAt: string;
}
export type CreateServiceCategoryPayload = {
    name_uz: string;
    name_ru: string;
    slug: string;
    description_uz?: string | null;
    description_ru?: string | null;
    icon?: string | null;
    imageId?: string | null;
    parentId?: string | null;
    order?: number;
    status?: ServiceCategoryDto['status'];
};
export type UpdateServiceCategoryPayload = Partial<CreateServiceCategoryPayload>;
export declare const getServiceCategoriesAdmin: () => Promise<ServiceCategoryDto[]>;
export declare const createServiceCategory: (payload: CreateServiceCategoryPayload) => Promise<ServiceCategoryDto>;
export declare const updateServiceCategory: (id: string, payload: UpdateServiceCategoryPayload) => Promise<ServiceCategoryDto>;
export declare const deleteServiceCategory: (id: string) => Promise<void>;
export interface HomepageHearingAidDto {
    id: string;
    title_uz: string;
    title_ru: string;
    description_uz?: string | null;
    description_ru?: string | null;
    link?: string | null;
    order: number;
    status: 'published' | 'draft' | 'archived';
    image?: {
        id: string;
        url: string;
    } | null;
    createdAt: string;
    updatedAt: string;
}
export type CreateHomepageHearingAidPayload = {
    title_uz: string;
    title_ru: string;
    description_uz?: string | null;
    description_ru?: string | null;
    link?: string | null;
    order?: number;
    status?: HomepageHearingAidDto['status'];
    imageId?: string | null;
};
export type UpdateHomepageHearingAidPayload = Partial<CreateHomepageHearingAidPayload>;
export declare const getHomepageHearingAids: () => Promise<HomepageHearingAidDto[]>;
export declare const createHomepageHearingAid: (payload: CreateHomepageHearingAidPayload) => Promise<HomepageHearingAidDto>;
export declare const updateHomepageHearingAid: (id: string, payload: UpdateHomepageHearingAidPayload) => Promise<HomepageHearingAidDto>;
export declare const deleteHomepageHearingAid: (id: string) => Promise<void>;
export interface HomepageJourneyStepDto {
    id: string;
    title_uz: string;
    title_ru: string;
    description_uz?: string | null;
    description_ru?: string | null;
    order: number;
    status: 'published' | 'draft' | 'archived';
    createdAt: string;
    updatedAt: string;
}
export type CreateHomepageJourneyPayload = {
    title_uz: string;
    title_ru: string;
    description_uz?: string | null;
    description_ru?: string | null;
    order?: number;
    status?: HomepageJourneyStepDto['status'];
};
export type UpdateHomepageJourneyPayload = Partial<CreateHomepageJourneyPayload>;
export declare const getHomepageJourneySteps: () => Promise<HomepageJourneyStepDto[]>;
export declare const createHomepageJourneyStep: (payload: CreateHomepageJourneyPayload) => Promise<HomepageJourneyStepDto>;
export declare const updateHomepageJourneyStep: (id: string, payload: UpdateHomepageJourneyPayload) => Promise<HomepageJourneyStepDto>;
export declare const deleteHomepageJourneyStep: (id: string) => Promise<void>;
export interface HomepageNewsItemDto {
    id: string;
    title_uz: string;
    title_ru: string;
    excerpt_uz?: string | null;
    excerpt_ru?: string | null;
    slug?: string | null;
    publishedAt?: string | null;
    order: number;
    status: 'published' | 'draft' | 'archived';
    post?: {
        id: string;
        title_uz: string;
        title_ru: string;
        slug: string;
    } | null;
    createdAt: string;
    updatedAt: string;
}
export type CreateHomepageNewsPayload = {
    postId?: string | null;
    title_uz: string;
    title_ru: string;
    excerpt_uz?: string | null;
    excerpt_ru?: string | null;
    slug?: string | null;
    publishedAt?: string | null;
    order?: number;
    status?: HomepageNewsItemDto['status'];
};
export type UpdateHomepageNewsPayload = Partial<CreateHomepageNewsPayload>;
export declare const getHomepageNewsItems: () => Promise<HomepageNewsItemDto[]>;
export declare const createHomepageNewsItem: (payload: CreateHomepageNewsPayload) => Promise<HomepageNewsItemDto>;
export declare const updateHomepageNewsItem: (id: string, payload: UpdateHomepageNewsPayload) => Promise<HomepageNewsItemDto>;
export declare const deleteHomepageNewsItem: (id: string) => Promise<void>;
export interface HomepageServiceDto {
    id: string;
    title_uz: string;
    title_ru: string;
    excerpt_uz?: string | null;
    excerpt_ru?: string | null;
    slug?: string | null;
    order: number;
    status: 'published' | 'draft' | 'archived';
    image?: {
        id: string;
        url: string;
    } | null;
    createdAt: string;
    updatedAt: string;
}
export type CreateHomepageServicePayload = {
    title_uz: string;
    title_ru: string;
    excerpt_uz?: string | null;
    excerpt_ru?: string | null;
    slug?: string | null;
    order?: number;
    status?: HomepageServiceDto['status'];
    imageId?: string | null;
};
export type UpdateHomepageServicePayload = Partial<CreateHomepageServicePayload>;
export declare const getHomepageServices: () => Promise<HomepageServiceDto[]>;
export declare const createHomepageService: (payload: CreateHomepageServicePayload) => Promise<HomepageServiceDto>;
export declare const updateHomepageService: (id: string, payload: UpdateHomepageServicePayload) => Promise<HomepageServiceDto>;
export declare const deleteHomepageService: (id: string) => Promise<void>;
export interface HomepageSectionDto {
    id: string;
    key: string;
    title_uz?: string | null;
    title_ru?: string | null;
    subtitle_uz?: string | null;
    subtitle_ru?: string | null;
    description_uz?: string | null;
    description_ru?: string | null;
    showTitle: boolean;
    showSubtitle: boolean;
    showDescription: boolean;
    order: number;
    status: 'published' | 'draft' | 'hidden';
    createdAt: string;
    updatedAt: string;
}
export type CreateHomepageSectionPayload = {
    key: string;
    title_uz?: string | null;
    title_ru?: string | null;
    subtitle_uz?: string | null;
    subtitle_ru?: string | null;
    description_uz?: string | null;
    description_ru?: string | null;
    showTitle?: boolean;
    showSubtitle?: boolean;
    showDescription?: boolean;
    order?: number;
    status?: HomepageSectionDto['status'];
};
export type UpdateHomepageSectionPayload = Partial<CreateHomepageSectionPayload>;
export declare const getHomepageSections: () => Promise<HomepageSectionDto[]>;
export declare const createHomepageSection: (payload: CreateHomepageSectionPayload) => Promise<HomepageSectionDto>;
export declare const updateHomepageSection: (key: string, payload: UpdateHomepageSectionPayload) => Promise<HomepageSectionDto>;
export declare const deleteHomepageSection: (key: string) => Promise<void>;
export interface HomepageLinkDto {
    id: string;
    sectionKey: string;
    text_uz: string;
    text_ru: string;
    href: string;
    icon?: string | null;
    position: 'bottom' | 'header' | 'inline';
    order: number;
    status: 'published' | 'draft';
    createdAt: string;
    updatedAt: string;
}
export type CreateHomepageLinkPayload = {
    sectionKey: string;
    text_uz: string;
    text_ru: string;
    href: string;
    icon?: string | null;
    position: 'bottom' | 'header' | 'inline';
    order?: number;
    status?: HomepageLinkDto['status'];
};
export type UpdateHomepageLinkPayload = Partial<CreateHomepageLinkPayload>;
export declare const getHomepageLinks: () => Promise<HomepageLinkDto[]>;
export declare const createHomepageLink: (payload: CreateHomepageLinkPayload) => Promise<HomepageLinkDto>;
export declare const updateHomepageLink: (id: string, payload: UpdateHomepageLinkPayload) => Promise<HomepageLinkDto>;
export declare const deleteHomepageLink: (id: string) => Promise<void>;
export interface HomepagePlaceholderDto {
    id: string;
    sectionKey: string;
    text_uz?: string | null;
    text_ru?: string | null;
    backgroundColor?: string | null;
    textColor?: string | null;
    fontSize?: string | null;
    fontWeight?: string | null;
    imageId?: string | null;
    image?: {
        id: string;
        url: string;
    } | null;
    createdAt: string;
    updatedAt: string;
}
export type CreateHomepagePlaceholderPayload = {
    sectionKey: string;
    text_uz?: string | null;
    text_ru?: string | null;
    backgroundColor?: string | null;
    textColor?: string | null;
    fontSize?: string | null;
    fontWeight?: string | null;
    imageId?: string | null;
};
export type UpdateHomepagePlaceholderPayload = Partial<CreateHomepagePlaceholderPayload>;
export declare const getHomepagePlaceholders: () => Promise<HomepagePlaceholderDto[]>;
export declare const createHomepagePlaceholder: (payload: CreateHomepagePlaceholderPayload) => Promise<HomepagePlaceholderDto>;
export declare const updateHomepagePlaceholder: (sectionKey: string, payload: UpdateHomepagePlaceholderPayload) => Promise<HomepagePlaceholderDto>;
export declare const deleteHomepagePlaceholder: (sectionKey: string) => Promise<void>;
export interface HomepageEmptyStateDto {
    id: string;
    sectionKey: string;
    message_uz: string;
    message_ru: string;
    icon?: string | null;
    createdAt: string;
    updatedAt: string;
}
export type CreateHomepageEmptyStatePayload = {
    sectionKey: string;
    message_uz: string;
    message_ru: string;
    icon?: string | null;
};
export type UpdateHomepageEmptyStatePayload = Partial<CreateHomepageEmptyStatePayload>;
export declare const getHomepageEmptyStates: () => Promise<HomepageEmptyStateDto[]>;
export declare const createHomepageEmptyState: (payload: CreateHomepageEmptyStatePayload) => Promise<HomepageEmptyStateDto>;
export declare const updateHomepageEmptyState: (sectionKey: string, payload: UpdateHomepageEmptyStatePayload) => Promise<HomepageEmptyStateDto>;
export declare const deleteHomepageEmptyState: (sectionKey: string) => Promise<void>;
export interface CatalogPageConfigDto {
    id: string;
    hearingAidsTitle_uz?: string | null;
    hearingAidsTitle_ru?: string | null;
    interacousticsTitle_uz?: string | null;
    interacousticsTitle_ru?: string | null;
    accessoriesTitle_uz?: string | null;
    accessoriesTitle_ru?: string | null;
    updatedAt: string;
}
export type UpdateCatalogPageConfigPayload = Partial<{
    hearingAidsTitle_uz?: string | null;
    hearingAidsTitle_ru?: string | null;
    interacousticsTitle_uz?: string | null;
    interacousticsTitle_ru?: string | null;
    accessoriesTitle_uz?: string | null;
    accessoriesTitle_ru?: string | null;
}>;
export declare const getCatalogPageConfig: () => Promise<CatalogPageConfigDto>;
export declare const updateCatalogPageConfig: (payload: UpdateCatalogPageConfigPayload) => Promise<CatalogPageConfigDto>;
export interface CommonTextDto {
    id: string;
    key: string;
    text_uz: string;
    text_ru: string;
    category?: string | null;
    createdAt: string;
    updatedAt: string;
}
export type CreateCommonTextPayload = {
    key: string;
    text_uz: string;
    text_ru: string;
    category?: string | null;
};
export type UpdateCommonTextPayload = Partial<CreateCommonTextPayload>;
export declare const getCommonTexts: () => Promise<CommonTextDto[]>;
export declare const createCommonText: (payload: CreateCommonTextPayload) => Promise<CommonTextDto>;
export declare const updateCommonText: (key: string, payload: UpdateCommonTextPayload) => Promise<CommonTextDto>;
export declare const deleteCommonText: (key: string) => Promise<void>;
export interface AvailabilityStatusDto {
    id: string;
    key: string;
    label_uz: string;
    label_ru: string;
    schema?: string | null;
    colorClass?: string | null;
    order: number;
    createdAt: string;
    updatedAt: string;
}
export type CreateAvailabilityStatusPayload = {
    key: string;
    label_uz: string;
    label_ru: string;
    schema?: string | null;
    colorClass?: string | null;
    order?: number;
};
export type UpdateAvailabilityStatusPayload = Partial<CreateAvailabilityStatusPayload>;
export declare const getAvailabilityStatuses: () => Promise<AvailabilityStatusDto[]>;
export declare const createAvailabilityStatus: (payload: CreateAvailabilityStatusPayload) => Promise<AvailabilityStatusDto>;
export declare const updateAvailabilityStatus: (key: string, payload: UpdateAvailabilityStatusPayload) => Promise<AvailabilityStatusDto>;
export declare const deleteAvailabilityStatus: (key: string) => Promise<void>;
export interface BannerDto {
    id: string;
    title_uz: string;
    title_ru: string;
    text_uz?: string | null;
    text_ru?: string | null;
    ctaText_uz?: string | null;
    ctaText_ru?: string | null;
    ctaLink?: string | null;
    imageId?: string | null;
    image?: {
        id: string;
        url: string;
    } | null;
    order: number;
    status: 'published' | 'draft' | 'archived';
    createdAt: string;
    updatedAt: string;
}
export type CreateBannerPayload = {
    title_uz: string;
    title_ru: string;
    text_uz?: string | null;
    text_ru?: string | null;
    ctaText_uz?: string | null;
    ctaText_ru?: string | null;
    ctaLink?: string | null;
    imageId?: string | null;
    order?: number;
    status?: BannerDto['status'];
};
export type UpdateBannerPayload = Partial<CreateBannerPayload>;
export declare const getBannersAdmin: () => Promise<BannerDto[]>;
export declare const createBanner: (payload: CreateBannerPayload) => Promise<BannerDto>;
export declare const updateBanner: (id: string, payload: UpdateBannerPayload) => Promise<BannerDto>;
export declare const deleteBanner: (id: string) => Promise<void>;
export interface MediaDto {
    id: string;
    url: string;
    filename: string;
    mimeType: string;
    size: number;
    alt_uz?: string | null;
    alt_ru?: string | null;
    createdAt: string;
    updatedAt: string;
}
export declare const getMedia: () => Promise<MediaDto[]>;
export declare const uploadMedia: (file: File, alt_uz?: string, alt_ru?: string, skipWebp?: boolean) => Promise<MediaDto>;
export declare const deleteMedia: (id: string) => Promise<void>;
export declare const updateMedia: (id: string, alt_uz?: string, alt_ru?: string) => Promise<MediaDto>;
export interface MenuItemDto {
    id: string;
    title_uz: string;
    title_ru: string;
    href: string;
    order: number;
    children?: MenuItemDto[];
}
export interface MenuDto {
    id: string;
    name: string;
    items: MenuItemDto[];
}
export declare const getMenu: (name: string) => Promise<MenuDto>;
export declare const updateMenu: (name: string, items: MenuItemDto[]) => Promise<MenuDto>;
export interface ProductCategoryDto {
    id: string;
    name_uz: string;
    name_ru: string;
    slug: string;
    description_uz?: string | null;
    description_ru?: string | null;
    icon?: string | null;
    image?: {
        id: string;
        url: string;
    } | null;
    parentId?: string | null;
    order: number;
}
export type CreateProductCategoryPayload = {
    name_uz: string;
    name_ru: string;
    slug: string;
    description_uz?: string | null;
    description_ru?: string | null;
    icon?: string | null;
    imageId?: string | null;
    parentId?: string | null;
    order?: number;
};
export type UpdateProductCategoryPayload = Partial<CreateProductCategoryPayload>;
export declare const getProductCategoriesAdmin: () => Promise<ProductCategoryDto[]>;
export declare const createProductCategory: (payload: CreateProductCategoryPayload) => Promise<ProductCategoryDto>;
export declare const updateProductCategory: (id: string, payload: UpdateProductCategoryPayload) => Promise<ProductCategoryDto>;
export declare const deleteProductCategory: (id: string) => Promise<void>;
export interface CatalogDto {
    id: string;
    name_uz: string;
    name_ru: string;
    slug: string;
    description_uz?: string | null;
    description_ru?: string | null;
    icon?: string | null;
    image?: {
        id: string;
        url: string;
    } | null;
    order: number;
    status: 'published' | 'draft' | 'archived';
    showOnHomepage: boolean;
    createdAt: string;
    updatedAt: string;
}
export type CreateCatalogPayload = {
    name_uz: string;
    name_ru: string;
    slug: string;
    description_uz?: string | null;
    description_ru?: string | null;
    icon?: string | null;
    imageId?: string | null;
    order?: number;
    status?: CatalogDto['status'];
    showOnHomepage?: boolean;
};
export type UpdateCatalogPayload = Partial<CreateCatalogPayload>;
export declare const getCatalogsAdmin: () => Promise<CatalogDto[]>;
export declare const getCatalogs: () => Promise<CatalogDto[]>;
export declare const createCatalog: (payload: CreateCatalogPayload) => Promise<CatalogDto>;
export declare const updateCatalog: (id: string, payload: UpdateCatalogPayload) => Promise<CatalogDto>;
export declare const deleteCatalog: (id: string) => Promise<void>;
export interface BrandDto {
    id: string;
    name: string;
    slug: string;
    desc_uz?: string | null;
    desc_ru?: string | null;
    logo?: {
        id: string;
        url: string;
    } | null;
}
export declare const getBrands: () => Promise<BrandDto[]>;
export type CreateBrandPayload = {
    name: string;
    slug: string;
    desc_uz?: string | null;
    desc_ru?: string | null;
    logoId?: string | null;
};
export type UpdateBrandPayload = Partial<CreateBrandPayload>;
export declare const createBrand: (payload: CreateBrandPayload) => Promise<BrandDto>;
export declare const updateBrand: (id: string, payload: UpdateBrandPayload) => Promise<BrandDto>;
export declare const deleteBrand: (id: string) => Promise<void>;
export interface ProductDto {
    id: string;
    name_uz: string;
    name_ru: string;
    slug: string;
    productType?: string | null;
    description_uz?: string | null;
    description_ru?: string | null;
    price?: string | null;
    stock?: number | null;
    brandId?: string | null;
    categoryId?: string | null;
    status: 'published' | 'draft' | 'archived';
    specsText?: string | null;
    galleryIds: string[];
    galleryUrls: string[];
    brand?: BrandDto | null;
    category?: ProductCategoryDto | null;
    catalogs?: CatalogDto[];
    createdAt: string;
    updatedAt: string;
    audience: string[];
    formFactors: string[];
    signalProcessing?: string | null;
    powerLevel?: string | null;
    hearingLossLevels: string[];
    smartphoneCompatibility: string[];
    tinnitusSupport?: boolean | null;
    paymentOptions: string[];
    availabilityStatus?: string | null;
    intro_uz?: string | null;
    intro_ru?: string | null;
    features_uz: string[];
    features_ru: string[];
    benefits_uz: string[];
    benefits_ru: string[];
    tech_uz?: string | null;
    tech_ru?: string | null;
    fittingRange_uz?: string | null;
    fittingRange_ru?: string | null;
    regulatoryNote_uz?: string | null;
    regulatoryNote_ru?: string | null;
    relatedProductIds: string[];
    usefulArticleSlugs: string[];
}
export type CreateProductPayload = {
    name_uz: string;
    name_ru: string;
    slug: string;
    productType?: string | null;
    description_uz?: string | null;
    description_ru?: string | null;
    price?: number | null;
    stock?: number | null;
    brandId?: string | null;
    categoryId?: string | null;
    catalogIds?: string[];
    status?: ProductDto['status'];
    specsText?: string | null;
    galleryIds?: string[];
    galleryUrls?: string[];
    audience?: string[];
    formFactors?: string[];
    signalProcessing?: string | null;
    powerLevel?: string | null;
    hearingLossLevels?: string[];
    smartphoneCompatibility?: string[];
    tinnitusSupport?: boolean | null;
    paymentOptions?: string[];
    availabilityStatus?: string | null;
    intro_uz?: string | null;
    intro_ru?: string | null;
    features_uz?: string[];
    features_ru?: string[];
    benefits_uz?: string[];
    benefits_ru?: string[];
    tech_uz?: string | null;
    tech_ru?: string | null;
    fittingRange_uz?: string | null;
    fittingRange_ru?: string | null;
    regulatoryNote_uz?: string | null;
    regulatoryNote_ru?: string | null;
    relatedProductIds?: string[];
    usefulArticleSlugs?: string[];
};
export type UpdateProductPayload = Partial<CreateProductPayload>;
export declare const getProductsAdmin: (filters?: {
    limit?: number;
    offset?: number;
    status?: string;
}) => Promise<{
    items: ProductDto[];
    total: number;
    page: number;
    pageSize: number;
}>;
export declare const createProduct: (payload: CreateProductPayload) => Promise<ProductDto>;
export declare const updateProduct: (id: string, payload: UpdateProductPayload) => Promise<ProductDto>;
export declare const deleteProduct: (id: string) => Promise<void>;
export interface ImportExcelResult {
    success: number;
    failed: number;
    errors: Array<{
        row: number;
        error: string;
    }>;
}
export declare const importProductsFromExcel: (file: File) => Promise<ImportExcelResult>;
export declare const downloadExcelTemplate: () => Promise<Blob>;
export interface FaqDto {
    id: string;
    question_uz: string;
    question_ru: string;
    answer_uz: string;
    answer_ru: string;
    order: number;
    status: 'published' | 'draft' | 'archived';
    createdAt: string;
    updatedAt: string;
}
export type CreateFaqPayload = {
    question_uz: string;
    question_ru: string;
    answer_uz: string;
    answer_ru: string;
    order?: number;
    status?: 'published' | 'draft' | 'archived';
};
export type UpdateFaqPayload = Partial<CreateFaqPayload>;
export declare const getFaqsAdmin: () => Promise<FaqDto[]>;
export declare const createFaq: (payload: CreateFaqPayload) => Promise<FaqDto>;
export declare const updateFaq: (id: string, payload: UpdateFaqPayload) => Promise<FaqDto>;
export declare const deleteFaq: (id: string) => Promise<void>;
export interface PageDto {
    id: string;
    slug: string;
    title_uz: string;
    title_ru: string;
    body_uz?: string | null;
    body_ru?: string | null;
    metaTitle_uz?: string | null;
    metaTitle_ru?: string | null;
    metaDescription_uz?: string | null;
    metaDescription_ru?: string | null;
    galleryIds?: string[];
    videoUrl?: string | null;
    usefulArticleSlugs?: string[];
    status: 'published' | 'draft' | 'archived';
    createdAt: string;
    updatedAt: string;
}
export type CreatePagePayload = {
    slug: string;
    title_uz: string;
    title_ru: string;
    body_uz?: string | null;
    body_ru?: string | null;
    metaTitle_uz?: string | null;
    metaTitle_ru?: string | null;
    metaDescription_uz?: string | null;
    metaDescription_ru?: string | null;
    galleryIds?: string[];
    videoUrl?: string | null;
    usefulArticleSlugs?: string[];
    status?: 'published' | 'draft' | 'archived';
};
export type UpdatePagePayload = Partial<CreatePagePayload>;
export declare const getPages: () => Promise<PageDto[]>;
export declare const getPageBySlug: (slug: string, includeDraft?: boolean) => Promise<PageDto | null>;
export declare const createPage: (payload: CreatePagePayload) => Promise<PageDto>;
export declare const updatePage: (id: string, payload: UpdatePagePayload) => Promise<PageDto>;
export declare const deletePage: (id: string) => Promise<void>;
export interface BranchDto {
    slug?: string | null;
    id: string;
    name_uz: string;
    name_ru: string;
    address_uz: string;
    address_ru: string;
    phone: string;
    phones: string[];
    imageId?: string | null;
    image?: {
        id: string;
        url: string;
        alt_uz?: string | null;
        alt_ru?: string | null;
    } | null;
    map_iframe?: string | null;
    tour3d_iframe?: string | null;
    tour3d_config?: any | null;
    latitude?: number | null;
    longitude?: number | null;
    workingHours_uz?: string | null;
    workingHours_ru?: string | null;
    serviceIds?: string[];
    order: number;
    createdAt: string;
    updatedAt: string;
}
export type CreateBranchPayload = {
    name_uz: string;
    name_ru: string;
    address_uz: string;
    address_ru: string;
    phone: string;
    phones?: string[];
    imageId?: string | null;
    map_iframe?: string | null;
    tour3d_iframe?: string | null;
    tour3d_config?: any | null;
    latitude?: number | null;
    longitude?: number | null;
    workingHours_uz?: string | null;
    workingHours_ru?: string | null;
    serviceIds?: string[];
    order?: number;
    slug?: string | null;
};
export type UpdateBranchPayload = Partial<CreateBranchPayload>;
export declare const getBranches: () => Promise<BranchDto[]>;
export declare const createBranch: (payload: CreateBranchPayload) => Promise<BranchDto>;
export declare const updateBranch: (id: string, payload: UpdateBranchPayload) => Promise<BranchDto>;
export declare const deleteBranch: (id: string) => Promise<void>;
export interface ShowcaseDto {
    id: string;
    type: 'interacoustics' | 'cochlear';
    productIds: string[];
    products?: Array<{
        id: string;
        name_uz: string;
        name_ru: string;
        slug: string;
        brand?: {
            id: string;
            name: string;
            slug: string;
        } | null;
        category?: {
            id: string;
            name_uz: string;
            name_ru: string;
            slug: string;
        } | null;
    }>;
    updatedAt: string;
}
export type UpdateShowcasePayload = {
    productIds: string[];
    productMetadata?: Record<string, {
        description_uz?: string;
        description_ru?: string;
        imageId?: string;
    }>;
};
export declare const getShowcase: (type: "interacoustics" | "cochlear") => Promise<ShowcaseDto>;
export declare const updateShowcase: (type: "interacoustics" | "cochlear", payload: UpdateShowcasePayload) => Promise<ShowcaseDto>;
export interface SidebarSection {
    id: string;
    title_uz: string;
    title_ru: string;
    link: string;
    icon?: string;
    imageId?: string | null;
    order: number;
}
export interface SettingsDto {
    id: string;
    phonePrimary?: string | null;
    phoneSecondary?: string | null;
    email?: string | null;
    telegramBotToken?: string | null;
    telegramChatId?: string | null;
    telegramButtonBotToken?: string | null;
    telegramButtonBotUsername?: string | null;
    telegramButtonMessage_uz?: string | null;
    telegramButtonMessage_ru?: string | null;
    brandPrimary?: string | null;
    brandAccent?: string | null;
    featureFlags?: unknown;
    socialLinks?: unknown;
    catalogHeroImageId?: string | null;
    catalogHeroImage?: {
        id: string;
        url: string;
        alt_uz?: string | null;
        alt_ru?: string | null;
    } | null;
    logoId?: string | null;
    logo?: {
        id: string;
        url: string;
        alt_uz?: string | null;
        alt_ru?: string | null;
    } | null;
    faviconId?: string | null;
    favicon?: {
        id: string;
        url: string;
        alt_uz?: string | null;
        alt_ru?: string | null;
    } | null;
    sidebarSections?: SidebarSection[] | null;
    sidebarBrandIds?: string[];
    sidebarConfigs?: {
        catalog?: {
            sections?: SidebarSection[];
            brandIds?: string[];
        };
        products?: {
            sections?: SidebarSection[];
            brandIds?: string[];
        };
        services?: {
            sections?: SidebarSection[];
            brandIds?: string[];
        };
        posts?: {
            sections?: SidebarSection[];
            brandIds?: string[];
        };
    } | null;
    updatedAt: string;
}
export type UpdateSettingsPayload = {
    phonePrimary?: string;
    phoneSecondary?: string;
    email?: string;
    telegramBotToken?: string;
    telegramChatId?: string;
    telegramButtonBotToken?: string;
    telegramButtonBotUsername?: string;
    telegramButtonMessage_uz?: string;
    telegramButtonMessage_ru?: string;
    brandPrimary?: string;
    brandAccent?: string;
    featureFlags?: unknown;
    socialLinks?: unknown;
    catalogHeroImageId?: string | null;
    logoId?: string | null;
    faviconId?: string | null;
    sidebarSections?: SidebarSection[];
    sidebarBrandIds?: string[];
    sidebarConfigs?: {
        catalog?: {
            sections?: SidebarSection[];
            brandIds?: string[];
        };
        products?: {
            sections?: SidebarSection[];
            brandIds?: string[];
        };
        services?: {
            sections?: SidebarSection[];
            brandIds?: string[];
        };
        posts?: {
            sections?: SidebarSection[];
            brandIds?: string[];
        };
    };
};
export declare const getSettings: () => Promise<SettingsDto>;
export declare const updateSettings: (payload: UpdateSettingsPayload) => Promise<SettingsDto>;
export interface LeadDto {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    source?: string | null;
    message?: string | null;
    productId?: string | null;
    status?: string | null;
    createdAt: string;
    updatedAt: string;
}
export type UpdateLeadPayload = {
    status?: string;
};
export declare const getLeads: () => Promise<LeadDto[]>;
export declare const getLead: (id: string) => Promise<LeadDto>;
export declare const updateLead: (id: string, payload: UpdateLeadPayload) => Promise<LeadDto>;
export declare const deleteLead: (id: string) => Promise<void>;
export interface TelegramButtonStats {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
}
export declare const getTelegramButtonStats: () => Promise<TelegramButtonStats>;
//# sourceMappingURL=api.d.ts.map