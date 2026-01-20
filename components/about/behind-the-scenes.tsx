'use client';

import { useState } from 'react';
import Image from 'next/image';
import Modal from '@/components/ui/modal';

interface GalleryImage {
    src: string;
    alt: string;
    caption: string;
}

const galleryImages: GalleryImage[] = [
    {
        src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
        alt: 'Hands dipping fabric into vibrant tie-dye colors',
        caption: 'Creating our signature spiral tie-dye patterns',
    },
    {
        src: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&h=400&fit=crop',
        alt: 'Leather craftsman hand-stitching a wallet',
        caption: 'Hand-stitching premium leather goods',
    },
    {
        src: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=400&fit=crop',
        alt: 'Jeweler working on delicate gold chain',
        caption: 'Crafting delicate jewelry pieces',
    },
    {
        src: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=400&fit=crop',
        alt: 'Artist painting on canvas in studio',
        caption: 'Original artwork in progress',
    },
    {
        src: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&h=400&fit=crop',
        alt: 'Artisan workshop with tools and materials',
        caption: 'Our artisan workshop space',
    },
    {
        src: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=400&fit=crop',
        alt: 'Colorful finished textiles hanging to dry',
        caption: 'Finished tie-dye textiles drying naturally',
    },
];

export default function BehindTheScenes() {
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

    return (
        <section className="bg-white py-16 lg:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <span className="text-primary-600 font-medium text-sm uppercase tracking-wider">
                        The Workshop
                    </span>
                    <h2 className="mt-3 text-3xl font-bold text-neutral-900 sm:text-4xl">
                        Behind the Scenes
                    </h2>
                    <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
                        Take a peek inside our artisan workshops where creativity and
                        craftsmanship come together.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {galleryImages.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedImage(image)}
                            className="group relative aspect-[3/2] overflow-hidden rounded-xl bg-neutral-200 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                            aria-label={`View larger: ${image.alt}`}
                        >
                            <Image
                                src={image.src}
                                alt={image.alt}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <p className="absolute bottom-4 left-4 right-4 text-white text-sm font-medium">
                                    {image.caption}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Lightbox Modal */}
            <Modal
                isOpen={selectedImage !== null}
                onClose={() => setSelectedImage(null)}
                title={selectedImage?.caption || 'Gallery Image'}
            >
                {selectedImage && (
                    <div className="space-y-4">
                        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg bg-neutral-200">
                            <Image
                                src={selectedImage.src.replace('w=600', 'w=1200').replace('h=400', 'h=800')}
                                alt={selectedImage.alt}
                                fill
                                className="object-contain"
                                sizes="(max-width: 1024px) 100vw, 1024px"
                            />
                        </div>
                        <p className="text-neutral-600 text-center">{selectedImage.caption}</p>
                    </div>
                )}
            </Modal>
        </section>
    );
}
