'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { FaqAccordion } from '@/components/faq/faq-accordion';
import { faqItems, FAQ_CATEGORIES } from '@/data/faq-data';

export function FaqPageContent() {
    const [activeCategory, setActiveCategory] = useState<string>('All');

    const filteredItems = activeCategory === 'All'
        ? faqItems
        : faqItems.filter((item) => item.category === activeCategory);

    return (
        <>
            {/* Category Chips + Accordion */}
            <section className="bg-parchment py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    {/* Section header matching About page style */}
                    <div className="text-center mb-12">
                        <span className="text-terracotta font-medium text-sm uppercase tracking-wider">
                            Your Questions, Answered
                        </span>
                        <h2 className="mt-3 text-3xl font-bold text-ink-brown sm:text-4xl font-heading">
                            How Can We Help?
                        </h2>
                    </div>

                    <div className="max-w-3xl mx-auto">
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
                </div>
            </section>

            {/* Fallen Log Divider — matching About page */}
            <div className="w-full h-32 my-6 flex items-center justify-center mx-auto max-w-[1500px] relative">
                <Image
                    src="/assets/images/about/dividder-fallen-log-no-bg.png"
                    alt="Botanical divider - fallen log"
                    fill
                    sizes="(max-width: 1500px) 100vw, 1500px"
                    className="object-contain"
                />
            </div>

            {/* Still Curious? Contact Section */}
            <section className="bg-parchment py-16 lg:py-20">
                <div className="container mx-auto px-4 max-w-3xl text-center">
                    <h2 className="text-2xl font-bold font-heading text-ink-brown mb-2">Still curious?</h2>
                    <p className="text-earth mb-6">We&apos;d love to hear from you</p>
                    <Button href="/contact" variant="primary" className="font-medium">
                        Get in Touch
                    </Button>
                </div>
            </section>
        </>
    );
}
