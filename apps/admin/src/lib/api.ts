// Use production API URL as default (fallback to localhost only in development)
// Check if we're in production mode
let API_BASE = 'https://api.acoustic.uz/api'; // Default to production

// Try to get from window object first (injected by plugin)
if (typeof window !== 'undefined' && (window as any).__VITE_API_URL__) {
  API_BASE = (window as any).__VITE_API_URL__;
} else if (import.meta.env.VITE_API_URL) {
  // Try to get from Vite env
  API_BASE = import.meta.env.VITE_API_URL;
} else {
  // Fallback: check if we're in development
  const isProduction = import.meta.env.PROD || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && !window.location.hostname.includes('localhost'));
  API_BASE = isProduction ? 'https://api.acoustic.uz/api' : 'http://localhost:3001/api';
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    credentials: 'include',
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    let message = text || response.statusText;
    try {
      const parsed = text ? JSON.parse(text) : null;
      if (parsed?.message) {
        message = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message;
      }
    } catch (error) {
      // ignore JSON parse errors
    }
    
    // Handle 401 Unauthorized - session expired
    if (response.status === 401) {
      // Clear user data from localStorage
      try {
        localStorage.removeItem('admin_user');
      } catch (err) {
        // ignore
      }
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        // Clear query cache
        const queryClient = (window as any).__queryClient;
        if (queryClient) {
          queryClient.clear();
        }
        
        // Show warning message
        if (typeof window !== 'undefined' && (window as any).antd) {
          (window as any).antd.message?.warning('Sessiya tugadi. Iltimos, qayta kiring.');
        }
        
        // Redirect to login page
        window.location.href = '/login';
      }
    }
    
    throw new ApiError(message || `Request failed with status ${response.status}`, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  // Check if response has content before parsing JSON
  const contentType = response.headers.get('content-type');
  const text = await response.text();
  
  // If response is empty, return null for nullable types
  if (!text || text.trim() === '') {
    // For 404 errors, return null instead of throwing
    if (response.status === 404) {
      return null as T;
    }
    return undefined as T;
  }

  // Try to parse JSON
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    // If JSON parsing fails, throw error
    throw new ApiError(`Invalid JSON response: ${text.substring(0, 100)}`, response.status);
  }
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

export const login = (payload: { email: string; password: string }) =>
  request<{ user: UserDto }>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );

export const logout = () =>
  request<void>('/auth/logout', {
    method: 'POST',
  });

export const getCurrentUser = () => request<UserDto>('/auth/me');

export const getPosts = () => request<PostDto[]>('/posts');
export const createPost = (payload: CreatePostPayload) =>
  request<PostDto>('/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updatePost = (id: string, payload: UpdatePostPayload) =>
  request<PostDto>(`/posts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deletePost = (id: string) =>
  request<void>(`/posts/${id}`, {
    method: 'DELETE',
  });

// Post Categories API
export interface PostCategoryDto {
  id: string;
  name_uz: string;
  name_ru: string;
  slug: string;
  description_uz?: string | null;
  description_ru?: string | null;
  order: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type CreatePostCategoryPayload = Omit<PostCategoryDto, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePostCategoryPayload = Partial<CreatePostCategoryPayload>;

export const getPostCategories = () => request<PostCategoryDto[]>('/post-categories');
export const createPostCategory = (payload: CreatePostCategoryPayload) =>
  request<PostCategoryDto>('/post-categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updatePostCategory = (id: string, payload: UpdatePostCategoryPayload) =>
  request<PostCategoryDto>(`/post-categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deletePostCategory = (id: string) =>
  request<void>(`/post-categories/${id}`, {
    method: 'DELETE',
  });

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

export const getServices = () => request<ServiceDto[]>('/services/admin');
export const createService = (payload: CreateServicePayload) =>
  request<ServiceDto>('/services', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updateService = (id: string, payload: UpdateServicePayload) =>
  request<ServiceDto>(`/services/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deleteService = (id: string) =>
  request<void>(`/services/${id}`, {
    method: 'DELETE',
  });

// Doctors
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

export const getDoctors = () => request<DoctorDto[]>('/doctors/admin');
export const createDoctor = (payload: CreateDoctorPayload) =>
  request<DoctorDto>('/doctors', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updateDoctor = (id: string, payload: UpdateDoctorPayload) =>
  request<DoctorDto>(`/doctors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deleteDoctor = (id: string) =>
  request<void>(`/doctors/${id}`, {
    method: 'DELETE',
  });

// Service Categories API
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

export const getServiceCategoriesAdmin = () => request<ServiceCategoryDto[]>('/service-categories/admin');
export const createServiceCategory = (payload: CreateServiceCategoryPayload) =>
  request<ServiceCategoryDto>('/service-categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updateServiceCategory = (id: string, payload: UpdateServiceCategoryPayload) =>
  request<ServiceCategoryDto>(`/service-categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deleteServiceCategory = (id: string) =>
  request<void>(`/service-categories/${id}`, {
    method: 'DELETE',
  });

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

export const getHomepageHearingAids = () => request<HomepageHearingAidDto[]>('/homepage/hearing-aids/admin');
export const createHomepageHearingAid = (payload: CreateHomepageHearingAidPayload) =>
  request<HomepageHearingAidDto>('/homepage/hearing-aids', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updateHomepageHearingAid = (id: string, payload: UpdateHomepageHearingAidPayload) =>
  request<HomepageHearingAidDto>(`/homepage/hearing-aids/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deleteHomepageHearingAid = (id: string) =>
  request<void>(`/homepage/hearing-aids/${id}`, {
    method: 'DELETE',
  });

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

export const getHomepageJourneySteps = () => request<HomepageJourneyStepDto[]>('/homepage/journey/admin');
export const createHomepageJourneyStep = (payload: CreateHomepageJourneyPayload) =>
  request<HomepageJourneyStepDto>('/homepage/journey', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updateHomepageJourneyStep = (id: string, payload: UpdateHomepageJourneyPayload) =>
  request<HomepageJourneyStepDto>(`/homepage/journey/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deleteHomepageJourneyStep = (id: string) =>
  request<void>(`/homepage/journey/${id}`, {
    method: 'DELETE',
  });

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

export const getHomepageNewsItems = () => request<HomepageNewsItemDto[]>('/homepage/news/admin');
export const createHomepageNewsItem = (payload: CreateHomepageNewsPayload) =>
  request<HomepageNewsItemDto>('/homepage/news', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updateHomepageNewsItem = (id: string, payload: UpdateHomepageNewsPayload) =>
  request<HomepageNewsItemDto>(`/homepage/news/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deleteHomepageNewsItem = (id: string) =>
  request<void>(`/homepage/news/${id}`, {
    method: 'DELETE',
  });

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

export const getHomepageServices = () => request<HomepageServiceDto[]>('/homepage/services/admin');
export const createHomepageService = (payload: CreateHomepageServicePayload) =>
  request<HomepageServiceDto>('/homepage/services', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updateHomepageService = (id: string, payload: UpdateHomepageServicePayload) =>
  request<HomepageServiceDto>(`/homepage/services/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deleteHomepageService = (id: string) =>
  request<void>(`/homepage/services/${id}`, {
    method: 'DELETE',
  });

// Homepage Sections
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

export const getHomepageSections = () => request<HomepageSectionDto[]>('/homepage/sections');
export const createHomepageSection = (payload: CreateHomepageSectionPayload) =>
  request<HomepageSectionDto>('/homepage/sections', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updateHomepageSection = (key: string, payload: UpdateHomepageSectionPayload) =>
  request<HomepageSectionDto>(`/homepage/sections/${key}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deleteHomepageSection = (key: string) =>
  request<void>(`/homepage/sections/${key}`, {
    method: 'DELETE',
  });

// Homepage Links
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

export const getHomepageLinks = () => request<HomepageLinkDto[]>('/homepage/links');
export const createHomepageLink = (payload: CreateHomepageLinkPayload) =>
  request<HomepageLinkDto>('/homepage/links', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updateHomepageLink = (id: string, payload: UpdateHomepageLinkPayload) =>
  request<HomepageLinkDto>(`/homepage/links/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deleteHomepageLink = (id: string) =>
  request<void>(`/homepage/links/${id}`, {
    method: 'DELETE',
  });

// Homepage Placeholders
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

export const getHomepagePlaceholders = () => request<HomepagePlaceholderDto[]>('/homepage/placeholders');
export const createHomepagePlaceholder = (payload: CreateHomepagePlaceholderPayload) =>
  request<HomepagePlaceholderDto>('/homepage/placeholders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updateHomepagePlaceholder = (sectionKey: string, payload: UpdateHomepagePlaceholderPayload) =>
  request<HomepagePlaceholderDto>(`/homepage/placeholders/${sectionKey}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deleteHomepagePlaceholder = (sectionKey: string) =>
  request<void>(`/homepage/placeholders/${sectionKey}`, {
    method: 'DELETE',
  });

// Homepage Empty States
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

export const getHomepageEmptyStates = () => request<HomepageEmptyStateDto[]>('/homepage/empty-states');
export const createHomepageEmptyState = (payload: CreateHomepageEmptyStatePayload) =>
  request<HomepageEmptyStateDto>('/homepage/empty-states', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updateHomepageEmptyState = (sectionKey: string, payload: UpdateHomepageEmptyStatePayload) =>
  request<HomepageEmptyStateDto>(`/homepage/empty-states/${sectionKey}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deleteHomepageEmptyState = (sectionKey: string) =>
  request<void>(`/homepage/empty-states/${sectionKey}`, {
    method: 'DELETE',
  });

// Catalog Page Config
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

export const getCatalogPageConfig = () => request<CatalogPageConfigDto>('/catalog-page-config');
export const updateCatalogPageConfig = (payload: UpdateCatalogPageConfigPayload) =>
  request<CatalogPageConfigDto>('/catalog-page-config', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

// Common Texts
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

export const getCommonTexts = () => request<CommonTextDto[]>('/common-texts');
export const createCommonText = (payload: CreateCommonTextPayload) =>
  request<CommonTextDto>('/common-texts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updateCommonText = (key: string, payload: UpdateCommonTextPayload) =>
  request<CommonTextDto>(`/common-texts/${key}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deleteCommonText = (key: string) =>
  request<void>(`/common-texts/${key}`, {
    method: 'DELETE',
  });

// Availability Statuses
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

export const getAvailabilityStatuses = () => request<AvailabilityStatusDto[]>('/availability-statuses');
export const createAvailabilityStatus = (payload: CreateAvailabilityStatusPayload) =>
  request<AvailabilityStatusDto>('/availability-statuses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updateAvailabilityStatus = (key: string, payload: UpdateAvailabilityStatusPayload) =>
  request<AvailabilityStatusDto>(`/availability-statuses/${key}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deleteAvailabilityStatus = (key: string) =>
  request<void>(`/availability-statuses/${key}`, {
    method: 'DELETE',
  });

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

export const getBannersAdmin = () => request<BannerDto[]>('/banners/admin');
export const createBanner = (payload: CreateBannerPayload) =>
  request<BannerDto>('/banners', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updateBanner = (id: string, payload: UpdateBannerPayload) =>
  request<BannerDto>(`/banners/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deleteBanner = (id: string) =>
  request<void>(`/banners/${id}`, {
    method: 'DELETE',
  });

// Media API
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

export const getMedia = () => request<MediaDto[]>('/media');
export const uploadMedia = async (file: File, alt_uz?: string, alt_ru?: string, skipWebp?: boolean): Promise<MediaDto> => {
  const formData = new FormData();
  formData.append('file', file);
  if (alt_uz) formData.append('alt_uz', alt_uz);
  if (alt_ru) formData.append('alt_ru', alt_ru);
  if (skipWebp) formData.append('skipWebp', 'true');

  console.log('📤 Uploading to:', `${API_BASE}/media`);
  console.log('📦 File info:', {
    name: file.name,
    size: (file.size / 1024).toFixed(1) + 'KB',
    type: file.type,
  });

  try {
    const response = await fetch(`${API_BASE}/media`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    console.log('📡 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const text = await response.text();
      console.error('❌ Upload failed:', {
        status: response.status,
        statusText: response.statusText,
        body: text,
      });
      
      let message = text || response.statusText;
      try {
        const parsed = text ? JSON.parse(text) : null;
        if (parsed?.message) {
          message = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message;
        }
      } catch (error) {
        // ignore JSON parse errors
      }
      
      // 401 - Authentication muammosi
      if (response.status === 401) {
        throw new ApiError('Sessiya tugadi. Iltimos, qayta kiring.', 401);
      }
      
      // 403 - Permission muammosi
      if (response.status === 403) {
        throw new ApiError('Rasm yuklash uchun ruxsat yo\'q.', 403);
      }
      
      throw new ApiError(message || `Rasm yuklashda xatolik (${response.status})`, response.status);
    }

    const result = await response.json();
    console.log('✅ Upload successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Upload error:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error instanceof Error ? error.message : 'Rasm yuklashda noma\'lum xatolik', 500);
  }
};
export const deleteMedia = (id: string) =>
  request<void>(`/media/${id}`, {
    method: 'DELETE',
  });

export const updateMedia = (id: string, alt_uz?: string, alt_ru?: string) =>
  request<MediaDto>(`/media/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ alt_uz, alt_ru }),
  });

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

export const getMenu = (name: string) => request<MenuDto>(`/menus/${name}`);
export const updateMenu = (name: string, items: MenuItemDto[]) =>
  request<MenuDto>(`/menus/${name}`, {
    method: 'POST',
    body: JSON.stringify({ items }),
  });

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

export const getProductCategoriesAdmin = () => request<ProductCategoryDto[]>('/product-categories');
export const createProductCategory = (payload: CreateProductCategoryPayload) =>
  request<ProductCategoryDto>('/product-categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updateProductCategory = (id: string, payload: UpdateProductCategoryPayload) =>
  request<ProductCategoryDto>(`/product-categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deleteProductCategory = (id: string) =>
  request<void>(`/product-categories/${id}`, {
    method: 'DELETE',
  });

// Catalog API
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

export const getCatalogsAdmin = () => request<CatalogDto[]>('/catalogs/admin');
export const getCatalogs = () => request<CatalogDto[]>('/catalogs?public=true');
export const createCatalog = (payload: CreateCatalogPayload) =>
  request<CatalogDto>('/catalogs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updateCatalog = (id: string, payload: UpdateCatalogPayload) =>
  request<CatalogDto>(`/catalogs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deleteCatalog = (id: string) =>
  request<void>(`/catalogs/${id}`, {
    method: 'DELETE',
  });

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

export const getBrands = () => request<BrandDto[]>('/brands');
export type CreateBrandPayload = {
  name: string;
  slug: string;
  desc_uz?: string | null;
  desc_ru?: string | null;
  logoId?: string | null;
};

export type UpdateBrandPayload = Partial<CreateBrandPayload>;

export const createBrand = (payload: CreateBrandPayload) =>
  request<BrandDto>('/brands', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateBrand = (id: string, payload: UpdateBrandPayload) =>
  request<BrandDto>(`/brands/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const deleteBrand = (id: string) =>
  request<void>(`/brands/${id}`, {
    method: 'DELETE',
  });

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

export const getProductsAdmin = (filters?: { limit?: number; offset?: number; status?: string }) => {
  const params = new URLSearchParams();
  if (filters?.limit) params.append('limit', String(filters.limit));
  if (filters?.offset) params.append('offset', String(filters.offset));
  if (filters?.status) params.append('status', filters.status);
  const query = params.toString();
  return request<{ items: ProductDto[]; total: number; page: number; pageSize: number }>(`/products/admin${query ? `?${query}` : ''}`);
};
export const createProduct = (payload: CreateProductPayload) =>
  request<ProductDto>('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updateProduct = (id: string, payload: UpdateProductPayload) =>
  request<ProductDto>(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deleteProduct = (id: string) =>
  request<void>(`/products/${id}`, {
    method: 'DELETE',
  });

export interface ImportExcelResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

export const importProductsFromExcel = async (file: File): Promise<ImportExcelResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/products/import/excel`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    let message = text || response.statusText;
    try {
      const parsed = text ? JSON.parse(text) : null;
      if (parsed?.message) {
        message = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message;
      }
    } catch (error) {
      // ignore JSON parse errors
    }
    throw new ApiError(message || `Request failed with status ${response.status}`, response.status);
  }

  return response.json();
};

export const downloadExcelTemplate = async (): Promise<Blob> => {
  const response = await fetch(`${API_BASE}/products/import/excel-template`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text();
    let message = text || response.statusText;
    try {
      const parsed = text ? JSON.parse(text) : null;
      if (parsed?.message) {
        message = Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message;
      }
    } catch (error) {
      // ignore JSON parse errors
    }
    throw new ApiError(message || `Request failed with status ${response.status}`, response.status);
  }

  return response.blob();
};

// FAQ interfaces and functions
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

export const getFaqsAdmin = () => request<FaqDto[]>('/faq');
export const createFaq = (payload: CreateFaqPayload) =>
  request<FaqDto>('/faq', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updateFaq = (id: string, payload: UpdateFaqPayload) =>
  request<FaqDto>(`/faq/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deleteFaq = (id: string) =>
  request<void>(`/faq/${id}`, {
    method: 'DELETE',
  });

// Pages interfaces and functions
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

export const getPages = () => request<PageDto[]>('/pages');
export const getPageBySlug = async (slug: string): Promise<PageDto | null> => {
  try {
    return await request<PageDto>(`/pages/slug/${slug}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
};
export const createPage = (payload: CreatePagePayload) =>
  request<PageDto>('/pages', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updatePage = (id: string, payload: UpdatePagePayload) =>
  request<PageDto>(`/pages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deletePage = (id: string) =>
  request<void>(`/pages/${id}`, {
    method: 'DELETE',
  });

// Branches
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
  tour3d_config?: any | null; // Pannellum tour configuration (JSON)
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
  tour3d_config?: any | null; // Pannellum tour configuration (JSON)
  latitude?: number | null;
  longitude?: number | null;
  workingHours_uz?: string | null;
  workingHours_ru?: string | null;
  serviceIds?: string[];
  order?: number;
  slug?: string | null;
};

export type UpdateBranchPayload = Partial<CreateBranchPayload>;

export const getBranches = () => request<BranchDto[]>('/branches');
export const createBranch = (payload: CreateBranchPayload) =>
  request<BranchDto>('/branches', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
export const updateBranch = (id: string, payload: UpdateBranchPayload) =>
  request<BranchDto>(`/branches/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
export const deleteBranch = (id: string) =>
  request<void>(`/branches/${id}`, {
    method: 'DELETE',
  });

// Showcase interfaces and functions
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
  productMetadata?: Record<string, { description_uz?: string; description_ru?: string; imageId?: string }>;
};

export const getShowcase = (type: 'interacoustics' | 'cochlear') =>
  request<ShowcaseDto>(`/showcases/${type}`);
export const updateShowcase = (type: 'interacoustics' | 'cochlear', payload: UpdateShowcasePayload) =>
  request<ShowcaseDto>(`/showcases/${type}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// Settings interfaces and functions
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
  // Sidebar settings
  sidebarSections?: SidebarSection[] | null;
  sidebarBrandIds?: string[];
  sidebarConfigs?: {
    catalog?: { sections?: SidebarSection[]; brandIds?: string[] };
    products?: { sections?: SidebarSection[]; brandIds?: string[] };
    services?: { sections?: SidebarSection[]; brandIds?: string[] };
    posts?: { sections?: SidebarSection[]; brandIds?: string[] };
  } | null;
  // AmoCRM settings
  amocrmDomain?: string | null;
  amocrmClientId?: string | null;
  amocrmClientSecret?: string | null;
  amocrmAccessToken?: string | null;
  amocrmRefreshToken?: string | null;
  amocrmPipelineId?: string | null;
  amocrmStatusId?: string | null;
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
  // Sidebar settings
  sidebarSections?: SidebarSection[];
  sidebarBrandIds?: string[];
  sidebarConfigs?: {
    catalog?: { sections?: SidebarSection[]; brandIds?: string[] };
    products?: { sections?: SidebarSection[]; brandIds?: string[] };
    services?: { sections?: SidebarSection[]; brandIds?: string[] };
    posts?: { sections?: SidebarSection[]; brandIds?: string[] };
  };
  // AmoCRM settings
  amocrmDomain?: string;
  amocrmClientId?: string;
  amocrmClientSecret?: string;
  amocrmAccessToken?: string;
  amocrmRefreshToken?: string;
  amocrmPipelineId?: string;
  amocrmStatusId?: string;
};

export const getSettings = () =>
  request<SettingsDto>('/settings');
export const updateSettings = (payload: UpdateSettingsPayload) =>
  request<SettingsDto>('/settings', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

// AmoCRM API
export interface AmoCRMAuthUrlResponse {
  authUrl: string;
}

export interface AmoCRMTestResponse {
  success: boolean;
  message: string;
  account?: {
    id: number;
    name: string;
  };
}

// DEPRECATED: Do not use this function. Use window.location.href instead.
// This function is kept for backward compatibility but should not be used.
// export const getAmoCRMAuthUrl = () =>
//   request<AmoCRMAuthUrlResponse>('/amocrm/authorize');

export const testAmoCRMConnection = () =>
  request<AmoCRMTestResponse>('/amocrm/test', {
    method: 'POST',
  });
