# Phase 16: Legal Pages & SEO Metadata - Context

**Gathered:** 2026-02-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Add three legal policy pages (Privacy Policy, Terms of Service, Refund Policy) reachable from a new "Legal" footer column, and implement Open Graph meta tags on all public pages, a dynamic `/sitemap.xml`, and a `/robots.txt`. Every public page must be correctly described to search engines and social platforms. Shopify integration and checkout flow are untouched.

</domain>

<decisions>
## Implementation Decisions

### Legal page content
- MDX files in `/content/legal/` directory: `privacy-policy.mdx`, `terms-of-service.mdx`, `refund-policy.mdx`
- Each file includes frontmatter with a `last updated` date field
- Contact email for returns: `wildenflowercreations@gmail.com`
- All three policy drafts are pre-written by the owner with Wildenflower voice:
  - **Refund Policy** ("Artisan Guarantee & Returns"): 14-day review window, items must be unworn/unwashed, one-of-a-kind disclaimer (variations are not defects), custom/Final Sale items excluded, customer pays return shipping unless item arrived damaged
  - **Privacy Policy** ("Your Privacy is Sacred"): collects checkout data only, no CC storage, "Trippy Tribe" newsletter is opt-in with easy unsubscribe, data shared only with essential service providers
  - **Terms of Service** ("The Fine Print"): "Lisa Frank Noir" aesthetic and designs are IP of Wildenflower, product color/texture accuracy disclaimer, no liability for carrier delays, governed by Kentucky law

### Legal page visual treatment
- Minimal prose layout — NOT fully branded with BotanicalHeader/dividers
- Parchment background (`bg-[#fdfaf5]`), Wildenflower serif fonts (Lora/Playfair Display), max-width prose container
- A `LegalLayout` component wraps MDX content: `max-w-3xl mx-auto prose prose-stone lg:prose-xl font-serif`
- Clean and readable; legal content does not need botanical decorations

### Footer placement
- New dedicated "Legal" column in the footer — separate from the existing "Support" column
- Column header: "Legal" (visible, consistent with other column headers)
- Links in order: Privacy Policy → Terms of Service → Refund Policy (exact standard labels)

### OG image strategy
- Default/fallback OG image: `public/assets/images/logo/logo-OG.png` (already exists — 1200×630)
- Used for: homepage, about, FAQ, blog, legal pages, and any page without a specific image
- Product pages: dynamically pull the primary product image from Shopify
- OG title format: `"Page/Product Name | Wildenflower"` (brand at the end)
- Default fallback OG description: `"Shop handcrafted jewelry, tie-dye clothing, and one-of-a-kind artisan goods at Wildenflower."`

### Sitemap implementation
- Dynamic Next.js route at `/app/sitemap.ts` (no next-sitemap package — use built-in Next.js 13+ API)
- Generates on-request, always fresh
- Include all public pages: `/`, `/products/*`, `/collections/*`, `/about`, `/faq`, `/blog/*`
- Legal pages (`/legal/*`) can be included too
- Product pages include `lastmod` date (from Shopify updatedAt) and `priority: 0.8`
- Static pages (about, FAQ) get `priority: 0.5`

### robots.txt
- Implemented as a static `/public/robots.txt` or dynamic `/app/robots.ts`
- Allow: `/`, `/products/`, `/collections/`, `/about`, `/faq`, `/blog`
- Disallow: `/api/`, `/admin/`, `/checkout`, `/cart`, `/account`

### Claude's Discretion
- Exact Tailwind class details on LegalLayout beyond the specified parchment/prose pattern
- How to wire Shopify `updatedAt` into sitemap `lastmod` (implementation detail)
- Whether to use `/app/robots.ts` dynamic route or static `/public/robots.txt`

</decisions>

<specifics>
## Specific Ideas

- Policies use Wildenflower voice throughout — phrases like "your treasures," "Trippy Tribe," "Lisa Frank Noir aesthetic," "Made by hand. Found by heart."
- The LegalLayout component was specifically sketched by the owner: `<div className="bg-[#fdfaf5] min-h-screen py-20 px-6"><article className="max-w-3xl mx-auto prose prose-stone lg:prose-xl font-serif">{children}</article></div>`
- OG image already created and committed: `public/assets/images/logo/logo-OG.png`
- Kentucky is the governing jurisdiction (ToS)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 16-legal-pages-seo-metadata*
*Context gathered: 2026-02-27*
