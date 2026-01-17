'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ShopifyProduct } from '@/types/shopify';

interface ImageGalleryProps {
  product: ShopifyProduct;
}

export default function ImageGallery({ product }: ImageGalleryProps) {
  const images = product.images.edges.map((edge) => edge.node);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-400 text-lg">No image available</span>
      </div>
    );
  }

  const selectedImage = images[selectedImageIndex];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-md cursor-zoom-in group"
        onClick={() => setIsZoomed(!isZoomed)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsZoomed(!isZoomed);
          }
        }}
        role="button"
        tabIndex={0}
        aria-pressed={isZoomed}
        aria-label={isZoomed ? 'Zoom out of image' : 'Zoom in on image'}
      >
        <Image
          src={selectedImage.url}
          alt={selectedImage.altText || product.title}
          fill
          className={`object-contain transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'
            } group-hover:scale-110`}
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={selectedImageIndex === 0}
        />
        {isZoomed && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
            <span className="text-white bg-black/50 px-4 py-2 rounded-lg text-sm">
              Click to zoom out
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedImageIndex(index);
                setIsZoomed(false);
              }}
              className={`relative aspect-square rounded-md overflow-hidden transition-all ${index === selectedImageIndex
                  ? 'ring-2 ring-blue-500 ring-offset-2'
                  : 'ring-1 ring-gray-200 hover:ring-gray-400'
                }`}
            >
              <Image
                src={image.url}
                alt={image.altText || `${product.title} - Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 25vw, 12vw"
              />
            </button>
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <p className="text-center text-sm text-gray-500">
          {selectedImageIndex + 1} / {images.length}
        </p>
      )}
    </div>
  );
}
