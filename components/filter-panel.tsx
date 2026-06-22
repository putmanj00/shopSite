'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface FilterPanelProps {
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

export default function FilterPanel({
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
}: FilterPanelProps) {
  const [priceMin, setPriceMin] = useState(minPrice || '');
  const [priceMax, setPriceMax] = useState(maxPrice || '');
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    type: true,
    tags: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePriceApply = () => {
    onPriceChange(priceMin, priceMax);
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

  return (
    <div className="bg-cream border border-gold/25 rounded-lg p-4 sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gold/20">
        <h3 className="text-lg font-semibold text-ink-brown">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-primary-700 hover:text-primary-800 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full mb-3"
        >
          <h4 className="text-sm font-semibold text-ink-brown">Price Range</h4>
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
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm text-ink-brown focus:ring-2 focus:ring-terracotta focus:border-transparent"
              />
              <span className="text-earth/60">-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-full px-3 py-2 border border-gold/30 rounded-lg text-sm text-ink-brown focus:ring-2 focus:ring-terracotta focus:border-transparent"
              />
            </div>
            <Button
              onClick={handlePriceApply}
              variant="primary"
              size="sm"
              fullWidth
              className="font-medium"
            >
              Apply
            </Button>
          </div>
        )}
      </div>

      {/* Product Type Filter */}
      {productTypes.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection('type')}
            className="flex items-center justify-between w-full mb-3"
          >
            <h4 className="text-sm font-semibold text-ink-brown">
              Product Type
            </h4>
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
                  className="flex items-center gap-2 cursor-pointer hover:bg-parchment p-2 rounded-lg transition-colors"
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
        <div className="mb-6">
          <button
            onClick={() => toggleSection('tags')}
            className="flex items-center justify-between w-full mb-3"
          >
            <h4 className="text-sm font-semibold text-ink-brown">Tags</h4>
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
                  className="flex items-center gap-2 cursor-pointer hover:bg-parchment p-2 rounded-lg transition-colors"
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
  );
}
