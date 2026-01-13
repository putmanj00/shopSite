import Link from 'next/link';
import type { ShopifyProduct } from '@/types/shopify';

interface BreadcrumbsProps {
  product: ShopifyProduct;
}

export default function Breadcrumbs({ product }: BreadcrumbsProps) {
  return (
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
  );
}
