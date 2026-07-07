import { getProductReviewWidget } from '@/lib/judgeme';
import ReviewSubmitForm from './review-submit-form';

interface JudgemeReviewsProps {
  handle: string;
  productTitle: string;
}

/**
 * Product reviews (Path C). Server-renders Judge.me's own widget HTML as inert
 * markup when reviews exist; otherwise shows an honest brand zero-state. The
 * brand-native submit form is always available. No Judge.me JavaScript loads.
 */
export default async function JudgemeReviews({ handle, productTitle }: JudgemeReviewsProps) {
  const { html, externalId } = await getProductReviewWidget(handle);
  const hasReviews = Boolean(html);

  return (
    <section aria-labelledby="reviews-heading" className="space-y-6">
      <div>
        <span className="catalog-label text-gold-ink">Field notes</span>
        <h2 id="reviews-heading" className="mt-2 text-2xl font-bold text-ink-brown">
          Reviews
        </h2>
      </div>

      {hasReviews ? (
        <>
          {/*
            Judge.me's public widget CSS (icon-font stars embedded as data:, so
            no external font host). Loaded only when there is something to show.
            Next hoists and dedupes this <link>.
          */}
          <link rel="stylesheet" href="https://cdn.judge.me/judgeme_widget_v2.css" />
          {/*
            Judge.me returns server-sanitized HTML; we only strip its self-hiding
            <style> (see lib/judgeme.ts) before rendering it inert.
          */}
          <div className="wf-judgeme" dangerouslySetInnerHTML={{ __html: html as string }} />
        </>
      ) : (
        <p className="max-w-prose text-ink-brown/80">
          Not yet reviewed — this entry is new to the journal. Anyone can leave the first
          note; no account needed.
        </p>
      )}

      <ReviewSubmitForm handle={handle} externalId={externalId} productTitle={productTitle} />
    </section>
  );
}
