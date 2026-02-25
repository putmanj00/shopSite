'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaqAccordion } from '@/components/faq/faq-accordion';
import { faqItems, FAQ_CATEGORIES } from '@/data/faq-data';

export function FaqPageContent() {
    const [activeCategory, setActiveCategory] = useState<string>('All');

    const filteredItems = activeCategory === 'All'
        ? faqItems
        : faqItems.filter((item) => item.category === activeCategory);

    return (
        <>
            {/* Hero */}
            <section className="bg-parchment py-16 lg:py-20">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <span className="text-terracotta font-medium text-sm uppercase tracking-wider">
                        Help Center
                    </span>
                    <h1 className="mt-3 text-4xl font-bold font-heading text-ink-brown sm:text-5xl">
                        Frequently Asked Questions
                    </h1>
                    <p className="mt-4 text-lg text-earth max-w-2xl mx-auto">
                        Everything you might want to know about Wildenflower — from our
                        handmade products to shipping and returns.
                    </p>
                </div>
            </section>

            {/* Category Chips + Accordion */}
            <section className="bg-white py-12 lg:py-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    {/* Category Filter Chips */}
                    <div className="flex flex-wrap justify-center gap-2 mb-10">
                        {FAQ_CATEGORIES.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === category
                                    ? 'bg-forest text-parchment'
                                    : 'bg-parchment text-ink-brown border border-gold/30 hover:border-forest hover:text-forest'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Accordion */}
                    <FaqAccordion items={filteredItems} />
                </div>
            </section>

            {/* Still Curious? Contact Section */}
            <section className="bg-parchment py-16 lg:py-20">
                <div className="container mx-auto px-4 max-w-3xl text-center">
                    <div className="relative w-full mb-8 max-w-md mx-auto" style={{ aspectRatio: '1170/400' }}>
                        <Image
                            src="/assets/images/faq/faq-contact-border.png"
                            alt="Decorative botanical border"
                            fill
                            sizes="(max-width: 768px) 100vw, 480px"
                            className="object-contain"
                        />
                    </div>
                    <h2 className="text-2xl font-bold font-heading text-ink-brown mb-2">Still curious?</h2>
                    <p className="text-earth mb-6">We&apos;d love to hear from you</p>
                    <Link
                        href="/contact"
                        className="inline-block px-6 py-3 bg-terracotta text-white rounded-lg font-medium hover:bg-terracotta/90 transition-colors"
                    >
                        Get in Touch
                    </Link>
                </div>
            </section>
        </>
    );
}
