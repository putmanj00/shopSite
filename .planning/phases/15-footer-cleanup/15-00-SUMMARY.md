# Phase 15: Footer Cleanup

## Context
Phase 15 targets the application footer, specifically standardizing the "Shop" column navigation links and ensuring all other footer links resolve to active, intentional pages accurately representing the store.

## Original Requirements
- **FOOT-01**: Footer SHOP column lists exactly 7 entries in order: All Treasures, Tie-Dye, Leather, Jewelry, Crystals, Artwork, Ceramics — each linking to its correct `/collections/[handle]` URL.
- **FOOT-02**: Every link in the footer resolves to a page that exists — no Size Guide, Sustainability, Press, or other dead links remain; clicking any footer link does not result in a 404.

## Implementation Plan

### 15-01: Correct the SHOP Column and Prune Dead Links
Target: `components/footer.tsx`
Action: 
1. Rewrite the links under the "Shop" section to precisely map the six categories (plus the "All Treasures" top-level route).
2. Review remaining footer links (e.g., Company, Support, Legal sections) and ensure they do not point to non-existent pages like `/size-guide`, `/press`, or `/sustainability` (unless those pages were actively validated or stubbed). If dead links are present, comment them out or remove them entirely to meet FOOT-02.

### 15-02: Visual & Routing Verification
Target: Browser (http://localhost:3000)
Action: Render the site, inspect the footer, and ensure the UI looks whole and clicking each link resolves to a valid destination page (200 OK).
