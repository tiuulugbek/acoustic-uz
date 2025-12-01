import { MetadataRoute } from 'next';
import { getProducts, getServices, getPosts, getCatalogs, getServiceCategories } from '@/lib/api-server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://acoustic.uz';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];

  // Homepage
  urls.push({
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  });

  // Catalog page
  urls.push({
    url: `${BASE_URL}/catalog`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  });

  // Services page
  urls.push({
    url: `${BASE_URL}/services`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  });

  try {
    // Products
    const productsResponse = await getProducts('uz', { limit: 1000, status: 'published' });
    if (productsResponse?.items) {
      productsResponse.items.forEach((product) => {
        urls.push({
          url: `${BASE_URL}/products/${product.slug}`,
          lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      });
    }

    // Services
    const services = await getServices('uz');
    if (services) {
      services.forEach((service) => {
        if (service.status === 'published') {
          urls.push({
            url: `${BASE_URL}/services/${service.slug}`,
            lastModified: service.updatedAt ? new Date(service.updatedAt) : new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
          });
        }
      });
    }

    // Service Categories
    const serviceCategories = await getServiceCategories('uz');
    if (serviceCategories?.items) {
      serviceCategories.items.forEach((category) => {
        if (category.status === 'published') {
          urls.push({
            url: `${BASE_URL}/services/${category.slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
          });
        }
      });
    }

    // Posts
    const posts = await getPosts('uz', true);
    if (posts) {
      posts.forEach((post) => {
        if (post.status === 'published') {
          urls.push({
            url: `${BASE_URL}/posts/${post.slug}`,
            lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
          });
        }
      });
    }

    // Catalogs
    const catalogs = await getCatalogs('uz');
    if (catalogs) {
      catalogs.forEach((catalog) => {
        if (catalog.status === 'published') {
          urls.push({
            url: `${BASE_URL}/catalog/${catalog.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
      });
    }
  } catch (error) {
    console.error('[Sitemap] Error generating sitemap:', error);
    // Continue with basic URLs even if API fails
  }

  return urls;
}

