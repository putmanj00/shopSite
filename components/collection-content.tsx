'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import ProductCard from '@/components/product-card';
import SearchBar from '@/components/search-bar';
import FilterPanel from '@/components/filter-panel';
import CategoryFilterPanel from '@/components/category-filter-panel';
import SortDropdown from '@/components/sort-dropdown';
import MobileFilterDrawer from '@/components/mobile-filter-drawer';
import CollectionBreadcrumbs from '@/components/collection-breadcrumbs';
import { getCategoryFilters, hasCategoryFilters } from '@/lib/category-filters';
import { isShowableProduct } from '@/lib/product-filters';
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
    [key: string]: string | undefined;
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

  // ARIA live region ref for announcing filter changes
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState('');

  // Check if this collection has category-specific filters
  const categoryConfig = getCategoryFilters(collection.handle);
  const hasSpecificFilters = hasCategoryFilters(collection.handle);

  // Parse category-specific filters from URL
  const categoryFilters = useMemo(() => {
    if (!categoryConfig) return {};
    const filters: Record<string, string[]> = {};
    categoryConfig.filters.forEach((filter) => {
      const value = searchParams[filter.id];
      if (value) {
        filters[filter.id] = value.split(',').filter(Boolean);
      }
    });
    return filters;
  }, [categoryConfig, searchParams]);

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
    let products = collection.products.edges
      .map(({ node }) => node)
      .filter(isShowableProduct);

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

    // Apply category-specific filters (filter by tags that match filter values)
    if (hasSpecificFilters && categoryConfig) {
      Object.entries(categoryFilters).forEach(([, values]) => {
        if (values.length > 0) {
          products = products.filter((product) =>
            values.some((value) =>
              product.tags.some(
                (tag) =>
                  tag.toLowerCase() === value.toLowerCase() ||
                  tag.toLowerCase().includes(value.toLowerCase())
              )
            )
          );
        }
      });
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
  }, [collection, searchQuery, searchParams, hasSpecificFilters, categoryConfig, categoryFilters]);

  // Pagination
  const itemsPerPage = 12;
  const currentPage = parseInt(searchParams.page || '1', 10);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Announce filter changes to screen readers
  const announceChange = useCallback((message: string) => {
    setAnnouncement(message);
    // Clear after announcement
    setTimeout(() => setAnnouncement(''), 1000);
  }, []);

  // Update URL with new params
  const updateSearchParams = useCallback(
    (key: string, value: string) => {
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
    },
    [router, pathname, urlSearchParams]
  );

  // Handle category filter changes
  const handleCategoryFilterChange = useCallback(
    (filterId: string, values: string[]) => {
      updateSearchParams(filterId, values.join(','));
      const filterLabel = categoryConfig?.filters.find((f) => f.id === filterId)?.label || filterId;
      if (values.length > 0) {
        announceChange(`${filterLabel} filter updated. ${values.length} option${values.length > 1 ? 's' : ''} selected.`);
      } else {
        announceChange(`${filterLabel} filter cleared.`);
      }
    },
    [updateSearchParams, categoryConfig, announceChange]
  );

  const clearFilters = useCallback(() => {
    router.push(pathname);
    setSearchQuery('');
    announceChange('All filters cleared.');
  }, [router, pathname, announceChange]);

  // Check for active filters
  const hasActiveFilters = useMemo(() => {
    if (searchQuery) return true;
    if (searchParams.minPrice || searchParams.maxPrice) return true;
    if (searchParams.type || searchParams.tags) return true;
    // Check category-specific filters
    if (hasSpecificFilters && categoryConfig) {
      for (const filter of categoryConfig.filters) {
        if (searchParams[filter.id]) return true;
      }
    }
    return false;
  }, [searchQuery, searchParams, hasSpecificFilters, categoryConfig]);

  // Announce results count when filters change (using ref to avoid setState in effect)
  const prevFilteredCountRef = useRef(filteredProducts.length);
  useEffect(() => {
    if (hasActiveFilters && prevFilteredCountRef.current !== filteredProducts.length) {
      // Use setTimeout to avoid synchronous setState in effect
      const timeoutId = setTimeout(() => {
        setAnnouncement(`Showing ${filteredProducts.length} products.`);
        setTimeout(() => setAnnouncement(''), 1000);
      }, 0);
      prevFilteredCountRef.current = filteredProducts.length;
      return () => clearTimeout(timeoutId);
    }
  }, [filteredProducts.length, hasActiveFilters]);

  // Handle page change with keyboard support
  const handlePageChange = useCallback(
    (page: number) => {
      updateSearchParams('page', String(page));
      announceChange(`Page ${page} of ${totalPages}`);
      // Scroll to top of product grid
      document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [updateSearchParams, totalPages, announceChange]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ARIA Live Region for announcements */}
      <div
        ref={liveRegionRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Breadcrumbs */}
      <CollectionBreadcrumbs
        collectionTitle={collection.title}
        collectionHandle={collection.handle}
      />

      {/* Search and Controls Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="w-full sm:w-96">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={(query) => {
              updateSearchParams('search', query);
              if (query) {
                announceChange(`Searching for "${query}"`);
              }
            }}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 min-h-11 border border-gold/30 rounded-lg hover:bg-cream transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2"
            aria-label="Open filters"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
              <span className="bg-terracotta text-white text-xs px-2 py-0.5 rounded-full">
                •
              </span>
            )}
          </button>

          <SortDropdown
            value={searchParams.sort || 'default'}
            onChange={(value) => {
              updateSearchParams('sort', value);
              const sortLabels: Record<string, string> = {
                'default': 'Featured',
                'price-asc': 'Price: Low to High',
                'price-desc': 'Price: High to Low',
                'newest': 'Newest',
                'title-asc': 'Name: A to Z',
                'title-desc': 'Name: Z to A',
              };
              announceChange(`Sorted by ${sortLabels[value] || value}`);
            }}
          />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Filter Panel */}
        <aside className="hidden lg:block w-64 flex-shrink-0" aria-label="Product filters">
          {hasSpecificFilters && categoryConfig ? (
            <CategoryFilterPanel
              config={categoryConfig}
              selectedFilters={categoryFilters}
              onFilterChange={handleCategoryFilterChange}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          ) : (
            <FilterPanel
              productTypes={productTypes}
              tags={allTags}
              selectedType={searchParams.type}
              selectedTags={searchParams.tags?.split(',').filter(Boolean) || []}
              minPrice={searchParams.minPrice}
              maxPrice={searchParams.maxPrice}
              onTypeChange={(type) => {
                updateSearchParams('type', type);
                announceChange(type ? `Filtered by ${type}` : 'Type filter cleared');
              }}
              onTagsChange={(tags) => {
                updateSearchParams('tags', tags.join(','));
                announceChange(`${tags.length} tags selected`);
              }}
              onPriceChange={(min, max) => {
                updateSearchParams('minPrice', min);
                updateSearchParams('maxPrice', max);
                announceChange('Price range updated');
              }}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          )}
        </aside>

        {/* Product Grid */}
        <div className="flex-1" id="product-grid">
          {/* Results Count */}
          <div className="mb-4 text-sm text-earth" aria-live="polite">
            Showing {paginatedProducts.length} of {filteredProducts.length}{' '}
            products
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-2 text-terracotta hover:text-terracotta/80 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 rounded"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Products */}
          {paginatedProducts.length > 0 ? (
            <>
              <div
                data-testid="product-grid"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                role="list"
                aria-label="Products"
              >
                {paginatedProducts.map((product) => (
                  <div key={product.id} role="listitem">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  className="mt-8 flex items-center justify-center gap-2"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 min-h-11 border border-gold/30 rounded-lg hover:bg-cream disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 text-ink-brown"
                    aria-label="Go to previous page"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1" role="group" aria-label="Page numbers">
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
                              <span className="px-2 text-earth/40" aria-hidden="true">
                                ...
                              </span>
                            )}
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`min-w-11 min-h-11 px-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 ${page === currentPage
                                  ? 'bg-terracotta text-white'
                                  : 'border border-gold/30 hover:bg-cream text-ink-brown'
                                }`}
                              aria-label={`Go to page ${page}`}
                              aria-current={page === currentPage ? 'page' : undefined}
                            >
                              {page}
                            </button>
                          </div>
                        );
                      })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 min-h-11 border border-gold/30 rounded-lg hover:bg-cream disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 text-ink-brown"
                    aria-label="Go to next page"
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          ) : (
            // Empty State
            <div className="text-center py-12" role="status">
              <svg
                className="mx-auto h-12 w-12 text-earth/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-ink-brown">
                No products found
              </h3>
              <p className="mt-2 text-earth">
                Try adjusting your filters or search query
              </p>
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="primary"
                  size="sm"
                  className="mt-4"
                >
                  Clear all filters
                </Button>
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
        onTypeChange={(type) => {
          updateSearchParams('type', type);
          announceChange(type ? `Filtered by ${type}` : 'Type filter cleared');
        }}
        onTagsChange={(tags) => {
          updateSearchParams('tags', tags.join(','));
          announceChange(`${tags.length} tags selected`);
        }}
        onPriceChange={(min, max) => {
          updateSearchParams('minPrice', min);
          updateSearchParams('maxPrice', max);
          announceChange('Price range updated');
        }}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  );
}
