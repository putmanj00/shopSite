import Link from 'next/link';

// Deep Woods register (bg-woods-bg / text-woods-ink) — the one gated dark band on the
// homepage besides the hero. Copy tracks the adopted lifetime-repair terms published on
// /shipping-returns; keep the two in sync (repair of craftsmanship defects, we cover
// return shipping, repair-first, not a refund/replacement guarantee).
export default function RepairPromise() {
  return (
    <section className="bg-woods-bg text-woods-ink py-16 lg:py-24">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <span className="catalog-label text-gold">
          Made to Be Kept
        </span>
        <h2 className="mt-4 text-3xl font-bold sm:text-4xl font-heading">
          Broken thread, lifted dye, a seam that gives?{' '}
          <span className="text-gold">We repair it.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-woods-ink/85 text-lg leading-relaxed">
          Every handmade leather, tie-dye, and jewelry piece carries a lifetime repair on its
          craftsmanship. Send us photos and your order number, and we&apos;ll fix the piece and
          cover the return shipping back to you.
        </p>
        <p className="mx-auto mt-3 max-w-xl text-woods-ink/60 text-sm">
          A repair promise, not a refund guarantee — we always try to repair first. Normal wear,
          accidents, and one-of-a-kind dye variation aren&apos;t covered.
        </p>
        <Link
          href="/shipping-returns"
          className="mt-8 inline-flex items-center gap-2 border-b border-gold/70 pb-1 text-gold font-medium transition-colors hover:text-gold/80 group"
        >
          Read the full promise
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
