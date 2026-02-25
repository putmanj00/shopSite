'use client';

import Link from 'next/link';

interface ComingSoonProps {
    title: string;
    description?: string;
    expectedDate?: string;
}

export default function ComingSoon({
    title,
    description = "We're crafting something special for you. Check back soon!",
}: ComingSoonProps) {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-parchment">
            <div className="max-w-md text-center">
                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-sage/20 text-terracotta">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold text-ink-brown font-heading mb-4">
                    {title}
                </h1>

                <p className="text-lg text-earth mb-8 leading-relaxed">
                    {description}
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-terracotta hover:bg-terracotta/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
}
