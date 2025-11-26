import { z } from 'zod';
import { bilingualTextSchema } from './common';

export const bannerSchema = z.object({
  title_uz: z.string().min(1),
  title_ru: z.string().min(1),
  text_uz: z.string().optional(),
  text_ru: z.string().optional(),
  ctaText_uz: z.string().optional(),
  ctaText_ru: z.string().optional(),
  // Allow URLs (http/https), tel: links, relative paths, or empty string
  ctaLink: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true;
        // Allow http/https URLs
        if (val.startsWith('http://') || val.startsWith('https://')) {
          try {
            new URL(val);
            return true;
          } catch {
            return false;
          }
        }
        // Allow tel: links, relative paths, and anchors
        return val.startsWith('tel:') || val.startsWith('/') || val.startsWith('#');
      },
      { message: 'Link must be a valid URL, tel: link, or relative path' }
    )
    .or(z.literal('').optional())
    .nullable(),
  imageId: z.string().cuid().optional().nullable(),
  order: z.number().int().default(0),
  status: z.enum(['published', 'draft', 'archived']).default('published'),
});

export const serviceSchema = z.object({
  title_uz: z.string().min(1),
  title_ru: z.string().min(1),
  excerpt_uz: z.string().optional(),
  excerpt_ru: z.string().optional(),
  body_uz: z.string().optional(),
  body_ru: z.string().optional(),
  slug: z.string().min(1),
  coverId: z.string().cuid().optional().nullable(),
  categoryId: z.string().cuid().optional().nullable(),
  order: z.number().int().default(0),
  status: z.enum(['published', 'draft', 'archived']).default('published'),
});

export const brandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  logoId: z.string().cuid().optional().nullable(),
  desc_uz: z.string().optional(),
  desc_ru: z.string().optional(),
});

export const productCategorySchema = z.object({
  name_uz: z.string().min(1),
  name_ru: z.string().min(1),
  slug: z.string().min(1),
  description_uz: z.string().optional(),
  description_ru: z.string().optional(),
  icon: z.string().optional(),
  imageId: z.string().cuid().optional().nullable(),
  parentId: z.string().cuid().optional().nullable(),
  order: z.number().int().default(0),
});

export const productSchema = z.object({
  name_uz: z.string().min(1),
  name_ru: z.string().min(1),
  slug: z.string().min(1),
  productType: z.enum(['hearing-aids', 'accessories', 'interacoustics']).optional().nullable(),
  description_uz: z.string().optional(),
  description_ru: z.string().optional(),
  price: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0).optional().nullable(),
  brandId: z.string().cuid().optional().nullable(),
  categoryId: z.string().cuid().optional().nullable(),
  catalogIds: z.array(z.string().cuid()).default([]),
  specsText: z.string().optional().nullable(),
  galleryIds: z.array(z.string()).default([]),
  audience: z.array(z.string()).default([]),
  formFactors: z.array(z.string()).default([]),
  signalProcessing: z.string().optional().nullable(),
  powerLevel: z.string().optional().nullable(),
  hearingLossLevels: z.array(z.string()).default([]),
  smartphoneCompatibility: z.array(z.string()).default([]),
  tinnitusSupport: z.boolean().optional().nullable(),
  paymentOptions: z.array(z.string()).default([]),
  availabilityStatus: z.string().optional().nullable(),
  intro_uz: z.string().optional().nullable(),
  intro_ru: z.string().optional().nullable(),
  features_uz: z.array(z.string()).default([]),
  features_ru: z.array(z.string()).default([]),
  benefits_uz: z.array(z.string()).default([]),
  benefits_ru: z.array(z.string()).default([]),
  tech_uz: z.string().optional().nullable(),
  tech_ru: z.string().optional().nullable(),
  fittingRange_uz: z.string().optional().nullable(),
  fittingRange_ru: z.string().optional().nullable(),
  regulatoryNote_uz: z.string().optional().nullable(),
  regulatoryNote_ru: z.string().optional().nullable(),
  galleryUrls: z.array(z.string()).default([]),
  relatedProductIds: z.array(z.string().cuid()).default([]),
  usefulArticleSlugs: z.array(z.string()).default([]),
  status: z.enum(['published', 'draft', 'archived']).default('published'),
});

export const postSchema = z.object({
  title_uz: z.string().min(1),
  title_ru: z.string().min(1),
  body_uz: z.string().min(1),
  body_ru: z.string().min(1),
  slug: z.string().min(1),
  excerpt_uz: z.string().optional(),
  excerpt_ru: z.string().optional(),
  coverId: z.string().cuid().optional().nullable(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['published', 'draft', 'archived']).default('published'),
  publishAt: z.coerce.date().optional(),
});

export const faqSchema = z.object({
  question_uz: z.string().min(1),
  question_ru: z.string().min(1),
  answer_uz: z.string().min(1),
  answer_ru: z.string().min(1),
  order: z.number().int().default(0),
  status: z.enum(['published', 'draft', 'archived']).default('published'),
});

export const branchSchema = z.object({
  slug: z.string().optional().nullable(),
  name_uz: z.string().min(1),
  name_ru: z.string().min(1),
  address_uz: z.string().min(1),
  address_ru: z.string().min(1),
  phone: z.string().min(1),
  phones: z.array(z.string()).default([]),
  imageId: z.string().cuid().optional().nullable(),
  map_iframe: z.string().optional().nullable(),
  tour3d_iframe: z.string().optional().nullable(),
  tour3d_config: z.any().optional().nullable(), // Pannellum tour configuration (JSON)
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  workingHours_uz: z.string().optional().nullable(),
  workingHours_ru: z.string().optional().nullable(),
  serviceIds: z.array(z.string().cuid()).default([]),
  order: z.number().int().default(0),
});

export const leadSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().nullable(),
  source: z.string().optional(),
  message: z.string().optional(),
  productId: z.string().cuid().optional().nullable(),
});

export const pageSchema = z.object({
  slug: z.string().min(1),
  title_uz: z.string().min(1),
  title_ru: z.string().min(1),
  body_uz: z.string().optional(),
  body_ru: z.string().optional(),
  metaTitle_uz: z.string().optional(),
  metaTitle_ru: z.string().optional(),
  metaDescription_uz: z.string().optional(),
  metaDescription_ru: z.string().optional(),
  status: z.enum(['published', 'draft', 'archived']).default('published'),
});

export const homepageHearingAidSchema = z.object({
  title_uz: z.string().min(1),
  title_ru: z.string().min(1),
  description_uz: z.string().optional(),
  description_ru: z.string().optional(),
  link: z.string().optional().nullable(),
  imageId: z.string().cuid().optional().nullable(),
  order: z.number().int().default(0),
  status: z.enum(['published', 'draft', 'archived']).default('published'),
});

export const homepageJourneyStepSchema = z.object({
  title_uz: z.string().min(1),
  title_ru: z.string().min(1),
  description_uz: z.string().optional(),
  description_ru: z.string().optional(),
  order: z.number().int().default(0),
  status: z.enum(['published', 'draft', 'archived']).default('published'),
});

export const homepageNewsItemSchema = z.object({
  postId: z.string().cuid().optional().nullable(),
  title_uz: z.string().min(1),
  title_ru: z.string().min(1),
  excerpt_uz: z.string().optional(),
  excerpt_ru: z.string().optional(),
  slug: z.string().optional().nullable(),
  publishedAt: z.coerce.date().optional().nullable(),
  order: z.number().int().default(0),
  status: z.enum(['published', 'draft', 'archived']).default('published'),
});

export const homepageServiceSchema = z.object({
  title_uz: z.string().min(1),
  title_ru: z.string().min(1),
  excerpt_uz: z.string().optional(),
  excerpt_ru: z.string().optional(),
  slug: z.string().optional().nullable(),
  imageId: z.string().cuid().optional().nullable(),
  order: z.number().int().default(0),
  status: z.enum(['published', 'draft', 'archived']).default('published'),
});

export const doctorSchema = z.object({
  name_uz: z.string().min(1),
  name_ru: z.string().min(1),
  position_uz: z.string().optional().nullable(),
  position_ru: z.string().optional().nullable(),
  experience_uz: z.string().optional().nullable(),
  experience_ru: z.string().optional().nullable(),
  description_uz: z.string().optional().nullable(),
  description_ru: z.string().optional().nullable(),
  slug: z.string().min(1),
  imageId: z.string().cuid().optional().nullable(),
  order: z.number().int().default(0),
  status: z.enum(['published', 'draft', 'archived']).default('published'),
});

