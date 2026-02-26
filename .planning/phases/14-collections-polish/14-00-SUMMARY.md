# Phase 14: Collections Polish

## Context
We are beginning Phase 14 of the visual migration. This phase addresses the primary product catalog view (`/collections/all`). The goal is to migrate the generic collection header to match the brand identity established across the site, aligning the heading, subtitle, botanical header imagery, and breadcrumb trail.

## Original Requirements
- **COLL-01**: /collections/all heading reads "All Treasures"
- **COLL-02**: Subtitle reads "Every handmade treasure in one place"
- **COLL-03**: Botanical header image (botanical-header-small-web.png) is visible above or alongside the heading
- **COLL-04**: Breadcrumb trail reads "Home > Shop > All Treasures"

## Implementation Plan

### 14-01: Update Collection Header & Subtitle
Target: `app/collections/[handle]/page.tsx`
Action: Implement conditional logic for the "all" handle. When `handle === 'all'`, override the Shopify default collection title ("Products") with "All Treasures" and inject the subtitle "Every handmade treasure in one place".

### 14-02: Add Botanical Header & Fix Breadcrumbs
Target: `app/collections/[handle]/page.tsx` (or related header component) and `components/breadcrumbs.tsx`
Action: Insert the `botanical-header-small-web.png` image above the heading. Verify and update the breadcrumb component to conditionally override the segment label when the route is `/collections/all` yielding "Home > Shop > All Treasures".

### 14-03: Visual Verification
Target: Browser (http://localhost:3000/collections/all)
Action: Checkpoint for user to verify the updated layout, ensuring all four COLL criteria are met.
