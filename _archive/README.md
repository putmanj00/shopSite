# _archive

Dead code parked here instead of deleted, for reversibility. **Nothing in this
folder is built, imported, typechecked, or linted** — excluded in `tsconfig.json`
(`exclude`) and `eslint.config.mjs` (ignores). Not under `app/`, so never routed.

Restore: `git mv _archive/<path> <original path>` and drop the exclude entries.
Delete for real only once we're sure (per James, 2026-06-14).

## Contents

| File | Original path | Archived | Why |
|------|---------------|----------|-----|
| `components/hero.tsx` | `components/hero.tsx` | 2026-06-14 | Orphan. Generic dark-zinc dropship template ("Discover Your Perfect Style / premium products… delivered to your door"). Not imported by `app/page.tsx` (which uses `EnhancedHero`). Banned generic-dropship voice per `AGENTS.md`. Flagged in `docs/c2-corpus-gap-analysis-2026-06.md` §6. |
| `components/homepage/testimonial-carousel.tsx` | `components/homepage/testimonial-carousel.tsx` | 2026-06-14 | Orphan. Defined but rendered nowhere (zero importers). Kept unrendered respects no-fake-testimonials rule; archived rather than left as live-looking dead code. C2 §6. |
