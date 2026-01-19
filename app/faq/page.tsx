import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Frequently Asked Questions | Artisan Collective',
    description: 'Find answers to common questions about our handmade products, shipping, returns, and artisan craftsmanship.',
    openGraph: {
        title: 'FAQ | Artisan Collective',
        description: 'Find answers to common questions about our handmade products, shipping, returns, and artisan craftsmanship.',
    },
};

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: 'How are your products made?',
        answer: 'All our products are handcrafted by skilled artisans using traditional techniques passed down through generations. Each piece is made with care and attention to detail, ensuring uniqueness and quality.',
    },
    {
        question: 'What materials do you use?',
        answer: 'We use only premium, ethically sourced materials. Our leather goods feature full-grain leather, jewelry uses recycled metals and responsibly sourced stones, and our tie-dye apparel is made from organic cotton with eco-friendly dyes.',
    },
    {
        question: 'How long does shipping take?',
        answer: 'Standard shipping typically takes 5-7 business days within the US. Express shipping (2-3 business days) is available for an additional fee. International shipping varies by destination, usually 10-21 business days.',
    },
    {
        question: 'What is your return policy?',
        answer: 'We offer a 30-day return policy for unused items in original condition. Custom or personalized items cannot be returned. Please see our full Returns Policy for details.',
    },
    {
        question: 'Are your products sustainable?',
        answer: 'Sustainability is core to our mission. We use recycled and eco-friendly materials whenever possible, work with artisans who use low-waste techniques, and ship in recyclable packaging.',
    },
    {
        question: 'Can I request custom orders?',
        answer: 'Yes! Many of our artisans accept custom orders. Contact us with your request and we will connect you with the right maker. Custom orders typically take 2-4 weeks.',
    },
    {
        question: 'How do I care for my handmade items?',
        answer: 'Each product type has specific care instructions. Leather goods should be conditioned regularly, tie-dye items should be washed cold inside-out, and jewelry should be stored in a cool, dry place. Check the product page for detailed care guides.',
    },
    {
        question: 'Do you offer gift wrapping?',
        answer: 'Yes! We offer complimentary gift wrapping on all orders. You can add a personalized gift message at checkout. Our packaging is eco-friendly and beautifully designed.',
    },
];

export default function FAQPage() {
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    return (
        <div className="bg-white min-h-screen">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16 md:py-24">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                        Everything you need to know about our handcrafted products, ordering process, and artisan community.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-3xl py-16">
                <div className="space-y-6">
                    {faqs.map((faq, index) => (
                        <details
                            key={index}
                            className="group bg-gray-50 rounded-xl overflow-hidden border border-gray-100"
                        >
                            <summary className="flex items-center justify-between p-6 cursor-pointer list-none hover:bg-gray-100 transition-colors">
                                <h2 className="text-lg font-semibold text-gray-900 pr-4">
                                    {faq.question}
                                </h2>
                                <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-primary-100 text-primary-600 group-open:rotate-45 transition-transform">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </span>
                            </summary>
                            <div className="px-6 pb-6">
                                <p className="text-gray-600 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        </details>
                    ))}
                </div>

                <div className="mt-16 text-center bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        Still have questions?
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Our team is here to help. Reach out and we&apos;ll get back to you within 24 hours.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Contact Us
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}
