# Phase 17: Cookie Consent & Product Schema - Context

**Gathered:** 2026-02-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a cookie consent banner for visitors that links to the Privacy Policy and persists their choice in `localStorage`. Additionally, add JSON-LD structured data to product pages to improve SEO and display Rich Results in search engines.

</domain>

<decisions>
## Implementation Decisions

### Cookie Consent Banner
- Displayed fixed at the bottom of the screen with Wildenflower styling (parchment/earth tones).
- Buttons for "Accept" and "Refuse".
- Link to `/legal/privacy-policy`.
- Stores `wildenflower_cookie_consent` as `accepted` or `rejected` in localStorage.
- Does not render or reappear if the user has already made a choice.
- Client component to access `localStorage` securely.

### JSON-LD Product Schema
- Create a `ProductSchema` component that injects a `<script type="application/ld+json">` tag into the product detail page (`app/products/[handle]/page.tsx`).
- Using `Product` schema from schema.org.
- Fields to include: `name`, `description`, `image`, `offers` (with `price`, `priceCurrency`, `availability`).
- Pull data directly from the existing Shopify `Product` object.

</decisions>

<specifics>
## Specific Ideas

- The cookie banner must blend well with the storefront's aesthetics (e.g., `#F5EDD6` or dark forest green `#1E3B30`).
- Schema must be valid per Google's Rich Results guidelines.

</specifics>

<deferred>
## Deferred Ideas

- Integration with a strict Google Tag Manager (GTM) or third-party paid cookie compliance tool like OneTrust is out of scope. A simple localStorage flag is sufficient for now.
</deferred>

---

*Phase: 17-cookie-consent-product-schema*
*Context gathered: 2026-02-27*
