import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LegalLayout from '@/components/ui/legal-layout';

const legalPages = {
    'privacy-policy': {
        title: 'Privacy Policy',
        description: 'How Wildenflower collects and protects your information.',
    },
    'terms-of-service': {
        title: 'Terms of Service',
        description: 'Terms governing use of the Wildenflower store.',
    },
    'refund-policy': {
        title: 'Artisan Guarantee & Returns',
        description: 'Wildenflower refund and return policy — 14-day window, handmade item guidelines.',
    },
} as const;

type Slug = keyof typeof legalPages;

export function generateStaticParams() {
    return Object.keys(legalPages).map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const page = legalPages[slug as Slug];
    if (!page) return { title: 'Not Found' };
    return {
        title: page.title,
        description: page.description,
        openGraph: {
            title: `${page.title} | Wildenflower`,
            description: page.description,
        },
    };
}

export default async function LegalPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    if (!legalPages[slug as Slug]) notFound();

    const { default: Content } = await import(`@/content/legal/${slug}.mdx`);

    return (
        <LegalLayout>
            <Content />
        </LegalLayout>
    );
}
