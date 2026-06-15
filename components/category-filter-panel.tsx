'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { CategoryFilterConfig, FilterSection } from '@/lib/category-filters';

interface CategoryFilterPanelProps {
  config: CategoryFilterConfig;
  selectedFilters: Record<string, string[]>;
  onFilterChange: (filterId: string, values: string[]) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

/**
 * Category-specific filter panel with collapsible sections
 * Renders filters based on the category configuration
 */
export default function CategoryFilterPanel({
  config,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
}: CategoryFilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    // Start with first two sections expanded
    const initial: Record<string, boolean> = {};
    config.filters.forEach((filter, index) => {
      initial[filter.id] = index < 2;
    });
    return initial;
  });

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }, []);

  const handleCheckboxChange = useCallback(
    (filterId: string, value: string, checked: boolean) => {
      const currentValues = selectedFilters[filterId] || [];
      const newValues = checked
        ? [...currentValues, value]
        : currentValues.filter((v) => v !== value);
      onFilterChange(filterId, newValues);
    },
    [selectedFilters, onFilterChange]
  );

  const renderFilterSection = (filter: FilterSection) => {
    const isExpanded = expandedSections[filter.id];
    const selectedValues = selectedFilters[filter.id] || [];
    const hasSelected = selectedValues.length > 0;

    return (
      <div key={filter.id} className="border-b border-gold/20 last:border-b-0">
        <button
          onClick={() => toggleSection(filter.id)}
          className="flex items-center justify-between w-full py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
          aria-expanded={isExpanded}
          aria-controls={`filter-section-${filter.id}`}
        >
          <span className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
            {filter.label}
            {hasSelected && (
              <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">
                {selectedValues.length}
              </span>
            )}
          </span>
          <svg
            className={`w-5 h-5 text-neutral-500 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isExpanded && filter.options && (
          <div
            id={`filter-section-${filter.id}`}
            className="pb-4 space-y-2"
            role="group"
            aria-label={`${filter.label} options`}
          >
            {filter.options.map((option) => {
              const isChecked = selectedValues.includes(option.value);
              const inputId = `filter-${filter.id}-${option.value}`;

              return (
                <label
                  key={option.value}
                  htmlFor={inputId}
                  className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors ${
                    isChecked
                      ? 'bg-primary-50'
                      : 'hover:bg-neutral-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    id={inputId}
                    checked={isChecked}
                    onChange={(e) =>
                      handleCheckboxChange(filter.id, option.value, e.target.checked)
                    }
                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-neutral-700">{option.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-cream border border-gold/25 rounded-lg p-5 sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gold/20">
        <h2 className="text-lg font-semibold text-neutral-900">
          Filter {config.name}
        </h2>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter Sections */}
      <div className="divide-y divide-gold/20">
        {config.filters.map(renderFilterSection)}
      </div>

      {/* Info Links */}
      {(config.sizeGuideUrl || config.careInfoUrl) && (
        <div className="mt-6 pt-4 border-t border-gold/20 space-y-2">
          {config.sizeGuideUrl && (
            <Link
              href={config.sizeGuideUrl}
              className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Size Guide
            </Link>
          )}
          {config.careInfoUrl && (
            <Link
              href={config.careInfoUrl}
              className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Care Instructions
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
