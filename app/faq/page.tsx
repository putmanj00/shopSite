import type { Metadata } from 'next';
import Image from 'next/image';
import { FaqPageContent } from '@/components/faq/faq-page-content';
import { faqItems } from '@/data/faq-data';
import { buildFaqPageSchema } from '@/lib/structured-data';

export const metadata: Metadata = {
    title: 'FAQ | Wildenflower',
    description: 'Everything you might want to know about Wildenflower — from our handmade products to shipping and returns.',
};

export default function FAQPage() {
    const faqSchema = buildFaqPageSchema(
        faqItems.map((item) => ({ question: item.question, answer: item.answer }))
    );

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            {/* Hero */}
            <section className="relative bg-forest text-white overflow-visible">
                <div className="absolute inset-0 overflow-hidden">
                    <Image
                        src="/assets/images/headers/botanical-header-faq.png"
                        alt="Botanical illustration"
                        fill
                        className="object-cover opacity-40"
                        priority
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-forest/60 to-forest/90" />
                </div>
                <div className="relative container mx-auto px-4 py-24 lg:py-32">
                    <div className="max-w-3xl">
                        <span className="text-gold font-medium text-sm uppercase tracking-wider">
                            Help Center
                        </span>
                        <h1 className="mt-4 text-4xl font-bold font-heading sm:text-5xl lg:text-6xl leading-tight">
                            Frequently Asked Questions
                        </h1>
                        <p className="mt-6 text-xl text-parchment/80 leading-relaxed">
                            Everything you might want to know about Wildenflower — from our
                            handmade products to shipping and returns.
                        </p>
                    </div>
                </div>
                <div className="absolute -bottom-px left-0 right-0 z-10">
                    <svg
                        viewBox="0 0 1440 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full h-auto block"
                        aria-hidden="true"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M0 60V30C360 0 720 0 1080 30C1260 45 1380 52.5 1440 60V60H0Z"
                            fill="currentColor"
                            className="text-parchment"
                        />
                    </svg>
                </div>
            </section>

            <FaqPageContent />
        </>
    );
}
