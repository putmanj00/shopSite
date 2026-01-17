'use client';

import { useState, useRef, useEffect } from 'react';

export default function VideoShowcase() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

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

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleVideoEnd = () => {
        setIsPlaying(false);
    };

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
                                <video
                                    ref={videoRef}
                                    className="w-full h-full object-cover"
                                    poster="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1280&h=720&fit=crop"
                                    onEnded={handleVideoEnd}
                                    playsInline
                                    preload="metadata"
                                >
                                    {/* Placeholder video source - replace with actual video */}
                                    <source
                                        src="/videos/artisan-process.mp4"
                                        type="video/mp4"
                                    />
                                    {/* WebVTT captions track */}
                                    <track
                                        kind="captions"
                                        src="/videos/artisan-process.vtt"
                                        srcLang="en"
                                        label="English"
                                        default
                                    />
                                    Your browser does not support the video tag.
                                </video>

                                {/* Play/Pause overlay button */}
                                {!isPlaying && (
                                    <button
                                        onClick={togglePlay}
                                        className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
                                        aria-label="Play video: Watch the creation process"
                                    >
                                        <span className="flex items-center justify-center w-20 h-20 rounded-full bg-amber-500 group-hover:bg-amber-400 transition-colors shadow-lg">
                                            <svg
                                                className="w-8 h-8 text-white ml-1"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </span>
                                    </button>
                                )}

                                {/* Pause button when playing */}
                                {isPlaying && (
                                    <button
                                        onClick={togglePlay}
                                        className="absolute bottom-4 right-4 flex items-center justify-center w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                                        aria-label="Pause video"
                                    >
                                        <svg
                                            className="w-6 h-6 text-white"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                        </svg>
                                    </button>
                                )}
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
