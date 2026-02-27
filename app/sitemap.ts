import { MetadataRoute } from 'next';
import { shopifyFetch } from '@/lib/shopify';
import { GET_PRODUCTS_FOR_SITEMAP, GET_ALL_COLLECTIONS_HANDLES } from '@/lib/shopify-queries';
import { blogPosts } from '@/data/blog-posts';

export const revalidate = 3600; // Cache sitemap for 1 hour — avoids Shopify API rate limit pressure

interface ProductsForSitemapResponse {
  products: {
    edges: Array<{
      node: {
        handle: string;
        updatedAt: string;
      };
    }>;
  };
}

interface CollectionsHandlesResponse {
  collections: {
    edges: Array<{
      node: {
        handle: string;
      };
    }>;
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wildenflower.com';

  // Static routes — fixed priority/frequency
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/collections/all`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/shipping-returns`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/our-story`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Legal pages — rarely change
  const legalRoutes: MetadataRoute.Sitemap = [
    'privacy-policy',
    'terms-of-service',
    'refund-policy',
  ].map((slug) => ({
    url: `${baseUrl}/legal/${slug}`,
    lastModified: new Date('2026-02-27'),
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  }));

  // Products — use real Shopify updatedAt
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const data = await shopifyFetch<ProductsForSitemapResponse>({
      query: GET_PRODUCTS_FOR_SITEMAP,
      variables: { first: 250 },
    });
    productRoutes = data.products.edges.map(({ node }) => ({
      url: `${baseUrl}/products/${node.handle}`,
      lastModified: new Date(node.updatedAt),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Sitemap: failed to fetch products', error);
  }

  // Collections — use existing helper
  let collectionRoutes: MetadataRoute.Sitemap = [];
  try {
    const data = await shopifyFetch<CollectionsHandlesResponse>({
      query: GET_ALL_COLLECTIONS_HANDLES,
      variables: { first: 50 },
    });
    collectionRoutes = data.collections.edges.map(({ node }) => ({
      url: `${baseUrl}/collections/${node.handle}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));
  } catch (error) {
    console.error('Sitemap: failed to fetch collections', error);
  }

  // Blog posts
  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...legalRoutes, ...productRoutes, ...collectionRoutes, ...blogRoutes];
}
