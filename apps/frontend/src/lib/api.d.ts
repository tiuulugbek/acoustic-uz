export declare class ApiFetchError extends Error {
    status: number;
    constructor(status: number, message: string);
}
export interface MediaResponse {
    id: string;
    url: string;
    alt_uz?: string | null;
    alt_ru?: string | null;
}
export interface BannerResponse {
    id: string;
    title_uz: string;
    title_ru: string;
    text_uz?: string | null;
    text_ru?: string | null;
    ctaText_uz?: string | null;
    ctaText_ru?: string | null;
    ctaLink?: string | null;
    image?: MediaResponse | null;
}
export interface ServiceResponse {
    id: string;
    title_uz: string;
    title_ru: string;
    excerpt_uz?: string | null;
    excerpt_ru?: string | null;
    slug: string;
    cover?: MediaResponse | null;
    image?: MediaResponse | null;
}
export interface ProductCategoryResponse {
    id: string;
    name_uz: string;
    name_ru: string;
    slug: string;
    description_uz?: string | null;
    description_ru?: string | null;
    icon?: string | null;
    image?: MediaResponse | null;
    parentId?: string | null;
    order: number;
}
export declare const getPublicBanners: (locale?: string) => Promise<BannerResponse[]>;
export declare const getPublicServices: (locale?: string) => Promise<ServiceResponse[]>;
export declare const getHomepageServices: (locale?: string) => Promise<ServiceResponse[]>;
export declare const getProductCategories: (locale?: string) => Promise<ProductCategoryResponse[]>;
export interface CatalogResponse {
    id: string;
    name_uz: string;
    name_ru: string;
    slug: string;
    description_uz?: string | null;
    description_ru?: string | null;
    icon?: string | null;
    image?: MediaResponse | null;
    order: number;
    status: string;
    showOnHomepage?: boolean;
}
export declare const getCatalogs: (locale?: string, showOnHomepage?: boolean) => Promise<CatalogResponse[]>;
export declare const getCatalogBySlug: (slug: string, locale?: string) => Promise<CatalogResponse | null>;
export interface ServiceCategoryResponse {
    id: string;
    name_uz: string;
    name_ru: string;
    slug: string;
    description_uz?: string | null;
    description_ru?: string | null;
    icon?: string | null;
    image?: MediaResponse | null;
    parentId?: string | null;
    parent?: ServiceCategoryResponse | null;
    children?: ServiceCategoryResponse[] | null;
    services?: ServiceResponse[] | null;
    order: number;
    status: string;
}
export interface ServiceCategoriesListResponse {
    items: ServiceCategoryResponse[];
    total: number;
    page: number;
    pageSize: number;
}
export declare const getServiceCategories: (locale?: string, limit?: number, offset?: number) => Promise<ServiceCategoryResponse[]>;
export declare const getServiceCategoryBySlug: (slug: string, locale?: string) => Promise<ServiceCategoryResponse | null>;
export declare const getCategoryBySlug: (slug: string, locale?: string) => Promise<ProductCategoryResponse | null>;
export interface MenuItemResponse {
    id: string;
    title_uz: string;
    title_ru: string;
    href: string;
    order: number;
    children?: MenuItemResponse[];
}
export interface MenuResponse {
    id: string;
    name: string;
    items: MenuItemResponse[];
}
export declare const getMenu: (name: string, locale?: string) => Promise<MenuResponse>;
export interface ServiceDetailResponse extends ServiceResponse {
    body_uz?: string | null;
    body_ru?: string | null;
    order: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}
export declare const getServiceBySlug: (slug: string, locale?: string) => Promise<ServiceDetailResponse | null>;
export interface ProductResponse {
    id: string;
    name_uz: string;
    name_ru: string;
    slug: string;
    price?: string | null;
    description_uz?: string | null;
    description_ru?: string | null;
    specsText?: string | null;
    brand?: {
        id: string;
        name: string;
        slug: string;
        logo?: MediaResponse | null;
    } | null;
    category?: {
        id: string;
        name_uz: string;
        name_ru: string;
        slug: string;
    } | null;
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
    galleryIds: string[];
    galleryUrls: string[];
    relatedProductIds: string[];
    usefulArticleSlugs: string[];
    relatedProducts?: RelatedProductSummary[];
    usefulArticles?: UsefulArticleSummary[];
}
export interface RelatedProductSummary {
    id: string;
    name_uz: string;
    name_ru: string;
    slug: string;
    price?: string | null;
    brand?: {
        id: string;
        name: string;
        slug: string;
        logo?: MediaResponse | null;
    } | null;
    galleryUrls?: string[];
    availabilityStatus?: string | null;
}
export interface UsefulArticleSummary {
    id: string;
    title_uz: string;
    title_ru: string;
    slug: string;
    excerpt_uz?: string | null;
    excerpt_ru?: string | null;
}
export interface ShowcaseResponse {
    id: string;
    type: 'interacoustics' | 'cochlear';
    products: ProductResponse[];
}
export declare const getShowcase: (type: "interacoustics" | "cochlear", locale?: string) => Promise<ShowcaseResponse | null>;
export declare const getProductBySlug: (slug: string, locale?: string) => Promise<ProductResponse | null>;
export interface ProductListParams {
    status?: string;
    brandId?: string;
    categoryId?: string;
    catalogId?: string;
    productType?: string;
    search?: string;
    audience?: string;
    formFactor?: string;
    signalProcessing?: string;
    powerLevel?: string;
    hearingLossLevel?: string;
    smartphoneCompatibility?: string;
    paymentOption?: string;
    availabilityStatus?: string;
    limit?: number;
    offset?: number;
    sort?: 'newest' | 'price_asc' | 'price_desc';
}
export interface ProductListResponse {
    items: ProductResponse[];
    total: number;
    page: number;
    pageSize: number;
}
export declare const getProducts: (params?: ProductListParams, locale?: string) => Promise<ProductListResponse>;
export interface HearingAidItemResponse {
    id: string;
    title_uz: string;
    title_ru: string;
    description_uz?: string | null;
    description_ru?: string | null;
    image?: MediaResponse | null;
    link?: string | null;
    order: number;
    status: string;
}
export declare const getHomepageHearingAidItems: (locale?: string) => Promise<HearingAidItemResponse[]>;
export interface HomepageNewsItemResponse {
    id: string;
    title_uz: string;
    title_ru: string;
    excerpt_uz?: string | null;
    excerpt_ru?: string | null;
    slug: string;
    publishedAt?: string | null;
    order: number;
    status: string;
}
export declare const getHomepageNews: (locale?: string) => Promise<HomepageNewsItemResponse[]>;
export interface DoctorResponse {
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
    image?: MediaResponse | null;
    imageId?: string | null;
    branchIds?: string[];
    patientTypes?: string[];
    order: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}
export interface PostResponse {
    id: string;
    title_uz: string;
    title_ru: string;
    body_uz: string;
    body_ru: string;
    slug: string;
    category?: PostCategoryResponse | null;
    categoryId?: string | null;
    author?: DoctorResponse | null;
    authorId?: string | null;
    excerpt_uz?: string | null;
    excerpt_ru?: string | null;
    cover?: MediaResponse | null;
    coverId?: string | null;
    postType?: 'article' | 'news';
    tags: string[];
    status: string;
    publishAt: string;
    createdAt: string;
    updatedAt: string;
}
export interface PostCategoryResponse {
    id: string;
    name_uz: string;
    name_ru: string;
    slug: string;
    description_uz?: string | null;
    description_ru?: string | null;
    section?: string | null;
    imageId?: string | null;
    image?: MediaResponse | null;
    order?: number;
    status?: string;
}
export declare const getPostCategories: (locale?: string, section?: string) => Promise<PostCategoryResponse[]>;
export declare const getPosts: (locale?: string, publicOnly?: boolean, categoryId?: string, postType?: string) => Promise<PostResponse[]>;
export declare const getPostBySlug: (slug: string, locale?: string, publicOnly?: boolean) => Promise<PostResponse>;
export interface FaqResponse {
    id: string;
    question_uz: string;
    question_ru: string;
    answer_uz?: string | null;
    answer_ru?: string | null;
    order: number;
    status: string;
}
export declare const getPublicFaq: (locale?: string) => Promise<FaqResponse[]>;
export interface HomepageJourneyStepResponse {
    id: string;
    title_uz: string;
    title_ru: string;
    description_uz?: string | null;
    description_ru?: string | null;
    order: number;
    status: string;
}
export declare const getHomepageJourney: (locale?: string) => Promise<HomepageJourneyStepResponse[]>;
export interface BrandResponse {
    id: string;
    name: string;
    slug: string;
    logo?: MediaResponse | null;
}
export declare const getBrands: (locale?: string) => Promise<BrandResponse[]>;
export interface SidebarSection {
    id: string;
    title_uz: string;
    title_ru: string;
    link: string;
    icon?: string;
    imageId?: string | null;
    order: number;
}
export interface SettingsResponse {
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
    catalogHeroImage?: MediaResponse | null;
    logoId?: string | null;
    logo?: MediaResponse | null;
    faviconId?: string | null;
    favicon?: MediaResponse | null;
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
export declare const getSettings: (locale?: string) => Promise<SettingsResponse>;
export interface BranchResponse {
    id: string;
    name_uz: string;
    name_ru: string;
    slug?: string | null;
    address_uz: string;
    address_ru: string;
    phone: string;
    phones: string[];
    image?: MediaResponse | null;
    map_iframe?: string | null;
    tour3d_iframe?: string | null;
    tour3d_config?: any | null;
    latitude?: number | null;
    longitude?: number | null;
    workingHours_uz?: string | null;
    workingHours_ru?: string | null;
    serviceIds?: string[];
    order: number;
}
export declare const getBranches: (locale?: string) => Promise<BranchResponse[]>;
export declare const getBranchBySlug: (slug: string, locale?: string) => Promise<BranchResponse>;
export interface DoctorResponse {
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
    image?: MediaResponse | null;
    order: number;
    status: string;
}
export declare const getDoctors: (locale?: string) => Promise<DoctorResponse[]>;
export declare const getDoctorBySlug: (slug: string, locale?: string) => Promise<DoctorResponse>;
export interface PageResponse {
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
    gallery?: MediaResponse[];
    videoUrl?: string | null;
    usefulArticleSlugs?: string[];
    status: string;
    createdAt: string;
    updatedAt: string;
}
export declare const getPageBySlug: (slug: string, locale?: string) => Promise<PageResponse | null>;
export interface SearchResponse {
    products: ProductResponse[];
    services: ServiceResponse[];
    posts: PostResponse[];
}
export declare const search: (query: string, locale?: string) => Promise<SearchResponse>;
export interface CreateLeadRequest {
    name: string;
    phone: string;
    email?: string | null;
    source?: string;
    message?: string;
    productId?: string | null;
}
export interface LeadResponse {
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
export declare const createLead: (data: CreateLeadRequest, locale?: string) => Promise<LeadResponse>;
export interface HearingTestRequest {
    name?: string;
    phone?: string;
    email?: string;
    deviceType: 'speaker' | 'headphone';
    volumeLevel?: number;
    leftEarResults: Record<string, boolean>;
    rightEarResults: Record<string, boolean>;
}
export interface HearingTestResponse {
    id: string;
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    deviceType: string;
    volumeLevel?: number | null;
    leftEarResults: Record<string, boolean>;
    rightEarResults: Record<string, boolean>;
    leftEarScore?: number | null;
    rightEarScore?: number | null;
    overallScore?: number | null;
    leftEarLevel?: string | null;
    rightEarLevel?: string | null;
    source: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}
export declare const submitHearingTest: (data: HearingTestRequest, locale?: string) => Promise<HearingTestResponse>;
//# sourceMappingURL=api.d.ts.map