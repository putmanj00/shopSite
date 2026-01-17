/**
 * Category-specific filter configurations for collection pages
 * Each category has unique filter options relevant to its product type
 */

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterSection {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range';
  options?: FilterOption[];
  // For range type filters
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface CategoryFilterConfig {
  handle: string;
  name: string;
  description: string;
  filters: FilterSection[];
  // Optional info sections
  sizeGuideUrl?: string;
  careInfoUrl?: string;
}

// Tie-Dye Collection Filters
const tieDyeFilters: CategoryFilterConfig = {
  handle: 'tie-dye',
  name: 'Tie-Dye',
  description: 'Handcrafted tie-dye apparel with unique patterns and vibrant colors.',
  filters: [
    {
      id: 'color',
      label: 'Color Palette',
      type: 'checkbox',
      options: [
        { value: 'rainbow', label: 'Rainbow' },
        { value: 'ocean', label: 'Ocean Blues' },
        { value: 'sunset', label: 'Sunset Warm' },
        { value: 'earth', label: 'Earth Tones' },
        { value: 'pastel', label: 'Pastel' },
        { value: 'neon', label: 'Neon/Bright' },
        { value: 'monochrome', label: 'Monochrome' },
      ],
    },
    {
      id: 'pattern',
      label: 'Pattern Style',
      type: 'checkbox',
      options: [
        { value: 'spiral', label: 'Spiral' },
        { value: 'bullseye', label: 'Bullseye' },
        { value: 'crumple', label: 'Crumple' },
        { value: 'stripe', label: 'Stripe' },
        { value: 'sunburst', label: 'Sunburst' },
        { value: 'geode', label: 'Geode' },
        { value: 'ice-dye', label: 'Ice Dye' },
      ],
    },
    {
      id: 'size',
      label: 'Size',
      type: 'checkbox',
      options: [
        { value: 'xs', label: 'XS' },
        { value: 's', label: 'S' },
        { value: 'm', label: 'M' },
        { value: 'l', label: 'L' },
        { value: 'xl', label: 'XL' },
        { value: '2xl', label: '2XL' },
        { value: '3xl', label: '3XL' },
      ],
    },
    {
      id: 'garment',
      label: 'Garment Type',
      type: 'checkbox',
      options: [
        { value: 't-shirt', label: 'T-Shirt' },
        { value: 'hoodie', label: 'Hoodie' },
        { value: 'tank-top', label: 'Tank Top' },
        { value: 'dress', label: 'Dress' },
        { value: 'shorts', label: 'Shorts' },
        { value: 'socks', label: 'Socks' },
      ],
    },
  ],
  sizeGuideUrl: '/size-guide#tie-dye',
};

// Leather Goods Collection Filters
const leatherFilters: CategoryFilterConfig = {
  handle: 'leather',
  name: 'Leather Goods',
  description: 'Premium handcrafted leather goods made with traditional techniques.',
  filters: [
    {
      id: 'leather-type',
      label: 'Leather Type',
      type: 'checkbox',
      options: [
        { value: 'full-grain', label: 'Full Grain' },
        { value: 'top-grain', label: 'Top Grain' },
        { value: 'vegetable-tanned', label: 'Vegetable Tanned' },
        { value: 'chrome-tanned', label: 'Chrome Tanned' },
        { value: 'oil-tanned', label: 'Oil Tanned' },
        { value: 'nubuck', label: 'Nubuck' },
        { value: 'suede', label: 'Suede' },
      ],
    },
    {
      id: 'color',
      label: 'Color',
      type: 'checkbox',
      options: [
        { value: 'natural', label: 'Natural/Tan' },
        { value: 'brown', label: 'Brown' },
        { value: 'dark-brown', label: 'Dark Brown' },
        { value: 'black', label: 'Black' },
        { value: 'cognac', label: 'Cognac' },
        { value: 'burgundy', label: 'Burgundy' },
        { value: 'navy', label: 'Navy' },
      ],
    },
    {
      id: 'product-type',
      label: 'Product Type',
      type: 'checkbox',
      options: [
        { value: 'wallet', label: 'Wallet' },
        { value: 'bag', label: 'Bag' },
        { value: 'belt', label: 'Belt' },
        { value: 'card-holder', label: 'Card Holder' },
        { value: 'journal', label: 'Journal/Notebook' },
        { value: 'keychain', label: 'Keychain' },
        { value: 'watch-strap', label: 'Watch Strap' },
      ],
    },
    {
      id: 'finish',
      label: 'Finish',
      type: 'checkbox',
      options: [
        { value: 'matte', label: 'Matte' },
        { value: 'polished', label: 'Polished' },
        { value: 'distressed', label: 'Distressed' },
        { value: 'burnished', label: 'Burnished' },
      ],
    },
  ],
  careInfoUrl: '/care-guide#leather',
};

// Jewelry Collection Filters
const jewelryFilters: CategoryFilterConfig = {
  handle: 'jewelry',
  name: 'Jewelry',
  description: 'Handcrafted artisan jewelry featuring unique designs and quality materials.',
  filters: [
    {
      id: 'metal',
      label: 'Metal Type',
      type: 'checkbox',
      options: [
        { value: 'gold', label: 'Gold' },
        { value: 'gold-filled', label: 'Gold Filled' },
        { value: 'gold-vermeil', label: 'Gold Vermeil' },
        { value: 'sterling-silver', label: 'Sterling Silver' },
        { value: 'rose-gold', label: 'Rose Gold' },
        { value: 'brass', label: 'Brass' },
        { value: 'copper', label: 'Copper' },
        { value: 'mixed-metal', label: 'Mixed Metal' },
      ],
    },
    {
      id: 'stone',
      label: 'Stone/Material',
      type: 'checkbox',
      options: [
        { value: 'pearl', label: 'Pearl' },
        { value: 'turquoise', label: 'Turquoise' },
        { value: 'amethyst', label: 'Amethyst' },
        { value: 'opal', label: 'Opal' },
        { value: 'moonstone', label: 'Moonstone' },
        { value: 'labradorite', label: 'Labradorite' },
        { value: 'jade', label: 'Jade' },
        { value: 'onyx', label: 'Onyx' },
        { value: 'none', label: 'No Stone' },
      ],
    },
    {
      id: 'jewelry-type',
      label: 'Type',
      type: 'checkbox',
      options: [
        { value: 'necklace', label: 'Necklace' },
        { value: 'earrings', label: 'Earrings' },
        { value: 'ring', label: 'Ring' },
        { value: 'bracelet', label: 'Bracelet' },
        { value: 'anklet', label: 'Anklet' },
        { value: 'pendant', label: 'Pendant' },
        { value: 'set', label: 'Jewelry Set' },
      ],
    },
    {
      id: 'style',
      label: 'Style',
      type: 'checkbox',
      options: [
        { value: 'minimalist', label: 'Minimalist' },
        { value: 'bohemian', label: 'Bohemian' },
        { value: 'statement', label: 'Statement' },
        { value: 'vintage', label: 'Vintage' },
        { value: 'modern', label: 'Modern' },
        { value: 'layering', label: 'Layering' },
      ],
    },
  ],
  sizeGuideUrl: '/size-guide#jewelry',
};

// Art & Prints Collection Filters
const artFilters: CategoryFilterConfig = {
  handle: 'art',
  name: 'Art & Prints',
  description: 'Original artwork and limited edition prints from independent artists.',
  filters: [
    {
      id: 'size',
      label: 'Size',
      type: 'checkbox',
      options: [
        { value: 'small', label: 'Small (up to 12")' },
        { value: 'medium', label: 'Medium (12"-24")' },
        { value: 'large', label: 'Large (24"-36")' },
        { value: 'extra-large', label: 'Extra Large (36"+)' },
      ],
    },
    {
      id: 'medium',
      label: 'Medium',
      type: 'checkbox',
      options: [
        { value: 'print', label: 'Print' },
        { value: 'canvas', label: 'Canvas' },
        { value: 'watercolor', label: 'Watercolor' },
        { value: 'acrylic', label: 'Acrylic' },
        { value: 'oil', label: 'Oil' },
        { value: 'mixed-media', label: 'Mixed Media' },
        { value: 'digital', label: 'Digital Art' },
        { value: 'photography', label: 'Photography' },
      ],
    },
    {
      id: 'style',
      label: 'Style',
      type: 'checkbox',
      options: [
        { value: 'abstract', label: 'Abstract' },
        { value: 'landscape', label: 'Landscape' },
        { value: 'portrait', label: 'Portrait' },
        { value: 'botanical', label: 'Botanical' },
        { value: 'minimalist', label: 'Minimalist' },
        { value: 'contemporary', label: 'Contemporary' },
        { value: 'vintage', label: 'Vintage' },
        { value: 'pop-art', label: 'Pop Art' },
      ],
    },
    {
      id: 'framing',
      label: 'Framing Options',
      type: 'checkbox',
      options: [
        { value: 'unframed', label: 'Unframed' },
        { value: 'black-frame', label: 'Black Frame' },
        { value: 'white-frame', label: 'White Frame' },
        { value: 'natural-wood', label: 'Natural Wood Frame' },
        { value: 'gallery-wrapped', label: 'Gallery Wrapped' },
      ],
    },
    {
      id: 'edition',
      label: 'Edition',
      type: 'checkbox',
      options: [
        { value: 'original', label: 'Original' },
        { value: 'limited', label: 'Limited Edition' },
        { value: 'open', label: 'Open Edition' },
      ],
    },
  ],
};

// Map of all category filter configs
export const categoryFilterConfigs: Record<string, CategoryFilterConfig> = {
  'tie-dye': tieDyeFilters,
  'leather': leatherFilters,
  'jewelry': jewelryFilters,
  'art': artFilters,
};

/**
 * Get filter configuration for a collection handle
 * Returns undefined if no category-specific filters exist
 */
export function getCategoryFilters(handle: string): CategoryFilterConfig | undefined {
  return categoryFilterConfigs[handle.toLowerCase()];
}

/**
 * Check if a collection has category-specific filters
 */
export function hasCategoryFilters(handle: string): boolean {
  return handle.toLowerCase() in categoryFilterConfigs;
}
