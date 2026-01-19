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
          className="text-gray-500 hover:text-gray-900 transition-colors"
        >
          Home
        </Link>
        <span className="text-gray-400">/</span>

        {product.productType && (
          <>
            <Link
              href={`/collections/all?type=${encodeURIComponent(product.productType)}`}
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              {product.productType}
            </Link>
            <span className="text-gray-400">/</span>
          </>
        )}

        <span className="text-gray-900 font-medium line-clamp-1">
          {product.title}
        </span>
      </nav>
    </>
  );
}

