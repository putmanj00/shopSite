'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  productTypes: string[];
  tags: string[];
  selectedType?: string;
  selectedTags: string[];
  minPrice?: string;
  maxPrice?: string;
  onTypeChange: (type: string) => void;
  onTagsChange: (tags: string[]) => void;
  onPriceChange: (min: string, max: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  productTypes,
  tags,
  selectedType,
  selectedTags,
  minPrice,
  maxPrice,
  onTypeChange,
  onTagsChange,
  onPriceChange,
  onClearFilters,
  hasActiveFilters,
}: MobileFilterDrawerProps) {
  // Local state for price inputs
  const [localPriceMin, setLocalPriceMin] = useState(minPrice || '');
  const [localPriceMax, setLocalPriceMax] = useState(maxPrice || '');
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    type: true,
    tags: true,
  });

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePriceApply = () => {
    onPriceChange(localPriceMin, localPriceMax);
  };

  const handleTypeSelect = (type: string) => {
    if (selectedType === type) {
      onTypeChange('');
    } else {
      onTypeChange(type);
    }
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    onTagsChange(newTags);
  };

  const handleApply = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-forest/50 z-40 lg:hidden"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onClose();
          }
        }}
        role="button"
        tabIndex={-1}
        aria-label="Close filters"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-cream z-50 lg:hidden flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-ink-brown">Filters</h2>
          <button
            onClick={onClose}
            className="min-w-11 min-h-11 p-2 flex items-center justify-center hover:bg-parchment rounded-lg transition-colors"
            aria-label="Close filters"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Price Range Filter */}
          <div>
            <button
              onClick={() => toggleSection('price')}
              className="flex items-center justify-between w-full mb-3"
            >
              <h3 className="text-sm font-semibold text-ink-brown">
                Price Range
              </h3>
              <svg
                className={`w-5 h-5 text-earth/60 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {expandedSections.price && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localPriceMin}
                    onChange={(e) => setLocalPriceMin(e.target.value)}
                    className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  />
                  <span className="text-earth/60">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={localPriceMax}
                    onChange={(e) => setLocalPriceMax(e.target.value)}
                    className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  />
                </div>
                <Button
                  onClick={handlePriceApply}
                  variant="primary"
                  size="sm"
                  fullWidth
                  className="font-medium"
                >
                  Apply Price
                </Button>
              </div>
            )}
          </div>

          {/* Product Type Filter */}
          {productTypes.length > 0 && (
            <div>
              <button
                onClick={() => toggleSection('type')}
                className="flex items-center justify-between w-full mb-3"
              >
                <h3 className="text-sm font-semibold text-ink-brown">
                  Product Type
                </h3>
                <svg
                  className={`w-5 h-5 text-earth/60 transition-transform ${expandedSections.type ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {expandedSections.type && (
                <div className="space-y-2">
                  {productTypes.map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 cursor-pointer hover:bg-parchment p-2 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedType === type}
                        onChange={() => handleTypeSelect(type)}
                        className="w-4 h-4 text-terracotta border-gold/30 rounded focus:ring-2 focus:ring-terracotta"
                      />
                      <span className="text-sm text-earth capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags Filter */}
          {tags.length > 0 && (
            <div>
              <button
                onClick={() => toggleSection('tags')}
                className="flex items-center justify-between w-full mb-3"
              >
                <h3 className="text-sm font-semibold text-ink-brown">Tags</h3>
                <svg
                  className={`w-5 h-5 text-earth/60 transition-transform ${expandedSections.tags ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {expandedSections.tags && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tags.map((tag) => (
                    <label
                      key={tag}
                      className="flex items-center gap-2 cursor-pointer hover:bg-parchment p-2 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => handleTagToggle(tag)}
                        className="w-4 h-4 text-terracotta border-gold/30 rounded focus:ring-2 focus:ring-terracotta"
                      />
                      <span className="text-sm text-earth capitalize">{tag}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 space-y-2">
          {hasActiveFilters && (
            <button
              onClick={() => {
                onClearFilters();
                onClose();
              }}
              className="w-full px-4 py-3 border border-gold/30 text-earth rounded-lg hover:bg-parchment transition-colors font-medium"
            >
              Clear All Filters
            </button>
          )}
          <Button
            onClick={handleApply}
            variant="primary"
            fullWidth
            className="font-medium"
          >
            Show Results
          </Button>
        </div>
      </div>
    </>
  );
}
