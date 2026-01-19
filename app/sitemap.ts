import { MetadataRoute } from 'next';
import { getAllProductsHandles, getAllCollectionsHandles } from '@/lib/shopify-helpers';
import { blogPosts } from '@/data/blog-posts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://shopsite.com';

  // Static routes
  const routes = [
    '',
    '/about',
    '/collections',
    '/accessibility',
    '/collections/all',
    '/blog',
    '/faq',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Fetch all product handles
  const productHandles = await getAllProductsHandles();
  const productRoutes = productHandles.map((handle) => ({
    url: `${baseUrl}/products/${handle}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  // Fetch all collection handles
  const collectionHandles = await getAllCollectionsHandles();
  const collectionRoutes = collectionHandles.map((handle) => ({
    url: `${baseUrl}/collections/${handle}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.9, // Collections are important landing pages
  }));

  // Blog posts
  const blogRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date).toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...routes, ...collectionRoutes, ...productRoutes, ...blogRoutes];
}
