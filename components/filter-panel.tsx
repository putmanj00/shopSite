'use client';

import { useState } from 'react';

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
    <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
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
          <h4 className="text-sm font-semibold text-gray-900">Price Range</h4>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handlePriceApply}
              className="w-full px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              Apply
            </button>
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
            <h4 className="text-sm font-semibold text-gray-900">
              Product Type
            </h4>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.type ? 'rotate-180' : ''}`}
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
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedType === type}
                    onChange={() => handleTypeSelect(type)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
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
            <h4 className="text-sm font-semibold text-gray-900">Tags</h4>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.tags ? 'rotate-180' : ''}`}
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
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => handleTagToggle(tag)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{tag}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
