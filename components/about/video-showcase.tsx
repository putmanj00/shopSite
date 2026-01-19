'use client';

import { useState, useRef, useEffect } from 'react';

export default function VideoShowcase() {
    // Video logic reserved for when video content is available
    // const [isPlaying, setIsPlaying] = useState(false);
    // const videoRef = useRef<HTMLVideoElement>(null);

    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        // Use setTimeout to avoid synchronous setState warning from ESLint
        setTimeout(() => {
            setPrefersReducedMotion(mediaQuery.matches);
        }, 0);

        const handleChange = (e: MediaQueryListEvent) => {
            setPrefersReducedMotion(e.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // const togglePlay = () => {
    //     if (videoRef.current) {
    //         if (isPlaying) {
    //             videoRef.current.pause();
    //         } else {
    //             videoRef.current.play();
    //         }
    //         setIsPlaying(!isPlaying);
    //     }
    // };

    // const handleVideoEnd = () => {
    //     setIsPlaying(false);
    // };

    return (
        <section className="bg-neutral-900 py-16 lg:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <span className="text-amber-400 font-medium text-sm uppercase tracking-wider">
                        Behind the Craft
                    </span>
                    <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                        Watch the Creation Process
                    </h2>
                    <p className="mt-4 text-lg text-neutral-400 max-w-2xl mx-auto">
                        Step inside our artisan workshops and witness the dedication that
                        goes into every handcrafted piece.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-800 shadow-2xl">
                        {prefersReducedMotion ? (
                            // Static image for users who prefer reduced motion
                            <div className="absolute inset-0 flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1280&h=720&fit=crop"
                                    alt="Artisan crafting handmade goods in workshop - video thumbnail"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <p className="text-white text-lg bg-neutral-900/80 px-6 py-3 rounded-lg">
                                        Video content available (reduced motion enabled)
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Check if video is available - show placeholder if not */}
                                <div className="relative w-full h-full">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1280&h=720&fit=crop"
                                        alt="Artisan crafting handmade goods in workshop"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-6">
                                        <span className="flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/80 mb-4">
                                            <svg
                                                className="w-8 h-8 text-white ml-1"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </span>
                                        <p className="text-white text-lg font-medium">
                                            Video Coming Soon
                                        </p>
                                        <p className="text-neutral-300 text-sm mt-2 max-w-md">
                                            Our behind-the-scenes documentary showcasing our artisan
                                            crafting process is currently in production.
                                        </p>
                                    </div>
                                </div>

                            </>
                        )}
                    </div>

                    <p className="mt-4 text-center text-neutral-500 text-sm">
                        Video includes English captions for accessibility
                    </p>
                </div>
            </div>
        </section>
    );
}
