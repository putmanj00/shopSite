import { Suspense } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getCollectionByHandle, getAllCollectionsHandles, getProducts } from '@/lib/shopify-helpers';
import CollectionContent from '@/components/collection-content';
import ProductCardSkeleton from '@/components/product-card-skeleton';
import type { Metadata } from 'next';
import type { ShopifyCollection } from '@/types/shopify';
import { BotanicalHeader } from '@/components/ui/botanical-header';
import { buildBreadcrumbList, SITE_URL } from '@/lib/structured-data';
import Link from 'next/link';

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

export const revalidate = 300;

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
      title: 'All Treasures | shopSite',
      description: 'Every handmade treasure in one place',
      openGraph: {
        title: 'All Treasures',
        description: 'Every handmade treasure in one place',
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
        title: 'All Treasures',
        handle: 'all',
        description: 'Every handmade treasure in one place',
        descriptionHtml: '<p>Every handmade treasure in one place</p>',
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

  const breadcrumbData = buildBreadcrumbList([
    { name: 'Home', url: SITE_URL },
    { name: 'Shop', url: `${SITE_URL}/collections/all` },
    { name: collection.title, url: `${SITE_URL}/collections/${handle}` },
  ]);

  return (
    <div className="min-h-screen bg-parchment">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      {/* Collection Header */}
      <section className="bg-parchment pt-12 pb-8 lg:pt-16 lg:pb-12 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center justify-center gap-2 text-sm mb-8" aria-label="Breadcrumb">
            <Link href="/" className="text-sage hover:text-ink-brown transition-colors">Home</Link>
            <span className="text-sage">/</span>
            <Link href="/collections/all" className="text-sage hover:text-ink-brown transition-colors">Shop</Link>
            <span className="text-sage">/</span>
            <span className="text-ink-brown font-medium line-clamp-1">{collection.title}</span>
          </nav>

          {handle === 'all' && (
            <div className="flex justify-center mb-6">
              <BotanicalHeader variant="small" />
            </div>
          )}
          <span className="catalog-label text-ink-brown/70 mb-3">
            {handle === 'all' ? 'Shop' : 'Collection'}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-ink-brown">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="mt-4 text-lg text-earth/80 max-w-2xl mx-auto font-body">
              {collection.description}
            </p>
          )}
        </div>
      </section>

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

      {handle === 'all' && (
        <div className="w-full flex justify-center pb-16 pt-8 px-4">
          <Image
            src="/assets/images/dividers/divider-fern-mushroom.png"
            alt=""
            width={400}
            height={40}
            className="opacity-70 object-contain"
          />
        </div>
      )}
    </div>
  );
}
