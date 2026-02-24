import Link from 'next/link';
import type { ShopifyProduct } from '@/types/shopify';

interface BreadcrumbsProps {
  product: ShopifyProduct;
}

export default function Breadcrumbs({ product }: BreadcrumbsProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://shopsite.com';

  // Build breadcrumb items for schema
  const breadcrumbItems = [
    { name: 'Home', url: baseUrl },
  ];

  if (product.productType) {
    breadcrumbItems.push({
      name: product.productType,
      url: `${baseUrl}/collections/all?type=${encodeURIComponent(product.productType)}`,
    });
  }

  breadcrumbItems.push({
    name: product.title,
    url: `${baseUrl}/products/${product.handle}`,
  });

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link
          href="/"
          className="text-sage hover:text-ink-brown transition-colors"
        >
          Home
        </Link>
        <span className="text-sage">/</span>

        {product.productType && (
          <>
            <Link
              href={`/collections/all?type=${encodeURIComponent(product.productType)}`}
              className="text-sage hover:text-ink-brown transition-colors"
            >
              {product.productType}
            </Link>
            <span className="text-sage">/</span>
          </>
        )}

        <span className="text-ink-brown font-medium line-clamp-1">
          {product.title}
        </span>
      </nav>
    </>
  );
}

