# Phase 12: Navigation Labels - Research

**Researched:** 2026-02-26
**Domain:** Next.js App Router server/client component split, Shopify Storefront API menu query, accessible dropdown navigation
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Category data source**
- Source nav from Shopify Storefront API using the named menu object (e.g., `main-menu`)
- Fetch at build time (SSG) — nav is baked into the build, not fetched at runtime
- The existing Shopify menu needs cleanup (wrong labels, missing/incorrect items) — updating the admin menu is part of this phase
- If the Shopify API call fails, fall back to a hardcoded list of the 6 known categories (not silently empty)

**Display order**
- Primary order is controlled by the Shopify admin menu — whatever order items are in the admin menu is the rendered order
- Fallback hardcoded list uses this curated order: Tie-Dye → Jewelry → Crystals → Leather → Ceramics → Artwork

**Nav link targets**
- Verify all 6 known collection handles exist in Shopify at build time: `tie-dye`, `leather`, `jewelry`, `crystals`, `artwork`, `ceramics`
- Only show nav links for collections that are confirmed active in Shopify
- Flag any missing handles as build-time blockers — a broken link (404) is worse than a missing nav item

**Nav structure**
- Categories live under a **"Shop" dropdown**, not flat in the top bar
- Top bar pattern: `Home | Shop | About` (clean, restrained, room to grow)
- **Desktop:** Hover opens the dropdown (primary). Click also toggles it (fallback). Fully keyboard navigable: Tab to focus, Enter/Space to open, Escape to close
- **Mobile:** Hamburger menu with an expandable accordion — tap "Shop" to reveal the 6 categories inline

**Label corrections**
- "Leather" (not "Leather Goods")
- "Artwork" (not "Art")
- All 6 labels must exactly match: Tie-Dye, Leather, Jewelry, Crystals, Artwork, Ceramics

### Claude's Discretion
- Exact dropdown animation/transition style
- Dropdown width and visual treatment
- Whether to show collection product counts in the dropdown
- How the current header component is structured (researcher investigates)

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| NAV-04 | Top nav shows all 6 categories: Tie-Dye, Leather, Jewelry, Crystals, Artwork, Ceramics — with correct `/collections/[handle]` hrefs | Shopify menu query fetches labels+handles at build time; fallback hardcodes all 6 |
| NAV-05 | Nav category labels are correct: "Leather" (not "Leather Goods"), "Artwork" (not "Art") | Label corrections applied in Shopify admin menu AND in the hardcoded fallback array |
</phase_requirements>

---

## Summary

Phase 12 replaces a flat, hardcoded nav with a "Shop" dropdown containing all 6 Wildenflower categories. The current `components/header.tsx` is a `'use client'` component with flat links and wrong labels ("Leather Goods", "Art") — it is missing two categories entirely (Crystals, Ceramics) and uses the wrong href for Artwork (`/collections/art` instead of `/collections/artwork`). The companion `components/mobile-drawer.tsx` has the same hardcoded problems.

The locked decision to fetch from Shopify's menu API at build time requires a server/client split: the root `app/layout.tsx` (a React Server Component) must become async, fetch the Shopify menu, and pass nav items as props to a refactored client header. This is the standard Next.js App Router pattern for SSG nav data. The Shopify Storefront API `menu(handle:)` query is available in API version `2025-04` (which the project already uses) and returns `items` with `{ id, title, url, type }` fields plus one level of nested `items`.

The mobile nav lives in `components/mobile-drawer.tsx` and is currently a side-sliding full-screen drawer. The decision says mobile should use an expandable accordion for the "Shop" sub-items — this means the drawer structure stays but the "Shop" item expands inline rather than sliding further. Framer-motion v12 is already installed and used in the mobile drawer, so the accordion animation is handled. Desktop dropdown uses Tailwind group-hover plus state toggle for keyboard support.

**Primary recommendation:** Async layout.tsx fetches Shopify menu → passes `navItems` prop to a refactored `<Header navItems={...} />` and `<MobileDrawer navItems={...} />` — server fetches, client renders interactively.

---

## Current State Audit (HIGH confidence — read from codebase)

### header.tsx — Problems Found

| Issue | Current Value | Required Value |
|-------|--------------|----------------|
| Nav structure | Flat links in top bar | "Shop" dropdown |
| "Leather Goods" label | `Leather Goods` → `/collections/leather` | `Leather` |
| "Art" label | `Art` → `/collections/art` | `Artwork` → `/collections/artwork` |
| Missing: Crystals | Not present | `/collections/crystals` |
| Missing: Ceramics | Not present | `/collections/ceramics` |
| Top bar items | Shop All, Leather Goods, Jewelry, Tie-Dye, Art, Our Story | Home, Shop (dropdown), About |
| Data source | Hardcoded JSX | Shopify menu API + fallback |

### mobile-drawer.tsx — Problems Found

| Issue | Current Value | Required Value |
|-------|--------------|----------------|
| Categories array | `Leather Goods`, `Art`, missing Crystals/Ceramics | All 6 with correct labels |
| Structure | Flat list of category links | Accordion under "Shop" header |
| Data source | Hardcoded array | Prop from server |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 16.1.1 (already installed) | Async RSC layout for SSG nav fetch | Project already uses it; `async layout.tsx` is the canonical pattern |
| @shopify/storefront-api-client | installed | Shopify menu GraphQL query | Already wired via `shopifyFetch` + `getShopifyClient()` |
| framer-motion | 12.26.2 (already installed) | Dropdown/accordion animations | Already used in MobileDrawer; consistent |
| React useState/useRef | React 19 (already installed) | Desktop hover+keyboard dropdown state | No additional library needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Tailwind CSS | 4 (already installed) | Dropdown positioning, z-index, transitions | All visual styling |
| next/link | built-in | Category href links | All nav links use Next.js Link |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| async layout.tsx RSC | Route-level data fetch in a dedicated Server Component wrapper | Same outcome; layout is simpler since Header is already imported there |
| Shopify menu API | Collections API (filter to known handles) | Menu API gives label control from admin; collections API gives all collections unfiltered — menu is correct for this use case |
| framer-motion accordion | CSS max-height transition | framer-motion already installed; AnimatePresence gives cleaner mount/unmount than CSS hack |

**Installation:** No new packages needed. All dependencies are already installed.

---

## Architecture Patterns

### Recommended File Changes
```
app/
└── layout.tsx                    # Make async, fetch nav menu, pass props

components/
├── header.tsx                    # Refactor: accept navItems prop, add Shop dropdown
├── mobile-drawer.tsx             # Refactor: accept navItems prop, add Shop accordion
└── (no new files needed)

lib/
└── shopify-queries.ts            # Add GET_MENU_QUERY
    shopify-helpers.ts            # Add getNavMenu() function
```

### Pattern 1: Async Layout RSC with Prop Passing

**What:** `app/layout.tsx` becomes `async function RootLayout()` — fetches menu at build time, passes nav data as props to Header and MobileDrawer. Header/MobileDrawer remain `'use client'` but receive serializable data (plain array of objects) as props.

**When to use:** Any time a client component needs server/build-time data in a layout that wraps the whole app.

**Example:**
```typescript
// app/layout.tsx — becomes async
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const navItems = await getNavMenu('main-menu'); // returns NavItem[] or fallback

  return (
    <html lang="en" className={...}>
      <body>
        <CurrencyProvider>
          <Header navItems={navItems} />
          <MobileDrawer navItems={navItems} />
          {/* ... rest unchanged ... */}
        </CurrencyProvider>
      </body>
    </html>
  );
}
```

**Key constraint:** Props passed from RSC to client components must be serializable (no functions, no class instances). A `NavItem[]` array of `{ label: string; href: string }` objects is safe.

### Pattern 2: Shopify Menu Query

**What:** GraphQL query against Shopify Storefront API `menu(handle:)` — returns items with title, url, type.

**When to use:** Fetching navigation structure that is managed in Shopify admin (Online Store > Navigation).

**Example:**
```typescript
// lib/shopify-queries.ts — add this query
export const GET_MENU_QUERY = `
  query getMenu($handle: String!) {
    menu(handle: $handle) {
      handle
      title
      items {
        id
        title
        url
        type
      }
    }
  }
`;

// lib/shopify-helpers.ts — add this helper
export interface NavItem {
  label: string;
  href: string;
}

const FALLBACK_NAV_ITEMS: NavItem[] = [
  { label: 'Tie-Dye',   href: '/collections/tie-dye' },
  { label: 'Jewelry',   href: '/collections/jewelry' },
  { label: 'Crystals',  href: '/collections/crystals' },
  { label: 'Leather',   href: '/collections/leather' },
  { label: 'Ceramics',  href: '/collections/ceramics' },
  { label: 'Artwork',   href: '/collections/artwork' },
];

const VALID_HANDLES = new Set(['tie-dye', 'leather', 'jewelry', 'crystals', 'artwork', 'ceramics']);

export async function getNavMenu(handle: string): Promise<NavItem[]> {
  try {
    const data = await shopifyFetch<{ menu: { items: Array<{ id: string; title: string; url: string; type: string }> } | null }>({
      query: GET_MENU_QUERY,
      variables: { handle },
    });

    if (!data.menu) {
      console.warn(`Shopify menu "${handle}" not found — using fallback nav`);
      return FALLBACK_NAV_ITEMS;
    }

    // Extract collection handle from Shopify URL like https://store.myshopify.com/collections/leather
    const items = data.menu.items
      .filter(item => item.type === 'COLLECTION')
      .map(item => {
        const urlParts = item.url.split('/collections/');
        const handle = urlParts[1]?.split('?')[0] ?? '';
        return { label: item.title, href: `/collections/${handle}` };
      })
      .filter(item => VALID_HANDLES.has(item.href.replace('/collections/', '')));

    if (items.length < 6) {
      console.warn(`Shopify menu "${handle}" has ${items.length}/6 expected categories — using fallback nav`);
      return FALLBACK_NAV_ITEMS;
    }

    return items;
  } catch (error) {
    console.error('Failed to fetch Shopify nav menu:', error);
    return FALLBACK_NAV_ITEMS;
  }
}
```

### Pattern 3: Desktop "Shop" Dropdown (Hover + Keyboard)

**What:** A `<div>` with `group` Tailwind class wraps the "Shop" button and the dropdown panel. Hover shows dropdown via `group-hover:block`. React state (`isOpen`) provides keyboard toggle. `onMouseEnter`/`onMouseLeave` keeps state in sync with hover.

**When to use:** Desktop nav dropdown that must work with both pointer and keyboard.

**Example:**
```typescript
// Inside header.tsx (client component)
const [shopOpen, setShopOpen] = useState(false);
const dropdownRef = useRef<HTMLDivElement>(null);

// Close on Escape or outside click
useEffect(() => {
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setShopOpen(false);
  };
  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setShopOpen(false);
    }
  };
  document.addEventListener('keydown', handleKey);
  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('keydown', handleKey);
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);

// JSX:
<div
  ref={dropdownRef}
  className="relative"
  onMouseEnter={() => setShopOpen(true)}
  onMouseLeave={() => setShopOpen(false)}
>
  <button
    onClick={() => setShopOpen(prev => !prev)}
    aria-expanded={shopOpen}
    aria-haspopup="true"
    className="text-parchment hover:text-terracotta font-medium transition-colors duration-200 flex items-center gap-1"
  >
    Shop
    <svg /* chevron icon, rotates when open */ />
  </button>

  {shopOpen && (
    <div
      role="menu"
      className="absolute top-full left-0 mt-1 bg-forest border border-gold/30 rounded-md shadow-lg py-2 min-w-40 z-50"
    >
      {navItems.map(item => (
        <Link
          key={item.href}
          href={item.href}
          role="menuitem"
          className="block px-4 py-2 text-parchment hover:text-terracotta hover:bg-white/5 transition-colors"
          onClick={() => setShopOpen(false)}
        >
          {item.label}
        </Link>
      ))}
    </div>
  )}
</div>
```

### Pattern 4: Mobile Drawer Shop Accordion

**What:** In `mobile-drawer.tsx`, replace the flat `categories.map(...)` list with a "Shop" section header that toggles an AnimatePresence list. Tap "Shop" to expand/collapse the 6 categories inline.

**When to use:** Mobile drawer navigation where sub-categories should not consume full-drawer real estate unless user requests.

**Example:**
```typescript
// Inside mobile-drawer.tsx (client component)
const [shopExpanded, setShopExpanded] = useState(false);

// JSX — replaces the categories.map() block:
<div className="flex flex-col gap-1">
  <button
    onClick={() => setShopExpanded(prev => !prev)}
    aria-expanded={shopExpanded}
    className="text-lg font-playfair font-semibold text-parchment hover:text-gold transition-colors flex items-center justify-between w-full py-1"
  >
    Shop
    <svg /* chevron */ className={`transition-transform ${shopExpanded ? 'rotate-180' : ''}`} />
  </button>

  <AnimatePresence>
    {shopExpanded && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="flex flex-col pl-4 gap-3 py-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="text-base text-parchment/90 hover:text-gold transition-colors block"
              onClick={closeDrawer}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>
```

### Anti-Patterns to Avoid

- **Fetching menu in a client component with useEffect:** Causes flash of empty nav and defeats SSG. The server layout pattern avoids this.
- **Calling Shopify API in client component:** Exposes storefront access token in browser (it is a public token but still bad practice), and misses build-time caching.
- **Silently showing empty nav on API failure:** Per locked decision — must show fallback, never empty. Silent empty = broken nav shoppers cannot use.
- **Using `/collections/art` href:** The correct handle is `artwork`. Using `/collections/art` will 404 because the collection doesn't exist with that handle.
- **Relying solely on Shopify admin labels without fallback validation:** If admin has wrong label ("Leather Goods"), the menu API will return that wrong label. The helper should NOT blindly pass through Shopify labels — it should use Shopify for ordering/confirmation but the fallback array has canonical labels. **However:** per the locked decision, updating the Shopify admin menu with correct labels is part of this phase, so the API should return correct labels after the admin is updated. The helper still validates handles to avoid broken links.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dropdown positioning | CSS `position: absolute` manual offset math | Tailwind `absolute top-full left-0` | Tailwind utility handles the standard "below button, aligned left" case cleanly |
| Click-outside detection | Complex event delegation | Simple `mousedown` on `document` + ref check | Standard pattern; no library needed for one dropdown |
| Accordion animation | CSS max-height transition | framer-motion `AnimatePresence` + `height: auto` | framer-motion already installed; handles `height: auto` (which CSS cannot animate to) |
| Menu data type mapping | Complex URL parsing | Simple split on `/collections/` + handle validation | Shopify URL format is stable: `https://domain/collections/[handle]` |

**Key insight:** The entire implementation uses only already-installed packages. No new dependencies needed. The Shopify menu query is ~10 lines of GraphQL; the helper is ~40 lines of TypeScript.

---

## Common Pitfalls

### Pitfall 1: layout.tsx async breaks existing structure
**What goes wrong:** Making `layout.tsx` async could theoretically cause hydration issues if downstream client components have mismatches.
**Why it happens:** RSC async functions are supported in Next.js App Router but layout.tsx was not async before.
**How to avoid:** Async layout.tsx is fully supported in Next.js App Router — it is the canonical pattern for fetching data in layouts. The return value is still JSX; no hydration risk. Existing metadata export stays unchanged.
**Warning signs:** TypeScript errors in layout.tsx indicating async is unexpected — this means using an older Next.js pattern. Next.js 16 fully supports it.

### Pitfall 2: Shopify menu URL format
**What goes wrong:** Shopify menu item URLs are absolute (e.g., `https://yourstore.myshopify.com/collections/leather`) — not relative paths.
**Why it happens:** The Storefront API `menu.items[].url` field returns the full absolute URL, not a relative path.
**How to avoid:** Parse the URL to extract just the pathname or the handle. Use `new URL(item.url).pathname` or `.split('/collections/')[1]` to get the handle, then build `/collections/${handle}` for the Next.js Link href.
**Warning signs:** Nav links pointing to external Shopify domain instead of the Next.js app.

### Pitfall 3: Shopify menu handle in admin may not be "main-menu"
**What goes wrong:** The Shopify admin nav menu might have a different handle than `main-menu` — or might not exist yet if the store's navigation hasn't been configured.
**Why it happens:** Shopify defaults to `main-menu` but admins can rename it.
**How to avoid:** The `getNavMenu()` helper catches a null `data.menu` and returns fallback. Additionally, the task to update the Shopify admin menu should verify the handle before committing it to code. Check Shopify admin: Online Store > Navigation > Main menu and note the handle.
**Warning signs:** `console.warn: Shopify menu "main-menu" not found` in build logs — indicates admin menu needs to be created/verified.

### Pitfall 4: Header component prop signature change breaks layout
**What goes wrong:** If `Header` changes from no-props to accepting `navItems`, but `layout.tsx` is not updated to pass them, TypeScript will catch it — but only if the prop is typed as required.
**Why it happens:** Forgetting to update the call site when refactoring component signature.
**How to avoid:** Define `navItems` as a required prop (`navItems: NavItem[]`), not optional, so TypeScript enforces the update to layout.tsx. Run `tsc --noEmit` to verify.

### Pitfall 5: MobileDrawer still renders on desktop, causing duplicate dropdown
**What goes wrong:** Both `<Header>` (desktop dropdown) and `<MobileDrawer>` (mobile accordion) are always rendered. The hamburger button is `hidden lg:hidden` but the MobileDrawer component itself renders in the DOM.
**Why it happens:** MobileDrawer is rendered unconditionally in layout; visibility is CSS-controlled.
**How to avoid:** This is fine — MobileDrawer already hides itself with `lg:hidden` on the motion.div panel. The desktop dropdown in Header has `hidden lg:flex`. No structural change needed; both get `navItems` prop and render appropriately for their context.

### Pitfall 6: aria-label duplication between MobileDrawer and Header
**What goes wrong:** Both components set `aria-label="Main navigation"` — screen readers may announce the same label twice.
**Why it happens:** Copy-paste from existing header `aria-label`.
**How to avoid:** Use `aria-label="Primary navigation"` on desktop Header nav, `aria-label="Mobile navigation menu"` on MobileDrawer (already set correctly). Keep them distinct.

---

## Code Examples

Verified patterns from official sources:

### Shopify Menu GraphQL Query
```typescript
// Source: https://shopify.dev/docs/api/storefront/2025-07/queries/menu
export const GET_MENU_QUERY = `
  query getMenu($handle: String!) {
    menu(handle: $handle) {
      handle
      title
      items {
        id
        title
        url
        type
      }
    }
  }
`;
```

### URL Extraction from Shopify Menu Item
```typescript
// Shopify returns absolute URLs like: https://store.myshopify.com/collections/leather
// Safe extraction pattern:
function extractHandle(shopifyUrl: string): string {
  try {
    const pathname = new URL(shopifyUrl).pathname; // → '/collections/leather'
    const parts = pathname.split('/collections/');
    return parts[1]?.split('?')[0] ?? '';
  } catch {
    // URL constructor throws on invalid URLs
    return '';
  }
}
```

### Async Layout Pattern (Next.js App Router)
```typescript
// Source: Next.js docs — RSC layouts support async
// app/layout.tsx
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const navItems = await getNavMenu('main-menu');
  // navItems is NavItem[] — serializable, safe to pass as props to client components
  return (
    <html lang="en">
      <body>
        <Header navItems={navItems} />
        {children}
      </body>
    </html>
  );
}
```

### Keyboard-Accessible Dropdown (WAI-ARIA Menu Button Pattern)
```typescript
// ARIA roles: button with aria-haspopup + aria-expanded, role="menu" on panel, role="menuitem" on links
// Escape closes; Tab naturally moves focus out and should also close
<button
  aria-haspopup="true"
  aria-expanded={shopOpen}
  aria-controls="shop-dropdown"
>
  Shop
</button>
<div id="shop-dropdown" role="menu" aria-label="Shop categories">
  <Link role="menuitem" href="/collections/tie-dye">Tie-Dye</Link>
  {/* ... */}
</div>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `getServerSideProps` for nav data | Async RSC layout fetch | Next.js 13+ App Router | No separate data-fetching lifecycle; layout is the fetch point |
| `pages/_app.tsx` global nav | `app/layout.tsx` RSC | Next.js 13+ | Layout is a Server Component by default; async is supported |
| Shopify `collections` list for nav | Shopify `menu(handle:)` query | Shopify Storefront API 2022-07+ | Menu API gives admin-controlled ordering + curated label control |

**Deprecated/outdated:**
- `getStaticProps` on layout-level data: Not applicable in App Router. `async layout` replaces it.
- Client-side `useEffect` menu fetch: Works but defeats SSG, causes layout shift, and is unnecessary complexity when RSC fetch is available.

---

## Open Questions

1. **What is the exact Shopify admin menu handle for this store?**
   - What we know: Convention is `main-menu`; Shopify defaults to it for the primary navigation
   - What's unclear: Whether the Wildenflower Shopify admin has configured this menu or uses a different handle
   - Recommendation: Plan Wave 0 task — "Verify Shopify admin Online Store > Navigation > Main menu handle exists and correct label; update if needed". If handle differs from `main-menu`, update the `getNavMenu()` call argument.

2. **Do all 6 collection handles exist in Shopify?**
   - What we know: The phase decision says verify at build time: `tie-dye`, `leather`, `jewelry`, `crystals`, `artwork`, `ceramics`
   - What's unclear: Whether `crystals` and `ceramics` collections have been created in Shopify admin (they are missing from the current nav, suggesting they may not exist)
   - Recommendation: Plan task to verify collection existence by attempting `getCollectionByHandle()` for each handle before writing the nav links. If a collection returns `null`, flag as build-time blocker.

3. **Should the "Home" and "About" items also come from the Shopify menu, or be hardcoded?**
   - What we know: The locked decision says the nav structure is `Home | Shop | About` with only the "Shop" dropdown containing the 6 category items from Shopify
   - What's unclear: Not clearly stated whether Home/About are in the Shopify menu or hardcoded
   - Recommendation: Hardcode `Home` → `/` and `About` → `/about` in the header JSX. Only the category sub-items come from Shopify. This matches the locked decision's intent (Shopify controls category order/labels; site structure controls Home/About).

---

## Sources

### Primary (HIGH confidence)
- Shopify Storefront API official docs — `menu` query structure: https://shopify.dev/docs/api/storefront/2025-07/queries/menu
- Codebase direct inspection — `components/header.tsx`, `components/mobile-drawer.tsx`, `app/layout.tsx`, `lib/shopify.ts`, `lib/shopify-helpers.ts`, `lib/shopify-queries.ts`

### Secondary (MEDIUM confidence)
- Next.js App Router RSC async layout pattern — standard documentation pattern, verified against project's existing use of async functions in `app/collections/[handle]/page.tsx` (uses `async function generateStaticParams` and `async function generateMetadata`)
- WAI-ARIA Menu Button pattern — standard ARIA specification for accessible dropdowns

### Tertiary (LOW confidence)
- None — all critical claims verified from primary sources

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already installed; Shopify menu API verified from official docs
- Architecture: HIGH — server/client split pattern verified from existing project code (collections page uses same async RSC pattern)
- Pitfalls: HIGH — URL format pitfall verified from Shopify docs; prop-passing pitfall is TypeScript-verifiable

**Research date:** 2026-02-26
**Valid until:** 2026-03-28 (30 days — stable APIs, no fast-moving dependencies)
