import type { Metadata } from 'next';
import { BotanicalHeader } from '@/components/ui/botanical-header';
import { FaqPageContent } from '@/components/faq/faq-page-content';

export const metadata: Metadata = {
    title: 'FAQ | Wildenflower',
    description: 'Everything you might want to know about Wildenflower — from our handmade products to shipping and returns.',
};

export default function FAQPage() {
    return (
        <>
            <BotanicalHeader variant="faq" />
            <FaqPageContent />
        </>
    );
}
