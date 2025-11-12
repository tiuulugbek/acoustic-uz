"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.homepageNewsItemSchema = exports.homepageJourneyStepSchema = exports.homepageHearingAidSchema = exports.pageSchema = exports.leadSchema = exports.branchSchema = exports.faqSchema = exports.postSchema = exports.productSchema = exports.productCategorySchema = exports.brandSchema = exports.serviceSchema = exports.bannerSchema = void 0;
const zod_1 = require("zod");
exports.bannerSchema = zod_1.z.object({
    title_uz: zod_1.z.string().min(1),
    title_ru: zod_1.z.string().min(1),
    text_uz: zod_1.z.string().optional(),
    text_ru: zod_1.z.string().optional(),
    ctaText_uz: zod_1.z.string().optional(),
    ctaText_ru: zod_1.z.string().optional(),
    ctaLink: zod_1.z
        .string()
        .optional()
        .refine((val) => {
        if (!val || val === '')
            return true;
        if (val.startsWith('http://') || val.startsWith('https://')) {
            try {
                new URL(val);
                return true;
            }
            catch {
                return false;
            }
        }
        return val.startsWith('tel:') || val.startsWith('/') || val.startsWith('#');
    }, { message: 'Link must be a valid URL, tel: link, or relative path' })
        .or(zod_1.z.literal('').optional())
        .nullable(),
    imageId: zod_1.z.string().cuid().optional().nullable(),
    order: zod_1.z.number().int().default(0),
    status: zod_1.z.enum(['published', 'draft', 'archived']).default('published'),
});
exports.serviceSchema = zod_1.z.object({
    title_uz: zod_1.z.string().min(1),
    title_ru: zod_1.z.string().min(1),
    excerpt_uz: zod_1.z.string().optional(),
    excerpt_ru: zod_1.z.string().optional(),
    body_uz: zod_1.z.string().optional(),
    body_ru: zod_1.z.string().optional(),
    slug: zod_1.z.string().min(1),
    coverId: zod_1.z.string().cuid().optional().nullable(),
    order: zod_1.z.number().int().default(0),
    status: zod_1.z.enum(['published', 'draft', 'archived']).default('published'),
});
exports.brandSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    logoId: zod_1.z.string().cuid().optional().nullable(),
    desc_uz: zod_1.z.string().optional(),
    desc_ru: zod_1.z.string().optional(),
});
exports.productCategorySchema = zod_1.z.object({
    name_uz: zod_1.z.string().min(1),
    name_ru: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    description_uz: zod_1.z.string().optional(),
    description_ru: zod_1.z.string().optional(),
    icon: zod_1.z.string().optional(),
    imageId: zod_1.z.string().cuid().optional().nullable(),
    parentId: zod_1.z.string().cuid().optional().nullable(),
    order: zod_1.z.number().int().default(0),
});
exports.productSchema = zod_1.z.object({
    name_uz: zod_1.z.string().min(1),
    name_ru: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    description_uz: zod_1.z.string().optional(),
    description_ru: zod_1.z.string().optional(),
    price: zod_1.z.number().positive().optional().nullable(),
    stock: zod_1.z.number().int().min(0).optional().nullable(),
    brandId: zod_1.z.string().cuid().optional().nullable(),
    categoryId: zod_1.z.string().cuid().optional().nullable(),
    specsText: zod_1.z.string().optional().nullable(),
    galleryIds: zod_1.z.array(zod_1.z.string()).default([]),
    audience: zod_1.z.array(zod_1.z.string()).default([]),
    formFactors: zod_1.z.array(zod_1.z.string()).default([]),
    signalProcessing: zod_1.z.string().optional().nullable(),
    powerLevel: zod_1.z.string().optional().nullable(),
    hearingLossLevels: zod_1.z.array(zod_1.z.string()).default([]),
    smartphoneCompatibility: zod_1.z.array(zod_1.z.string()).default([]),
    tinnitusSupport: zod_1.z.boolean().optional().nullable(),
    paymentOptions: zod_1.z.array(zod_1.z.string()).default([]),
    availabilityStatus: zod_1.z.string().optional().nullable(),
    intro_uz: zod_1.z.string().optional().nullable(),
    intro_ru: zod_1.z.string().optional().nullable(),
    features_uz: zod_1.z.array(zod_1.z.string()).default([]),
    features_ru: zod_1.z.array(zod_1.z.string()).default([]),
    benefits_uz: zod_1.z.array(zod_1.z.string()).default([]),
    benefits_ru: zod_1.z.array(zod_1.z.string()).default([]),
    tech_uz: zod_1.z.string().optional().nullable(),
    tech_ru: zod_1.z.string().optional().nullable(),
    fittingRange_uz: zod_1.z.string().optional().nullable(),
    fittingRange_ru: zod_1.z.string().optional().nullable(),
    regulatoryNote_uz: zod_1.z.string().optional().nullable(),
    regulatoryNote_ru: zod_1.z.string().optional().nullable(),
    galleryUrls: zod_1.z.array(zod_1.z.string()).default([]),
    relatedProductIds: zod_1.z.array(zod_1.z.string().cuid()).default([]),
    usefulArticleSlugs: zod_1.z.array(zod_1.z.string()).default([]),
    status: zod_1.z.enum(['published', 'draft', 'archived']).default('published'),
});
exports.postSchema = zod_1.z.object({
    title_uz: zod_1.z.string().min(1),
    title_ru: zod_1.z.string().min(1),
    body_uz: zod_1.z.string().min(1),
    body_ru: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1),
    excerpt_uz: zod_1.z.string().optional(),
    excerpt_ru: zod_1.z.string().optional(),
    coverId: zod_1.z.string().cuid().optional().nullable(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    status: zod_1.z.enum(['published', 'draft', 'archived']).default('published'),
    publishAt: zod_1.z.coerce.date().optional(),
});
exports.faqSchema = zod_1.z.object({
    question_uz: zod_1.z.string().min(1),
    question_ru: zod_1.z.string().min(1),
    answer_uz: zod_1.z.string().min(1),
    answer_ru: zod_1.z.string().min(1),
    order: zod_1.z.number().int().default(0),
    status: zod_1.z.enum(['published', 'draft', 'archived']).default('published'),
});
exports.branchSchema = zod_1.z.object({
    name_uz: zod_1.z.string().min(1),
    name_ru: zod_1.z.string().min(1),
    address_uz: zod_1.z.string().min(1),
    address_ru: zod_1.z.string().min(1),
    phone: zod_1.z.string().min(1),
    phones: zod_1.z.array(zod_1.z.string()).default([]),
    imageId: zod_1.z.string().cuid().optional().nullable(),
    map_iframe: zod_1.z.string().optional().nullable(),
    order: zod_1.z.number().int().default(0),
});
exports.leadSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    phone: zod_1.z.string().min(1),
    email: zod_1.z.string().email().optional().nullable(),
    source: zod_1.z.string().optional(),
    message: zod_1.z.string().optional(),
    productId: zod_1.z.string().cuid().optional().nullable(),
});
exports.pageSchema = zod_1.z.object({
    slug: zod_1.z.string().min(1),
    title_uz: zod_1.z.string().min(1),
    title_ru: zod_1.z.string().min(1),
    body_uz: zod_1.z.string().optional(),
    body_ru: zod_1.z.string().optional(),
    metaTitle_uz: zod_1.z.string().optional(),
    metaTitle_ru: zod_1.z.string().optional(),
    metaDescription_uz: zod_1.z.string().optional(),
    metaDescription_ru: zod_1.z.string().optional(),
    status: zod_1.z.enum(['published', 'draft', 'archived']).default('published'),
});
exports.homepageHearingAidSchema = zod_1.z.object({
    title_uz: zod_1.z.string().min(1),
    title_ru: zod_1.z.string().min(1),
    description_uz: zod_1.z.string().optional(),
    description_ru: zod_1.z.string().optional(),
    link: zod_1.z.string().optional().nullable(),
    imageId: zod_1.z.string().cuid().optional().nullable(),
    order: zod_1.z.number().int().default(0),
    status: zod_1.z.enum(['published', 'draft', 'archived']).default('published'),
});
exports.homepageJourneyStepSchema = zod_1.z.object({
    title_uz: zod_1.z.string().min(1),
    title_ru: zod_1.z.string().min(1),
    description_uz: zod_1.z.string().optional(),
    description_ru: zod_1.z.string().optional(),
    order: zod_1.z.number().int().default(0),
    status: zod_1.z.enum(['published', 'draft', 'archived']).default('published'),
});
exports.homepageNewsItemSchema = zod_1.z.object({
    postId: zod_1.z.string().cuid().optional().nullable(),
    title_uz: zod_1.z.string().min(1),
    title_ru: zod_1.z.string().min(1),
    excerpt_uz: zod_1.z.string().optional(),
    excerpt_ru: zod_1.z.string().optional(),
    slug: zod_1.z.string().optional().nullable(),
    publishedAt: zod_1.z.coerce.date().optional().nullable(),
    order: zod_1.z.number().int().default(0),
    status: zod_1.z.enum(['published', 'draft', 'archived']).default('published'),
});
//# sourceMappingURL=content.js.map