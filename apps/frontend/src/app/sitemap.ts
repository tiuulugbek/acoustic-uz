import { MetadataRoute } from 'next';
import { getProducts, getPosts, getBranches, getServices, getServiceCategories } from '@/lib/api-server';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';

// Static pages that should be included in sitemap
const staticPages = [
  '',
  'catalog',
  'contact',
  'faq',
  'branches',
  'patients',
  'children-hearing',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Helper function to add URL
  const addUrl = (
    url: string,
    lastModified?: Date,
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'weekly',
    priority: number = 0.8,
  ) => {
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
    
    sitemapEntries.push({
      url: fullUrl,
      lastModified,
      changeFrequency,
      priority,
    });
  };

  // Add static pages
  staticPages.forEach((page) => {
    const priority = page === '' ? 1.0 : page === 'catalog' ? 0.9 : 0.8;
    addUrl(`/${page}`, new Date(), 'daily', priority);
  });

  try {
    // Add products
    const productsResponse = await getProducts({ page: 1, limit: 1000 }, 'uz');
    const products = Array.isArray(productsResponse) ? productsResponse : productsResponse.items || [];
    
    products.forEach((product) => {
      if (product.status === 'published') {
        addUrl(`/products/${product.slug}`, product.updatedAt ? new Date(product.updatedAt) : undefined, 'weekly', 0.7);
      }
    });
  } catch (error) {
    console.error('[Sitemap] Failed to fetch products:', error);
  }

  try {
    // Add posts (articles and news)
    const posts = await getPosts('uz', true);
    const publishedPosts = posts.filter((post) => post.status === 'published');
    
    publishedPosts.forEach((post) => {
      const priority = post.postType === 'news' ? 0.6 : 0.7;
      addUrl(`/posts/${post.slug}`, post.updatedAt ? new Date(post.updatedAt) : undefined, 'weekly', priority);
    });
  } catch (error) {
    console.error('[Sitemap] Failed to fetch posts:', error);
  }

  try {
    // Add branches
    const branches = await getBranches('uz');
    const publishedBranches = branches.filter((branch) => branch.status === 'published');
    
    publishedBranches.forEach((branch) => {
      if (branch.slug) {
        addUrl(`/branches/${branch.slug}`, branch.updatedAt ? new Date(branch.updatedAt) : undefined, 'monthly', 0.6);
      }
    });
  } catch (error) {
    console.error('[Sitemap] Failed to fetch branches:', error);
  }

  try {
    // Add services
    const services = await getServices('uz');
    const publishedServices = services.filter((service) => service.status === 'published');
    
    publishedServices.forEach((service) => {
      addUrl(`/services/${service.slug}`, service.updatedAt ? new Date(service.updatedAt) : undefined, 'weekly', 0.7);
    });
  } catch (error) {
    console.error('[Sitemap] Failed to fetch services:', error);
  }

  try {
    // Add service categories (these are also accessible via /services/[slug])
    const serviceCategories = await getServiceCategories('uz');
    const publishedCategories = serviceCategories.filter((cat) => cat.status === 'published');
    
    publishedCategories.forEach((category) => {
      // Only add if not already added as a service
      addUrl(`/services/${category.slug}`, undefined, 'weekly', 0.6);
    });
  } catch (error) {
    console.error('[Sitemap] Failed to fetch service categories:', error);
  }

  // Remove duplicates (in case same URL appears multiple times)
  const uniqueEntries = sitemapEntries.filter((entry, index, self) =>
    index === self.findIndex((e) => e.url === entry.url)
  );

  return uniqueEntries;
}

