export type Locale = 'uz' | 'ru';

export interface BilingualText {
  uz: string;
  ru: string;
}

export interface FeatureFlags {
  home?: {
    hero?: boolean;
    services?: boolean;
    hearingAidCategories?: boolean;
    interacousticsCarousel?: boolean;
    cochlearGrid?: boolean;
    pathToBetterHearing?: boolean;
    freshPosts?: boolean;
    faq?: boolean;
    branches?: boolean;
    strongCta?: boolean;
  };
  integrations?: {
    telegram?: boolean;
    smtpFallback?: boolean;
    analytics?: boolean;
    sentry?: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  status?: string;
  search?: string;
  [key: string]: unknown;
}

export type RoleName = 'superadmin' | 'admin' | 'editor' | 'viewer';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}

