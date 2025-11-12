import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const filterSchema = z.object({
  status: z.enum(['published', 'draft', 'archived']).optional(),
  search: z.string().optional(),
});

export const bilingualTextSchema = z.object({
  uz: z.string().min(1),
  ru: z.string().min(1),
});

export const idSchema = z.object({
  id: z.string().cuid(),
});

