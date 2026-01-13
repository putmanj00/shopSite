import { MetadataRoute } from 'next';
import { getAllProductsHandles, getAllCollectionsHandles } from '@/lib/shopify-helpers';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://shopsite.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productHandles = await getAllProductsHandles();
  const collectionHandles = await getAllCollectionsHandles();

  const products = productHandles.map((handle) => ({
    url: `${baseUrl}/products/${handle}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const collections = collectionHandles.map((handle) => ({
    url: `${baseUrl}/collections/${handle}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const routes = [
    '',
    '/collections/all',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }));

  return [...routes, ...products, ...collections];
}
