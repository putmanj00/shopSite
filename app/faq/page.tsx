import type { Metadata } from 'next';
import { BotanicalHeader } from '@/components/ui/botanical-header';
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
            <BotanicalHeader variant="faq" />
            <FaqPageContent />
        </>
    );
}
