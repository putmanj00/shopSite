'use client';

import Script from 'next/script';

interface AnalyticsProps {
    gaId?: string;
    fbPixelId?: string;
}

export default function Analytics({ gaId, fbPixelId }: AnalyticsProps) {
    const GA_ID = gaId || process.env.NEXT_PUBLIC_GA_ID;
    const FB_PIXEL_ID = fbPixelId || process.env.NEXT_PUBLIC_FB_PIXEL_ID;

    return (
        <>
            {/* Google Analytics 4 */}
            {GA_ID && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                        strategy="afterInteractive"
                    />
                    <Script id="ga4-init" strategy="afterInteractive">
                        {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', {
                page_path: window.location.pathname,
              });
            `}
                    </Script>
                </>
            )}

            {/* Facebook Pixel */}
            {FB_PIXEL_ID && (
                <Script id="fb-pixel-init" strategy="afterInteractive">
                    {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
                </Script>
            )}
        </>
    );
}

// Helper functions for tracking events
export function trackGAEvent(action: string, category: string, label?: string, value?: number) {
    if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as typeof window & { gtag: (...args: unknown[]) => void }).gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    }
}

export function trackFBEvent(eventName: string, params?: Record<string, unknown>) {
    if (typeof window !== 'undefined' && 'fbq' in window) {
        (window as typeof window & { fbq: (...args: unknown[]) => void }).fbq('track', eventName, params);
    }
}

// E-commerce tracking helpers
export function trackAddToCart(item: {
    id: string;
    name: string;
    price: number;
    currency?: string;
    quantity?: number;
}) {
    // GA4
    trackGAEvent('add_to_cart', 'ecommerce', item.name, item.price);

    // Facebook Pixel
    trackFBEvent('AddToCart', {
        content_ids: [item.id],
        content_name: item.name,
        content_type: 'product',
        value: item.price,
        currency: item.currency || 'USD',
    });
}

export function trackPurchase(transaction: {
    id: string;
    revenue: number;
    currency?: string;
    items: { id: string; name: string; price: number; quantity: number }[];
}) {
    // GA4
    if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as typeof window & { gtag: (...args: unknown[]) => void }).gtag('event', 'purchase', {
            transaction_id: transaction.id,
            value: transaction.revenue,
            currency: transaction.currency || 'USD',
            items: transaction.items.map((item) => ({
                item_id: item.id,
                item_name: item.name,
                price: item.price,
                quantity: item.quantity,
            })),
        });
    }

    // Facebook Pixel
    trackFBEvent('Purchase', {
        content_ids: transaction.items.map((item) => item.id),
        content_type: 'product',
        value: transaction.revenue,
        currency: transaction.currency || 'USD',
        num_items: transaction.items.length,
    });
}

export function trackViewContent(product: {
    id: string;
    name: string;
    price: number;
    currency?: string;
    category?: string;
}) {
    // GA4
    if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as typeof window & { gtag: (...args: unknown[]) => void }).gtag('event', 'view_item', {
            currency: product.currency || 'USD',
            value: product.price,
            items: [
                {
                    item_id: product.id,
                    item_name: product.name,
                    price: product.price,
                    item_category: product.category,
                },
            ],
        });
    }

    // Facebook Pixel
    trackFBEvent('ViewContent', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: product.price,
        currency: product.currency || 'USD',
    });
}
