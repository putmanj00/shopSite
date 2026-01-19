import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://shopsite.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account/', '/cart', '/checkout', '/api/'], // Disallow private/transactional pages
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
