'use client';

import { useState } from 'react';
import type { ShopifyProduct, ShopifyProductVariant } from '@/types/shopify';

import Price from '@/components/price';
import VariantSelector from '@/components/variant-selector';
import AddToCartButton from '@/components/add-to-cart-button';
import WishlistButton from '@/components/wishlist-button';
import SizeGuideModal from '@/components/size-guide-modal';
import SocialShareButtons from '@/components/social-share-buttons';
import StickyAddToCart from '@/components/sticky-add-to-cart';

interface ProductInfoProps {
  product: ShopifyProduct;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const variants = product.variants.edges.map((edge) => edge.node);
  const [selectedVariant, setSelectedVariant] = useState<ShopifyProductVariant>(
    variants[0]
  );
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Determine if this product type should show size guide
  const productType = product.productType?.toLowerCase() || '';
  const showSizeGuideButton =
    productType.includes('apparel') ||
    productType.includes('clothing') ||
    productType.includes('tie-dye') ||
    productType.includes('shirt') ||
    productType.includes('hoodie') ||
    productType.includes('jewelry') ||
    productType.includes('ring') ||
    productType.includes('bracelet');

  const price = selectedVariant.price;
  const compareAtPrice = selectedVariant.compareAtPrice;
  const hasDiscount =
    compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price.amount);

  return (
    <div className="space-y-6">
      {/* Product Title */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-ink-brown mb-2">
          {product.title}
        </h1>
        {product.vendor && (
          <p className="text-lg text-sage">by {product.vendor}</p>
        )}
      </div>

      {/* Price */}
      <div className="border-t border-b border-gold/30 py-4">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-terracotta">
            <Price amount={price.amount} currencyCode={price.currencyCode} />
          </span>
          {hasDiscount && compareAtPrice && (
            <>
              <span className="text-xl text-sage line-through">
                <Price amount={compareAtPrice.amount} currencyCode={compareAtPrice.currencyCode} />
              </span>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                {Math.round(
                  ((parseFloat(compareAtPrice.amount) -
                    parseFloat(price.amount)) /
                    parseFloat(compareAtPrice.amount)) *
                  100
                )}
                % OFF
              </span>
            </>
          )}
        </div>
      </div>

      {/* Stock Status */}
      <div>
        {selectedVariant.availableForSale ? (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-700 font-medium">
              In Stock
              {selectedVariant.quantityAvailable > 0 &&
                selectedVariant.quantityAvailable < 10 && (
                  <span className="text-orange-600 ml-2">
                    (Only {selectedVariant.quantityAvailable} left!)
                  </span>
                )}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-red-700 font-medium">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Variant Selector */}
      {variants.length > 1 && (
        <VariantSelector
          variants={variants}
          selectedVariant={selectedVariant}
          onVariantChange={setSelectedVariant}
        />
      )}

      {/* Size Guide Link */}
      {showSizeGuideButton && (
        <button
          onClick={() => setShowSizeGuide(true)}
          className="text-sm text-forest hover:text-forest/80 font-medium underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 rounded"
        >
          View Size Guide
        </button>
      )}

      {/* Actions */}
      <div className="flex gap-4 items-center">
        <AddToCartButton variant={selectedVariant} id="main-add-to-cart" />
        <WishlistButton
          product={product}
          className="!p-3 border border-gold/30 !bg-white hover:!bg-parchment !text-sage hover:!text-red-500 rounded-lg h-12 w-12 flex items-center justify-center"
        />
      </div>

      {/* Product Meta */}
      <div className="border-t border-gold/30 pt-6 space-y-3">
        {product.productType && (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-ink-brown">Category:</span>
            <span className="text-earth">{product.productType}</span>
          </div>
        )}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="font-semibold text-ink-brown text-sm">Tags:</span>
            {product.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="bg-parchment text-ink-brown border border-gold/30 px-3 py-1 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Social Share */}
      <div className="border-t border-gold/30 pt-6">
        <SocialShareButtons
          title={product.title}
          description={product.description}
        />
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        productType={product.productType}
      />

      {/* Sticky Add to Cart (Mobile) */}
      <StickyAddToCart product={product} selectedVariant={selectedVariant} />
    </div>
  );
}
