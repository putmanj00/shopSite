import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getCollectionByHandle, getAllCollectionsHandles, getProducts } from '@/lib/shopify-helpers';
import CollectionContent from '@/components/collection-content';
import ProductCardSkeleton from '@/components/product-card-skeleton';
import type { Metadata } from 'next';
import type { ShopifyCollection } from '@/types/shopify';

interface CollectionPageProps {
  params: Promise<{
    handle: string;
  }>;
  searchParams: Promise<{
    sort?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    type?: string;
    tags?: string;
    page?: string;
  }>;
}

export async function generateStaticParams() {
  const handles = await getAllCollectionsHandles();
  // Include 'all' for the virtual all-products collection
  if (!handles.includes('all')) {
    handles.push('all');
  }
  return handles.map((handle) => ({
    handle,
  }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { handle } = await params;

  // Handle virtual "all" collection
  if (handle === 'all') {
    return {
      title: 'All Products | shopSite',
      description: 'Browse our complete collection of products',
      openGraph: {
        title: 'All Products',
        description: 'Browse our complete collection of products',
      },
    };
  }

  let collection;
  try {
    collection = await getCollectionByHandle(handle, { first: 1 });
  } catch {
    return {
      title: 'Collection Not Found',
    };
  }

  if (!collection) {
    return {
      title: 'Collection Not Found',
    };
  }

  return {
    title: `${collection.title} | shopSite`,
    description: collection.description || `Shop ${collection.title} products`,
    openGraph: {
      title: collection.title,
      description: collection.description,
      images: collection.image ? [{ url: collection.image.url }] : [],
    },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const { handle } = await params;
  const resolvedSearchParams = await searchParams;

  let collection: ShopifyCollection | null = null;

  // Handle virtual "all" collection - fetch all products
  if (handle === 'all') {
    try {
      const productsData = await getProducts({ first: 250 });
      // Create a virtual collection with all products
      collection = {
        id: 'all-products',
        title: 'All Products',
        handle: 'all',
        description: 'Browse our complete collection of products',
        descriptionHtml: '<p>Browse our complete collection of products</p>',
        image: null,
        products: productsData.products,
      };
    } catch (error) {
      console.error('Error fetching all products:', error);
      notFound();
    }
  } else {
    try {
      collection = await getCollectionByHandle(handle, { first: 250 });
    } catch (error) {
      console.error('Error fetching collection:', error);
      notFound();
    }
  }

  if (!collection) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Collection Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="text-lg text-gray-600 max-w-3xl">
              {collection.description}
            </p>
          )}
        </div>
      </div>

      {/* Collection Content with Filters */}
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <CollectionContent
          collection={collection}
          searchParams={resolvedSearchParams}
        />
      </Suspense>
    </div>
  );
}
