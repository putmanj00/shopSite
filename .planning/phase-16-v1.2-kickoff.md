# Phase 16: v1.2 Kick-off & Tech Debt Cleanup

## Objectives
1. Begin mapping out and executing **v1.2 requirements**.
2. Resolve standing technical debt (clean up CRO remnants and fake testimonials).

## Completed Tasks

### 1. v1.2 UI Additions
- **COLL-EXT-01**: Added a thematic botanical divider (`divider-fern-mushroom.png`) to the bottom of the `/collections/all` page route.
- **COLL-EXT-02**: Capitalized the display styling of `tags` and `types` in both the desktop and mobile collection filter sidebars.

### 2. Tech Debt Resolution
- **Email Templates**: Removed the placeholder fake review testimonial from the Abandoned Cart email component (`components/emails/abandoned-cart-email.tsx`).
- **Orphaned Components**: Deleted remaining unused, "fake" CRO marketing pop-up components:
  - `components/social-proof-toast.tsx`
  - `components/cro/recent-purchase-popup.tsx`
- **Re-exports**: Cleaned up the `/components/cro/index.ts` file to purge the unused exports.

## Next Steps
- Validate layout stability with the botanical divider across breakpoints.
- Draft scope for Phase 17 (remaining v1.2 wishlist line-items).
