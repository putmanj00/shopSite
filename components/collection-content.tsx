'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import ProductCard from '@/components/product-card';
import SearchBar from '@/components/search-bar';
import FilterPanel from '@/components/filter-panel';
import SortDropdown from '@/components/sort-dropdown';
import MobileFilterDrawer from '@/components/mobile-filter-drawer';
import type { ShopifyCollection } from '@/types/shopify';

interface CollectionContentProps {
  collection: ShopifyCollection;
  searchParams: {
    sort?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    type?: string;
    tags?: string;
    page?: string;
  };
}

export default function CollectionContent({
  collection,
  searchParams,
}: CollectionContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const urlSearchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.search || '');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Extract all unique product types and tags from collection
  const { productTypes, allTags } = useMemo(() => {
    const types = new Set<string>();
    const tags = new Set<string>();

    collection.products.edges.forEach(({ node }) => {
      if (node.productType) types.add(node.productType);
      node.tags.forEach((tag) => tags.add(tag));
    });

    return {
      productTypes: Array.from(types).sort(),
      allTags: Array.from(tags).sort(),
    };
  }, [collection]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let products = collection.products.edges.map(({ node }) => node);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        (product) =>
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.productType.toLowerCase().includes(query) ||
          product.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply price filter
    const minPrice = searchParams.minPrice
      ? parseFloat(searchParams.minPrice)
      : null;
    const maxPrice = searchParams.maxPrice
      ? parseFloat(searchParams.maxPrice)
      : null;

    if (minPrice !== null || maxPrice !== null) {
      products = products.filter((product) => {
        const price = parseFloat(product.priceRange.minVariantPrice.amount);
        if (minPrice !== null && price < minPrice) return false;
        if (maxPrice !== null && price > maxPrice) return false;
        return true;
      });
    }

    // Apply product type filter
    if (searchParams.type) {
      products = products.filter(
        (product) => product.productType === searchParams.type
      );
    }

    // Apply tags filter
    if (searchParams.tags) {
      const selectedTags = searchParams.tags.split(',');
      products = products.filter((product) =>
        selectedTags.some((tag) => product.tags.includes(tag))
      );
    }

    // Apply sorting
    const sortKey = searchParams.sort || 'default';
    switch (sortKey) {
      case 'price-asc':
        products.sort(
          (a, b) =>
            parseFloat(a.priceRange.minVariantPrice.amount) -
            parseFloat(b.priceRange.minVariantPrice.amount)
        );
        break;
      case 'price-desc':
        products.sort(
          (a, b) =>
            parseFloat(b.priceRange.minVariantPrice.amount) -
            parseFloat(a.priceRange.minVariantPrice.amount)
        );
        break;
      case 'newest':
        products.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'title-asc':
        products.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        products.sort((a, b) => b.title.localeCompare(a.title));
        break;
      // default: keep original order (best-selling/manual)
    }

    return products;
  }, [collection, searchQuery, searchParams]);

  // Pagination
  const itemsPerPage = 12;
  const currentPage = parseInt(searchParams.page || '1', 10);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Update URL with new params
  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 when filters change
    if (key !== 'page') {
      params.delete('page');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
    setSearchQuery('');
  };

  const hasActiveFilters =
    searchQuery ||
    searchParams.minPrice ||
    searchParams.maxPrice ||
    searchParams.type ||
    searchParams.tags;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search and Controls Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="w-full sm:w-96">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={(query) => updateSearchParams('search', query)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                •
              </span>
            )}
          </button>

          <SortDropdown
            value={searchParams.sort || 'default'}
            onChange={(value) => updateSearchParams('sort', value)}
          />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Filter Panel */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <FilterPanel
            productTypes={productTypes}
            tags={allTags}
            selectedType={searchParams.type}
            selectedTags={searchParams.tags?.split(',').filter(Boolean) || []}
            minPrice={searchParams.minPrice}
            maxPrice={searchParams.maxPrice}
            onTypeChange={(type) => updateSearchParams('type', type)}
            onTagsChange={(tags) =>
              updateSearchParams('tags', tags.join(','))
            }
            onPriceChange={(min, max) => {
              updateSearchParams('minPrice', min);
              updateSearchParams('maxPrice', max);
            }}
            onClearFilters={clearFilters}
            hasActiveFilters={!!hasActiveFilters}
          />
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-600">
            Showing {paginatedProducts.length} of {filteredProducts.length}{' '}
            products
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-2 text-blue-600 hover:text-blue-700 underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Products */}
          {paginatedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() =>
                      updateSearchParams('page', String(currentPage - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Show first, last, current, and adjacent pages
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, idx, arr) => {
                        // Add ellipsis between non-consecutive pages
                        const prevPage = arr[idx - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;

                        return (
                          <div key={page} className="flex items-center gap-1">
                            {showEllipsis && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <button
                              onClick={() =>
                                updateSearchParams('page', String(page))
                              }
                              className={`min-w-[40px] px-3 py-2 rounded-lg transition-colors ${
                                page === currentPage
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        );
                      })}
                  </div>

                  <button
                    onClick={() =>
                      updateSearchParams('page', String(currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            // Empty State
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No products found
              </h3>
              <p className="mt-2 text-gray-600">
                Try adjusting your filters or search query
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        key={`${searchParams.minPrice}-${searchParams.maxPrice}`}
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        productTypes={productTypes}
        tags={allTags}
        selectedType={searchParams.type}
        selectedTags={searchParams.tags?.split(',').filter(Boolean) || []}
        minPrice={searchParams.minPrice}
        maxPrice={searchParams.maxPrice}
        onTypeChange={(type) => updateSearchParams('type', type)}
        onTagsChange={(tags) => updateSearchParams('tags', tags.join(','))}
        onPriceChange={(min, max) => {
          updateSearchParams('minPrice', min);
          updateSearchParams('maxPrice', max);
        }}
        onClearFilters={clearFilters}
        hasActiveFilters={!!hasActiveFilters}
      />
    </div>
  );
}
