'use client';

import type { ShopifyProductVariant } from '@/types/shopify';

interface VariantSelectorProps {
  variants: ShopifyProductVariant[];
  selectedVariant: ShopifyProductVariant;
  onVariantChange: (variant: ShopifyProductVariant) => void;
}

export default function VariantSelector({
  variants,
  selectedVariant,
  onVariantChange,
}: VariantSelectorProps) {
  // Group variants by option names (e.g., Size, Color)
  const optionNames = Array.from(
    new Set(
      variants.flatMap((v) => v.selectedOptions.map((opt) => opt.name))
    )
  );

  // Get available values for each option
  const getOptionValues = (optionName: string) => {
    return Array.from(
      new Set(
        variants
          .map(
            (v) =>
              v.selectedOptions.find((opt) => opt.name === optionName)?.value
          )
          .filter(Boolean) as string[]
      )
    );
  };

  // Get current selected value for an option
  const getSelectedValue = (optionName: string) => {
    return selectedVariant.selectedOptions.find((opt) => opt.name === optionName)
      ?.value;
  };

  // Find variant that matches the selected options
  const handleOptionChange = (optionName: string, value: string) => {
    const newSelectedOptions = selectedVariant.selectedOptions.map((opt) =>
      opt.name === optionName ? { ...opt, value } : opt
    );

    const matchingVariant = variants.find((v) =>
      v.selectedOptions.every((opt) => {
        const newOpt = newSelectedOptions.find((o) => o.name === opt.name);
        return newOpt?.value === opt.value;
      })
    );

    if (matchingVariant) {
      onVariantChange(matchingVariant);
    }
  };

  // Check if a specific option value is available
  const isOptionAvailable = (optionName: string, value: string) => {
    // Create hypothetical selected options with this value
    const hypotheticalOptions = selectedVariant.selectedOptions.map((opt) =>
      opt.name === optionName ? { ...opt, value } : opt
    );

    // Check if any variant matches and is available
    return variants.some(
      (v) =>
        v.selectedOptions.every((opt) => {
          const hypoOpt = hypotheticalOptions.find((o) => o.name === opt.name);
          return hypoOpt?.value === opt.value;
        }) && v.availableForSale
    );
  };

  return (
    <div className="space-y-6">
      {optionNames.map((optionName) => {
        const values = getOptionValues(optionName);
        const currentValue = getSelectedValue(optionName);

        // Skip if only one value (no need to show selector)
        if (values.length <= 1) return null;

        return (
          <div key={optionName}>
            <label className="block text-sm font-semibold text-ink-brown mb-3">
              {optionName}: <span className="font-normal">{currentValue}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                const isSelected = value === currentValue;
                const isAvailable = isOptionAvailable(optionName, value);

                return (
                  <button
                    key={value}
                    onClick={() => handleOptionChange(optionName, value)}
                    disabled={!isAvailable}
                    className={`
                      px-4 py-2 border rounded-md text-sm font-medium transition-all
                      ${
                        isSelected
                          ? 'border-2 border-forest bg-forest/10 text-forest'
                          : isAvailable
                            ? 'border border-gold/40 bg-white text-ink-brown hover:border-forest hover:text-forest'
                            : 'border border-gold/20 bg-parchment text-sage cursor-not-allowed line-through'
                      }
                    `}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
