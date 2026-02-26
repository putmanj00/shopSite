import { getProducts } from '@/lib/shopify-helpers';
import { isShowableProduct } from '@/lib/product-filters';
import ProductCard from '@/components/product-card';
import type { ShopifyProduct } from '@/types/shopify';

interface RelatedProductsProps {
  productType: string;
  currentProductId: string;
  tags: string[];
}

export default async function RelatedProducts({
  productType,
  currentProductId,
  tags,
}: RelatedProductsProps) {
  let products: ShopifyProduct[] = [];

  try {
    // Try to get related products by product type
    const query = productType
      ? `product_type:${productType}`
      : tags.length > 0
        ? `tag:${tags[0]}`
        : '';

    const response = await getProducts({
      first: 8,
      query: query || undefined,
      sortKey: 'BEST_SELLING',
    });

    products = response.products.edges
      .map((edge) => edge.node)
      .filter(isShowableProduct)
      // Filter out the current product
      .filter((p) => p.id !== currentProductId)
      // Limit to 4 products
      .slice(0, 4);
  } catch (error) {
    console.error('Error fetching related products:', error);
    products = [];
  }

  // If no related products found, try to get best sellers
  if (products.length === 0) {
    try {
      const response = await getProducts({
        first: 5,
        sortKey: 'BEST_SELLING',
      });

      products = response.products.edges
        .map((edge) => edge.node)
        .filter(isShowableProduct)
        .filter((p) => p.id !== currentProductId)
        .slice(0, 4);
    } catch (error) {
      console.error('Error fetching best sellers:', error);
      products = [];
    }
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
