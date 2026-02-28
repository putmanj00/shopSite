# Phase 16: Legal Pages & SEO Metadata - Research

**Researched:** 2026-02-27
**Domain:** Next.js 16 App Router — MDX legal content, metadata API (OG), sitemap.ts, robots.ts, footer links
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Legal page content**
- MDX files in `/content/legal/` directory: `privacy-policy.mdx`, `terms-of-service.mdx`, `refund-policy.mdx`
- Each file includes frontmatter with a `last updated` date field
- Contact email for returns: `wildenflowercreations@gmail.com`
- All three policy drafts are pre-written by the owner with Wildenflower voice:
  - **Refund Policy** ("Artisan Guarantee & Returns"): 14-day review window, items must be unworn/unwashed, one-of-a-kind disclaimer (variations are not defects), custom/Final Sale items excluded, customer pays return shipping unless item arrived damaged
  - **Privacy Policy** ("Your Privacy is Sacred"): collects checkout data only, no CC storage, "Trippy Tribe" newsletter is opt-in with easy unsubscribe, data shared only with essential service providers
  - **Terms of Service** ("The Fine Print"): "Lisa Frank Noir" aesthetic and designs are IP of Wildenflower, product color/texture accuracy disclaimer, no liability for carrier delays, governed by Kentucky law

**Legal page visual treatment**
- Minimal prose layout — NOT fully branded with BotanicalHeader/dividers
- Parchment background (`bg-[#fdfaf5]`), Wildenflower serif fonts (Lora/Playfair Display), max-width prose container
- A `LegalLayout` component wraps MDX content: `max-w-3xl mx-auto prose prose-stone lg:prose-xl font-serif`
- Clean and readable; legal content does not need botanical decorations

**Footer placement**
- New dedicated "Legal" column in the footer — separate from the existing "Support" column
- Column header: "Legal" (visible, consistent with other column headers)
- Links in order: Privacy Policy → Terms of Service → Refund Policy (exact standard labels)

**OG image strategy**
- Default/fallback OG image: `public/assets/images/logo/logo-OG.png` (already exists — 1200×630)
- Used for: homepage, about, FAQ, blog, legal pages, and any page without a specific image
- Product pages: dynamically pull the primary product image from Shopify
- OG title format: `"Page/Product Name | Wildenflower"` (brand at the end)
- Default fallback OG description: `"Shop handcrafted jewelry, tie-dye clothing, and one-of-a-kind artisan goods at Wildenflower."`

**Sitemap implementation**
- Dynamic Next.js route at `/app/sitemap.ts` (no next-sitemap package — use built-in Next.js 13+ API)
- Generates on-request, always fresh
- Include all public pages: `/`, `/products/*`, `/collections/*`, `/about`, `/faq`, `/blog/*`
- Legal pages (`/legal/*`) can be included too
- Product pages include `lastmod` date (from Shopify updatedAt) and `priority: 0.8`
- Static pages (about, FAQ) get `priority: 0.5`

**robots.txt**
- Implemented as a dynamic `/app/robots.ts` route
- Allow: `/`, `/products/`, `/collections/`, `/about`, `/faq`, `/blog`
- Disallow: `/api/`, `/admin/`, `/checkout`, `/cart`, `/account`

### Claude's Discretion
- Exact Tailwind class details on LegalLayout beyond the specified parchment/prose pattern
- How to wire Shopify `updatedAt` into sitemap `lastmod` (implementation detail)
- Whether to use `/app/robots.ts` dynamic route or static `/public/robots.txt`

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GDPR-03 | Privacy Policy page published and accessible from footer | MDX file at `/content/legal/privacy-policy.mdx`, route at `/app/legal/[slug]/page.tsx`, footer link updated |
| GDPR-04 | Terms of Service page published and accessible from footer | MDX file at `/content/legal/terms-of-service.mdx`, route at `/app/legal/[slug]/page.tsx`, footer link updated |
| GDPR-05 | Refund Policy page published and accessible from footer | MDX file at `/content/legal/refund-policy.mdx`, route at `/app/legal/[slug]/page.tsx`, footer link updated |
| SEO-02 | All public pages have Open Graph meta tags (title, description, image) | layout.tsx already has OG metadata; needs `images` field added with `/assets/images/logo/logo-OG.png`; product pages need brand name fix |
| SEO-03 | sitemap.xml is generated and includes product and collection pages | `/app/sitemap.ts` exists but needs: legal pages added, `updatedAt` wired into product lastmod |
| SEO-04 | robots.txt allows crawling of product/collection pages; blocks `/api/` and `/admin` | `/app/robots.ts` exists but needs `/admin/` added to disallow list |
</phase_requirements>

---

## Summary

This phase has a critical discovery: **significant infrastructure already exists**. The project has `app/robots.ts`, `app/sitemap.ts`, and legal pages at `app/privacy/page.tsx`, `app/terms/page.tsx`, and `app/shipping-returns/page.tsx`. The root `app/layout.tsx` already has robust `openGraph` metadata including `title`, `description`, `locale`, and `siteName` — but is missing the `images` field. The footer already has a "Legal" column with Privacy Policy and Terms of Service links.

What does NOT exist yet: (1) MDX infrastructure (`@next/mdx`, `mdx-components.tsx`, `next.config.ts` changes), (2) the `/content/legal/` directory and MDX files with Wildenflower voice, (3) the `/app/legal/[slug]/` dynamic route, (4) a `LegalLayout` component, (5) the Refund Policy page or footer link, (6) the OG image wired into layout metadata, (7) product page brand name fix (`shopSite` → `Wildenflower`), (8) legal pages in sitemap, and (9) `/admin/` in robots disallow.

The existing `/app/privacy/` and `/app/terms/` pages contain generic boilerplate content (not the owner's Wildenflower-voice copy). The plan must create the new `/legal/*` route structure and update the footer to point there. The old `/privacy` and `/terms` routes should be replaced or redirected to the new `/legal/privacy-policy` and `/legal/terms-of-service` URLs to avoid duplicate content.

**Primary recommendation:** Install `@next/mdx`, create the MDX content files with owner-authored copy, build the dynamic `/app/legal/[slug]/` route with `LegalLayout`, update footer links, wire OG image into layout.tsx, fix product page brand name, update sitemap.ts and robots.ts.

---

## Critical Discovery: Existing State vs. Required State

| Item | Current State | Required State |
|------|--------------|----------------|
| `/app/privacy/page.tsx` | Exists — generic boilerplate, `PageHero` layout | Replace content with owner copy or redirect to `/legal/privacy-policy` |
| `/app/terms/page.tsx` | Exists — generic boilerplate, `PageHero` layout | Replace content or redirect to `/legal/terms-of-service` |
| `/app/shipping-returns/page.tsx` | Exists — shipping table + returns | Separate from refund policy; keep as-is; new `/legal/refund-policy` for policy copy |
| `/app/robots.ts` | Exists — missing `/admin/` disallow | Add `/admin/` to disallow list |
| `/app/sitemap.ts` | Exists — missing legal pages, uses `new Date()` not `updatedAt` | Add `/legal/*`, wire `product.updatedAt` into `lastModified` |
| `app/layout.tsx` OG metadata | Has title/description but NO `images` field | Add `images: [{ url: '/assets/images/logo/logo-OG.png', width: 1200, height: 630, alt: '...' }]` |
| `app/products/[handle]/page.tsx` | Has OG but uses `title: '${product.title} | shopSite'` | Fix to `'${product.title} | Wildenflower'` |
| Footer Legal column | Has Privacy Policy + Terms links to `/privacy`, `/terms` | Update to `/legal/privacy-policy`, `/legal/terms-of-service`, add Refund Policy |
| `content/legal/` directory | Does not exist | Create with 3 MDX files |
| `app/legal/[slug]/page.tsx` | Does not exist | Create dynamic route |
| `components/ui/legal-layout.tsx` | Does not exist | Create `LegalLayout` component |
| `@next/mdx` package | Not installed | Install + configure |
| `mdx-components.tsx` | Does not exist | Create (required by @next/mdx with App Router) |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@next/mdx` | latest (^15 compat) | Transforms MDX files into React components | Official Next.js solution; no client JS needed in Server Components |
| `@mdx-js/loader` | latest | Webpack loader for MDX | Required peer dep of @next/mdx |
| `@mdx-js/react` | latest | React MDX context provider | Required peer dep of @next/mdx |
| `@types/mdx` | latest | TypeScript types for MDX imports | Required for TypeScript MDX imports |
| `next` (built-in) | 16.1.1 (already installed) | `MetadataRoute.Sitemap`, `MetadataRoute.Robots`, `generateMetadata` | Zero-dep sitemap/robots/OG — no extra packages |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `gray-matter` | (not needed) | Frontmatter parsing | NOT needed — @next/mdx supports `export const metadata` in MDX files for frontmatter-like data |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@next/mdx` dynamic import pattern | `next-mdx-remote` | next-mdx-remote handles remote/external MDX but is heavier; @next/mdx is preferred for local files |
| MDX files with `export const metadata` | `gray-matter` for frontmatter | @next/mdx doesn't parse YAML frontmatter natively; use exported JS object instead |
| MDX at `/app/legal/[slug]/` | MDX files directly in `/app/legal/privacy-policy/page.mdx` | Dynamic route is more maintainable; direct page.mdx works but requires pageExtensions config |

**Installation:**

```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react @types/mdx
```

---

## Architecture Patterns

### Recommended Project Structure

```
content/
└── legal/                          # MDX content files (owner-authored copy)
    ├── privacy-policy.mdx
    ├── terms-of-service.mdx
    └── refund-policy.mdx

app/
├── legal/
│   └── [slug]/
│       └── page.tsx                # Dynamic route: renders MDX for each policy
├── layout.tsx                      # Update: add OG images field
├── sitemap.ts                      # Update: add /legal/* routes, wire updatedAt
├── robots.ts                       # Update: add /admin/ to disallow
└── products/[handle]/page.tsx      # Update: fix brand name in metadata title

components/
└── ui/
    └── legal-layout.tsx            # New: LegalLayout wrapper component

components/
└── footer.tsx                      # Update: legal column links to /legal/*

mdx-components.tsx                  # New: required by @next/mdx, at project root
next.config.ts                      # Update: add MDX config
```

### Pattern 1: MDX Dynamic Import Route

**What:** Dynamic `app/legal/[slug]/page.tsx` that imports MDX files from `content/legal/` using dynamic import.
**When to use:** Three static policies served from one route — `generateStaticParams` pre-renders all three at build time.

```typescript
// Source: https://nextjs.org/docs/app/guides/mdx#using-dynamic-imports
// app/legal/[slug]/page.tsx
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
    description: 'Terms governing use of Wildenflower.',
  },
  'refund-policy': {
    title: 'Refund Policy',
    description: 'Artisan Guarantee & Returns at Wildenflower.',
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
      title: page.title,
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
```

### Pattern 2: MDX File Structure (no YAML frontmatter)

**What:** MDX files use exported JS objects instead of YAML frontmatter (because @next/mdx doesn't parse YAML by default). The `last updated` date is embedded as an export or directly in the MDX prose.
**When to use:** All three policy files.

```mdx
{/* content/legal/privacy-policy.mdx */}

# Your Privacy is Sacred

*Last updated: February 27, 2026*

When you shop at Wildenflower, your privacy is treated with the same care
we pour into every handcrafted piece...
```

Note: The `last updated` date in the CONTEXT.md frontmatter decision maps to an inline line in the MDX body — @next/mdx does not process YAML frontmatter without `remark-frontmatter`. The simpler approach is to write the date as italic text in the MDX, as shown above. This avoids adding another package.

### Pattern 3: LegalLayout Component

**What:** Thin layout wrapper that provides parchment background, serif font, prose container. Matches owner's exact spec.

```typescript
// Source: CONTEXT.md specifics + project Tailwind token conventions
// components/ui/legal-layout.tsx
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#fdfaf5] min-h-screen py-20 px-6">
      <article className="max-w-3xl mx-auto prose prose-stone lg:prose-xl font-serif">
        {children}
      </article>
    </div>
  );
}
```

Note: The project uses custom `.prose` CSS in `globals.css` (not `@tailwindcss/typography`). The `prose` class resolves via custom global styles already written. `prose-stone` and `lg:prose-xl` modifiers will only apply if the typography plugin is installed. Since it isn't, the plan must either: (a) install `@tailwindcss/typography` or (b) use the existing custom `.prose` class without modifiers. Research recommendation: use existing custom `.prose` class without plugin modifiers to avoid adding a dependency.

### Pattern 4: OG Image in Root Layout

**What:** The `metadataBase` is already set in `app/layout.tsx`. Adding the `images` array makes the OG image field resolve correctly for all pages that don't override it.

```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#opengraph
// app/layout.tsx — update the existing openGraph object
openGraph: {
  type: 'website',
  locale: 'en_US',
  url: 'https://wildenflower.com',
  siteName: 'Wildenflower',
  title: 'Wildenflower | Tie-Dye, Leather Goods, Jewelry & Art',
  description: 'Made by hand. Found by heart. ...',
  images: [
    {
      url: '/assets/images/logo/logo-OG.png',  // resolves via metadataBase
      width: 1200,
      height: 630,
      alt: 'Wildenflower — Made by hand. Found by heart.',
    },
  ],
},
```

Because `metadataBase` is set, the relative `/assets/...` path resolves to the full URL automatically.

### Pattern 5: Sitemap with Shopify updatedAt

**What:** Update `app/sitemap.ts` to use `product.updatedAt` for `lastModified` and add `/legal/*` routes.

The current `GET_ALL_PRODUCTS_HANDLES` query only fetches `handle`. To get `updatedAt`, a new helper or query variant is needed (or use the existing `GET_PRODUCTS_QUERY` which already fetches `updatedAt` in the `PRODUCT_FRAGMENT`).

```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
// Preferred approach: add a new getAllProductsWithUpdatedAt() helper
// that reuses the existing shopifyFetch infrastructure

// Option A (recommended): New dedicated sitemap query
export const GET_PRODUCTS_FOR_SITEMAP = `
  query getProductsForSitemap($first: Int!) {
    products(first: $first) {
      edges {
        node {
          handle
          updatedAt
        }
      }
    }
  }
`;

// Then in sitemap.ts:
const productRoutes = products.map((product) => ({
  url: `${baseUrl}/products/${product.handle}`,
  lastModified: new Date(product.updatedAt),
  changeFrequency: 'daily' as const,
  priority: 0.8,
}));
```

### Pattern 6: next.config.ts MDX Setup

**What:** The project uses `next.config.ts` (TypeScript, not .mjs). MDX setup works with `.ts` config files.

```typescript
// Source: https://nextjs.org/docs/app/guides/mdx
// next.config.ts
import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
```

### Anti-Patterns to Avoid

- **Using `gray-matter` for frontmatter:** @next/mdx does not parse YAML frontmatter without `remark-frontmatter`. Use exported JS objects or inline text instead. Avoids another dep.
- **Keeping old `/app/privacy/` and `/app/terms/` pages:** They will create duplicate content with new `/legal/` routes. Replace their content OR redirect them.
- **Forgetting `mdx-components.tsx` at root:** @next/mdx with App Router will fail to process MDX without this file. It is required.
- **Forgetting `dynamicParams = false`:** Without this, accessing an undefined `/legal/[slug]` returns 500 instead of 404.
- **Using prose-stone/lg:prose-xl without the typography plugin:** These Tailwind modifiers need `@tailwindcss/typography`. Since it's not installed, either install it or strip those modifiers.
- **Hardcoded sitemap `lastmod` with `new Date()`:** The existing sitemap uses `new Date()` for all routes — this tells crawlers everything changed every crawl. Product routes should use real `updatedAt`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sitemap XML generation | Custom XML template string | `MetadataRoute.Sitemap` via `app/sitemap.ts` | Built-in Next.js — handles XML encoding, correct namespace, caching headers |
| robots.txt | Static file in `/public` | `MetadataRoute.Robots` via `app/robots.ts` | Dynamic — reads `NEXT_PUBLIC_BASE_URL` env var, no hardcoded domain |
| MDX rendering | Custom markdown parser | `@next/mdx` dynamic import | Server Component — zero client JS, official support, no hydration cost |
| OG metadata tags | Manual `<meta>` in layout | Next.js `metadata` export / `generateMetadata` | Handles deduplication, inheritance, correct property names automatically |

**Key insight:** The project already has 90% of the infrastructure in place. The work is updating/extending existing files rather than building from scratch.

---

## Common Pitfalls

### Pitfall 1: Old Legal Page Routes Create Duplicate Content
**What goes wrong:** `/app/privacy/page.tsx` and `/app/terms/page.tsx` already exist. If new `/legal/privacy-policy` and `/legal/terms-of-service` are created without removing or redirecting the old ones, Google indexes both. The old pages also contain incorrect email (`wildenflowercreations@gmail.com`, `wildenflowercreations@gmail.com` instead of `wildenflowercreations@gmail.com`).
**Why it happens:** The existing pages were created in a prior phase without awareness of this phase's plan.
**How to avoid:** In the plan, explicitly delete or redirect old legal page routes. Either remove the `app/privacy/` and `app/terms/` directories, or convert them to Next.js `redirect()` responses pointing to `/legal/privacy-policy` and `/legal/terms-of-service`.
**Warning signs:** Two pages with similar title metadata appearing in Google Search Console.

### Pitfall 2: prose-stone/lg:prose-xl Without Typography Plugin
**What goes wrong:** The CONTEXT.md LegalLayout spec includes `prose-stone lg:prose-xl` — these are `@tailwindcss/typography` modifiers. Without the plugin installed, these classes have no effect. The layout will render but won't have the refined type scale intended.
**Why it happens:** The project uses custom `.prose` CSS in globals.css, not the plugin.
**How to avoid:** Either (a) install `@tailwindcss/typography` and configure it for Tailwind 4, or (b) strip plugin-specific modifiers and rely on the existing custom `.prose` CSS.
**Warning signs:** Layout renders but headings and text scale look like plain unstyled HTML.

### Pitfall 3: Missing mdx-components.tsx Causes Build Failure
**What goes wrong:** @next/mdx with App Router requires `mdx-components.tsx` at the project root. Without it, the build fails with an unhelpful error.
**Why it happens:** This is a strict requirement per the official Next.js MDX guide.
**How to avoid:** Create `mdx-components.tsx` as first step of MDX setup.
**Warning signs:** Build error referencing mdx-components.

### Pitfall 4: Product Page Title Has Wrong Brand Name
**What goes wrong:** `app/products/[handle]/page.tsx` generates `title: '${product.title} | shopSite'` — the development placeholder brand name was never updated to "Wildenflower". This is the current production bug.
**Why it happens:** The file was scaffolded with a generic name.
**How to avoid:** Fix in this phase as part of SEO-02 work.
**Warning signs:** Browser tab shows "Ring | shopSite" instead of "Ring | Wildenflower".

### Pitfall 5: Sitemap Triggers Shopify API Calls on Every Request
**What goes wrong:** The sitemap is not cached — every `/sitemap.xml` request triggers Shopify API calls for all product and collection handles. Under high crawl pressure, this could exhaust rate limits.
**Why it happens:** Next.js sitemap routes are cached by default unless a Dynamic API is used, but `async` + Shopify fetch may disable caching.
**How to avoid:** Add `export const revalidate = 3600` (1-hour cache) to `app/sitemap.ts` so Vercel caches the sitemap and only revalidates hourly.
**Warning signs:** Shopify API rate limit errors in logs during high-traffic periods.

### Pitfall 6: Footer Links Point to Old URLs
**What goes wrong:** The footer currently links `Privacy Policy` → `/privacy` and `Terms of Service` → `/terms`. After creating `/legal/*` routes, the footer must be updated. If old pages are removed without updating the footer first, clicking those links will 404.
**Why it happens:** Sequential execution risk — if footer update is a separate task that runs after old page removal.
**How to avoid:** Update footer links in the same task as adding the new `/legal/[slug]` route, before removing old pages.

---

## Code Examples

### Complete robots.ts Update

```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
// app/robots.ts — current file missing /admin/ disallow
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wildenflower.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account/', '/cart', '/checkout', '/api/', '/admin/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

### Footer Legal Column Update (snippet)

```typescript
// components/footer.tsx — update footerLinks.legal array
const footerLinks = {
  // ...
  legal: [
    { name: 'Privacy Policy', href: '/legal/privacy-policy' },
    { name: 'Terms of Service', href: '/legal/terms-of-service' },
    { name: 'Refund Policy', href: '/legal/refund-policy' },
  ],
};
```

### mdx-components.tsx (Required)

```typescript
// mdx-components.tsx — project root, required by @next/mdx
import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  };
}
```

### Sitemap with Legal Pages and updatedAt

```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
// app/sitemap.ts — updated version
import { MetadataRoute } from 'next';
import { blogPosts } from '@/data/blog-posts';

export const revalidate = 3600; // Cache sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wildenflower.com';

  // Static routes
  const staticRoutes = [
    { url: `${baseUrl}`, priority: 1.0, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/about`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/faq`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/blog`, priority: 0.6, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/collections/all`, priority: 0.8, changeFrequency: 'weekly' as const },
  ].map((r) => ({ ...r, lastModified: new Date() }));

  // Legal pages
  const legalRoutes = ['privacy-policy', 'terms-of-service', 'refund-policy'].map((slug) => ({
    url: `${baseUrl}/legal/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  }));

  // Products with real updatedAt
  const { shopifyFetch } = await import('@/lib/shopify');
  // ... fetch products with updatedAt field
  // Use new GET_PRODUCTS_FOR_SITEMAP query

  // Collections
  // ... existing collection logic

  // Blog posts
  const blogRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...legalRoutes, /* productRoutes, collectionRoutes, */ ...blogRoutes];
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `next-sitemap` package | Built-in `app/sitemap.ts` with `MetadataRoute.Sitemap` | Next.js 13.3 | No extra package; native TypeScript types |
| Manual `<meta>` OG tags in `_document` | `metadata` export in `layout.tsx` / `generateMetadata` in pages | Next.js 13.2 | Cascades/inherits correctly; deduplication automatic |
| Static `/public/robots.txt` | Dynamic `app/robots.ts` with `MetadataRoute.Robots` | Next.js 13.3 | Reads env vars; correct response headers |
| `next-mdx-remote` for MDX pages | `@next/mdx` with dynamic import | ~2024 | Server Component only; zero client JS |

**Deprecated/outdated:**
- `next-sitemap` package: redundant with built-in Next.js sitemap support
- `_document.tsx` manual `<meta>` tags: replaced by metadata API
- `themeColor` in metadata object: deprecated Next.js 14+, moved to `viewport` export (project already uses `viewport` export correctly)

---

## Open Questions

1. **Should old `/app/privacy/` and `/app/terms/` pages be deleted or redirected?**
   - What we know: They exist with generic content; new routes will be at `/legal/*`
   - What's unclear: Whether any external links already point to `/privacy` or `/terms`
   - Recommendation: Delete the old page files entirely (the routes are new, no SEO value to preserve since content was generic boilerplate); or add `redirect('/legal/privacy-policy', 308)` as the page content if conservative approach preferred.

2. **Does the @tailwindcss/typography plugin need to be installed?**
   - What we know: Project uses custom `.prose` CSS in globals.css; plugin modifiers (`prose-stone`, `lg:prose-xl`) won't work without the plugin
   - What's unclear: Whether owner noticed this in their LegalLayout sketch or expected the plugin
   - Recommendation: Install `@tailwindcss/typography` — it's a standard part of any Tailwind + prose content setup. The `prose` class in the existing legal pages was written expecting it (the file says `prose prose-lg prose-slate`). Tailwind 4 requires the plugin as a CSS import, not a JS config plugin.

3. **How to handle `@tailwindcss/typography` with Tailwind 4?**
   - What we know: The project uses Tailwind 4 (`tailwindcss@^4`). In Tailwind 4, plugins are added via CSS `@plugin` directive, not via `tailwind.config.js`
   - What's unclear: Exact install + CSS import syntax for Tailwind 4 typography
   - Recommendation: Flag as LOW confidence — verify during Wave 0 of planning. Standard approach for Tailwind 4: `npm install @tailwindcss/typography` then add `@plugin '@tailwindcss/typography'` to `globals.css`.

---

## Sources

### Primary (HIGH confidence)
- https://nextjs.org/docs/app/api-reference/functions/generate-metadata — Full OG metadata API, `metadataBase`, `openGraph.images` format, title templates
- https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap — `MetadataRoute.Sitemap` type, `lastModified` accepts `string | Date`, revalidate pattern
- https://nextjs.org/docs/app/guides/mdx — `@next/mdx` install, `next.config.ts` setup, `mdx-components.tsx` requirement, dynamic import pattern
- Direct code inspection: `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`, `app/privacy/page.tsx`, `app/terms/page.tsx`, `components/footer.tsx`, `app/products/[handle]/page.tsx`

### Secondary (MEDIUM confidence)
- https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots — MetadataRoute.Robots API
- Project code inspection: `lib/shopify-queries.ts` confirms `updatedAt` is in PRODUCT_FRAGMENT; `GET_ALL_PRODUCTS_HANDLES` query does NOT include `updatedAt` — new query needed

### Tertiary (LOW confidence)
- Tailwind 4 + @tailwindcss/typography `@plugin` directive approach — needs verification during planning; standard Tailwind 4 ecosystem pattern

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified via official Next.js docs (fetched 2026-02-27)
- Architecture: HIGH — patterns confirmed via code inspection + official docs
- Pitfalls: HIGH — identified via direct code inspection of existing files (duplicate routes, brand name bug, missing OG images field all confirmed)
- Tailwind typography integration: LOW — Tailwind 4 plugin syntax unverified

**Research date:** 2026-02-27
**Valid until:** 2026-03-27 (Next.js stable, 30-day window)
