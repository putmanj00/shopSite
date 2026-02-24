# Phase 1: Design Foundation - Research

**Researched:** 2026-02-24
**Domain:** Tailwind CSS v4 theming, next/font/google, Next.js App Router metadata
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Typography — font loading**
- Load Playfair Display weight **700 only** via `next/font/google`
- Load Lora weights **400 regular + 400 italic** via `next/font/google`
- Apply font variables as `className` on the `<html>` element in layout.tsx (standard next/font pattern)
- Declare Tailwind font-family utilities: `font-playfair` and `font-lora` mapping to the CSS variables

**Typography — application**
- Global heading reset in globals.css: `h1, h2, h3, h4, h5, h6 { font-family: var(--font-playfair) }`
- Lora set as body default: `body { font-family: var(--font-lora) }`
- Existing psychedelic fonts (Righteous, Nunito, Sacramento) removed completely from layout.tsx — no dead code left

**Dark mode**
- Suppress dark mode entirely: add `color-scheme: light` to `:root` in globals.css
- Full site sweep: remove all `dark:` Tailwind utility classes across all component files in this phase

**Metadata**
- Title: `Wildenflower | Tie-Dye, Leather Goods, Jewelry & Art`
- Meta description: Write a Wildenflower brand description capturing the full product mix (tie-dye, leather goods, jewelry, art) with warm handmade voice — "Made by hand. Found by heart."
- Include basic Open Graph tags: `og:title`, `og:description`, `og:type`

### Claude's Discretion
- Exact wording of the meta description (within the brand voice and product mix guidance above)
- Whether to use `display: swap` or `display: optional` for font loading strategy
- Prose/body CSS defaults beyond font-family (line-height, font-size baseline)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DESIGN-01 | Tailwind CSS theme extended with Wildenflower color tokens: parchment (#F5EDD6), terracotta (#C8642A), gold (#C9A642), sage (#7B8B6F), forest (#1E3B30), dustyRose (#D08B7A), inkBrown (#5C4033), earth (#3B2F2F) | Tailwind v4 `@theme` block in globals.css — no tailwind.config.js needed |
| DESIGN-02 | Playfair Display (700 bold, heading) and Lora (400 regular, body) loaded via next/font/google, replacing Righteous, Nunito, and Sacramento font variables in layout.tsx | next/font CSS variable pattern confirmed; `<html>` className approach; `@theme inline` in globals.css |
| DESIGN-03 | globals.css updated — default page background parchment, default text inkBrown/earth | CSS custom property replacement in `:root`, `color-scheme: light`, dark mode media query removal |
| DESIGN-04 | Layout metadata updated — remove "psychedelic/tie-dye/trippy" language, use Wildenflower botanical brand voice | Next.js `Metadata` type in layout.tsx; title, description, keywords, og:* fields all present and editable |
| DESIGN-05 | Viewport theme color updated from Cosmic Purple (#7C3AED) to forest (#1E3B30) | Next.js `Viewport` export already in layout.tsx; single field change; also manifest.json needs same update |
</phase_requirements>

---

## Summary

Phase 1 is a pure infrastructure migration — no new components, no layout changes. All five requirements land in exactly two files (`app/layout.tsx` and `app/globals.css`) plus a sweep of four component files that contain `dark:` classes, and one metadata file (`public/manifest.json`). The codebase is already on Tailwind CSS v4 (confirmed: `@import "tailwindcss"` with `@theme inline` block in globals.css) and Next.js 16.1.1 with the App Router, so all modern patterns apply.

The current globals.css contains a large psychedelic color system (Cosmic Purple, Electric Magenta, Sunset Orange, Psychedelic Teal, Lime Pop, Deep Navy) defined as CSS custom properties in `:root`, mapped through a `@theme inline` block into Tailwind utilities, with a dark mode `@media (prefers-color-scheme: dark)` override. The Wildenflower botanical tokens must be added to this `@theme` block and the background/foreground semantic variables must be updated to point at parchment/inkBrown. The old psychedelic variables can stay in `:root` as CSS vars (they will stop being generated as Tailwind utilities once removed from `@theme`) but the semantic variables must be overridden.

Font replacement is the most surgical change: layout.tsx imports `Righteous`, `Nunito`, `Sacramento` from `next/font/google` and applies them as `${nunito.variable} ${righteous.variable} ${sacramento.variable}` on `<body>`. These must be replaced with `Playfair_Display` and `Lora` applied on `<html>` (the App Router canonical location), then `@theme inline` in globals.css must be updated to map `--font-playfair` and `--font-lora`. Four untracked botanical components (watercolor-wash, botanical-header, section-title, category-chip) each have `dark:` Tailwind classes to remove.

**Primary recommendation:** Touch only `app/layout.tsx`, `app/globals.css`, `public/manifest.json`, and the four component files with `dark:` classes. No other files need modification to complete all five requirements.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | 4.x (installed as `^4`) | Utility token generation via `@theme` | No `tailwind.config.js` needed — all config in CSS |
| `next/font/google` | bundled with Next.js 16.1.1 | Self-hosted Google Fonts, zero CLS | Official Next.js font system, self-hosts at build time, no Google network requests |
| Next.js `Metadata` API | bundled with Next.js 16.1.1 | SEO metadata, Open Graph | App Router standard; exported const, no `<head>` tags needed |
| Next.js `Viewport` API | bundled with Next.js 16.1.1 | `themeColor`, viewport settings | Separated from Metadata in Next.js 14+; already used in layout.tsx |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@tailwindcss/postcss` | `^4` (dev) | PostCSS integration | Already installed; no action needed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `next/font/google` CSS variable approach on `<html>` | Applying `.className` directly on `<html>` | Variable approach is more flexible — allows Tailwind utility classes (`font-playfair`) to work anywhere; locked decision |
| `display: swap` | `display: optional` | `swap` causes FOUT but guarantees brand font shows; `optional` prevents FOUT but may show fallback permanently on slow connections — Claude's discretion, recommend `swap` for brand consistency |

**Installation:** No new packages required. All needed libraries are already installed.

---

## Architecture Patterns

### Files Modified in This Phase

```
app/
├── layout.tsx         # Font imports, html className, metadata, viewport themeColor
└── globals.css        # @theme tokens, :root semantic vars, body/heading defaults, dark: suppression
public/
└── manifest.json      # theme_color field update
components/ui/
├── watercolor-wash.tsx     # Remove dark: classes
├── botanical-header.tsx    # Remove dark: classes
├── section-title.tsx       # Remove dark: classes
└── category-chip.tsx       # Remove dark: classes
```

### Pattern 1: Tailwind v4 Custom Color Tokens

**What:** In Tailwind CSS v4, all theme customization lives in the CSS file via `@theme`. No `tailwind.config.js` needed. Each `--color-*` variable in `@theme` generates `bg-*`, `text-*`, `border-*`, `fill-*`, `stroke-*` utilities automatically.

**When to use:** Adding brand color tokens that must be available as Tailwind utility classes.

**Example:**
```css
/* Source: https://tailwindcss.com/docs/theme */
@import "tailwindcss";

@theme {
  /* Wildenflower botanical palette */
  --color-parchment: #F5EDD6;
  --color-terracotta: #C8642A;
  --color-gold: #C9A642;
  --color-sage: #7B8B6F;
  --color-forest: #1E3B30;
  --color-dusty-rose: #D08B7A;
  --color-ink-brown: #5C4033;
  --color-earth: #3B2F2F;
}
```

This generates: `bg-parchment`, `text-parchment`, `bg-forest`, `text-ink-brown`, etc.

**IMPORTANT — existing `@theme inline` block:** The project uses `@theme inline` (not bare `@theme`). The `inline` keyword means variables are inlined as CSS values rather than generating `var()` references. The new botanical tokens must be added to the existing `@theme inline` block OR a separate `@theme` block can be added. Both approaches work; adding to the existing block keeps it consolidated.

### Pattern 2: next/font CSS Variable Method (App Router)

**What:** Load fonts with `variable` option, apply `font.variable` to `<html>` className, then declare Tailwind font utilities in `@theme inline`.

**When to use:** Multiple fonts needed globally; fonts should be available as Tailwind classes.

**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/components/font
import { Playfair_Display, Lora } from "next/font/google";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

// In RootLayout:
<html lang="en" className={`${playfairDisplay.variable} ${lora.variable} antialiased`}>
```

```css
/* globals.css @theme inline block addition */
/* Source: https://nextjs.org/docs/app/api-reference/components/font#with-tailwind-css */
@theme inline {
  --font-playfair: var(--font-playfair);  /* maps to Tailwind font-playfair */
  --font-lora: var(--font-lora);          /* maps to Tailwind font-lora */
}
```

**Note:** `Playfair_Display` uses underscore (multi-word font names in next/font use underscores). `Lora` is single-word.

**Note on Playfair Display:** It is NOT a variable font on Google Fonts. Weight must be specified as a string (`"700"`) or array. Lora is also not a variable font — specify `weight: ["400"]` and `style: ["normal", "italic"]` for italic support.

### Pattern 3: Tailwind v4 Font Utility Declaration

**What:** After CSS variables are defined by next/font, declare them as Tailwind font utilities in `@theme inline`.

**Example:**
```css
/* Source: https://nextjs.org/docs/app/api-reference/components/font#with-tailwind-css */
@theme inline {
  --font-playfair: var(--font-playfair);
  --font-lora: var(--font-lora);
  /* These generate: font-playfair and font-lora utility classes */
}
```

Then in globals.css base styles:
```css
body {
  background-color: #F5EDD6; /* parchment */
  color: #5C4033;            /* inkBrown */
  font-family: var(--font-lora), Georgia, serif;
  line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-playfair), Georgia, serif;
  font-weight: 700;
}
```

### Pattern 4: Suppressing Dark Mode

**What:** Add `color-scheme: light` to `:root` to disable OS-level dark mode. Remove the `@media (prefers-color-scheme: dark)` block from globals.css. Remove all `dark:` utility classes from component files.

**Example:**
```css
:root {
  color-scheme: light;
  /* ... rest of variables */
}

/* DELETE this entire block from globals.css: */
@media (prefers-color-scheme: dark) {
  :root { ... }
}
```

### Pattern 5: Next.js Metadata and Viewport

**What:** The `metadata` and `viewport` exports in `app/layout.tsx` use the App Router typed API. `themeColor` lives on `viewport`, not `metadata`.

**Example:**
```typescript
// Source: Next.js 16 App Router — layout.tsx already uses this pattern
export const metadata: Metadata = {
  title: {
    default: "Wildenflower | Tie-Dye, Leather Goods, Jewelry & Art",
    template: "%s | Wildenflower",
  },
  description: "Made by hand. Found by heart. Wildenflower crafts tie-dye apparel, leather goods, jewelry, and original art — each piece a small wonder for the person who knows beautiful things.",
  openGraph: {
    type: "website",
    title: "Wildenflower | Tie-Dye, Leather Goods, Jewelry & Art",
    description: "Made by hand. Found by heart. ...",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1E3B30", // forest green
};
```

### Anti-Patterns to Avoid

- **Adding a `tailwind.config.js`:** Tailwind v4 does not use a config file. All customization is in CSS. Adding one will conflict.
- **Putting font variables on `<body>` instead of `<html>`:** The user decision locks variables onto `<html>`. If applied to `<body>`, the CSS variables are not available to elements outside body (e.g., `<head>` styles). The official Next.js docs show `<html>` as the canonical location for the variable approach.
- **Overriding existing `@theme inline` block instead of extending:** The existing block maps many semantic colors to Tailwind. Replacing it wholesale risks breaking existing utility classes used in other components. Add new tokens, update semantic variables.
- **Removing old `:root` CSS custom properties:** The old psychedelic colors are referenced by existing components via `var(--color-primary-*)`. These can stay as CSS variables — they just won't generate Tailwind utilities if removed from `@theme`. Safe to leave the `:root` block intact and only update the `@theme inline` section.
- **Using `font-display: optional` for brand fonts:** `optional` may result in the system font being permanently shown on slow connections. Recommend `swap` for Playfair Display and Lora since brand typography is central to this phase's success.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font self-hosting | Copy font files into public/, write @font-face rules | `next/font/google` | Automatic subsetting, preloading, zero CLS, no Google network requests at runtime |
| Theme color in `<head>` | `<meta name="theme-color">` in layout | Next.js `Viewport` export `themeColor` | Type-safe, colocated with layout logic, handles Android Chrome PWA correctly |
| Dark mode class removal | Manual grep/replace | Systematic file-by-file sweep of the 4 known files | Only 4 files have `dark:` classes: watercolor-wash, botanical-header, section-title, category-chip |

**Key insight:** Every problem in this phase has an idiomatic Next.js or Tailwind v4 solution already wired up in the existing codebase. The work is configuration replacement, not feature building.

---

## Common Pitfalls

### Pitfall 1: Font Variable Naming Collision

**What goes wrong:** The `@theme inline` block currently declares `--font-sans: var(--font-nunito)` and `--font-heading: var(--font-righteous)`. If the old font variable names (`--font-nunito`, `--font-righteous`) are removed from layout.tsx but the `@theme inline` references remain, Tailwind will generate utilities pointing at undefined CSS variables — the utility classes will exist but render in the fallback font silently.

**Why it happens:** CSS does not error on undefined variables; it falls back to the initial value.

**How to avoid:** Update the `@theme inline` block in the same task as removing font imports from layout.tsx. Replace `--font-sans: var(--font-nunito)` with `--font-lora: var(--font-lora)` and add `--font-playfair: var(--font-playfair)`. Remove the old heading/accent font mappings.

**Warning signs:** Browser DevTools shows `font-family: ` resolving to system font even though the HTML element has the variable class applied.

### Pitfall 2: `dark:` Classes Silently Surviving

**What goes wrong:** The user decision requires removing ALL `dark:` classes. If missed, dark mode classes are harmless now (because `color-scheme: light` suppresses the media query) but they will confuse future developers and may re-activate if color-scheme is changed.

**Why it happens:** 4 component files have `dark:` classes — all are in `components/ui/` — but they are untracked files (shown in git status). The sweep must cover them explicitly.

**How to avoid:** Grep all files before declaring completion. The known files are:
- `components/ui/watercolor-wash.tsx` — 4 instances
- `components/ui/botanical-header.tsx` — 1 instance
- `components/ui/section-title.tsx` — 2 instances
- `components/ui/category-chip.tsx` — 3 instances

**Warning signs:** `grep -r "dark:" components/` returns any results after the sweep task.

### Pitfall 3: manifest.json theme_color Not Updated

**What goes wrong:** layout.tsx `viewport.themeColor` is updated to forest but `public/manifest.json` still has `"theme_color": "#7C3AED"`. PWA installs on Android will show the old purple color.

**Why it happens:** The manifest is a separate static file not connected to the Metadata API.

**How to avoid:** Include `public/manifest.json` in the DESIGN-05 task alongside viewport update.

**Warning signs:** PWA installed on Android Chrome shows purple status bar color.

### Pitfall 4: `body` Has Both Tailwind `font-sans` Class and Direct CSS

**What goes wrong:** The current layout.tsx applies `className="... font-sans"` to `<body>`. If `font-sans` is redefined in `@theme inline` to point at the old Nunito variable (which is being removed), or if the globals.css `body { font-family: }` declaration conflicts with the Tailwind utility class on the body element, specificity battles can make it unpredictable which font actually renders.

**Why it happens:** CSS specificity — an inline utility class on body vs. a `body { }` selector in globals.css. The utility class typically wins in Tailwind v4 unless `!important` is involved.

**How to avoid:** Remove the `font-sans` class from `<body>` in layout.tsx and instead drive font through the `body { font-family: var(--font-lora) }` rule in globals.css. The font variables are available because they're set on `<html>`, which is `<body>`'s ancestor.

**Warning signs:** DevTools shows computed font on body as system sans-serif rather than Lora.

### Pitfall 5: `color-scheme: light` Must Go on `:root`, Not `html` or `body`

**What goes wrong:** Placing `color-scheme: light` on the `html` element via a Tailwind class or inline style may not propagate correctly to the browser's UI chrome (scrollbars, form controls).

**Why it happens:** `color-scheme` is inherited but browsers use the `:root` value for system UI decisions.

**How to avoid:** Add `color-scheme: light` directly to the `:root` selector in globals.css, not as a Tailwind class.

---

## Code Examples

Verified patterns from official sources:

### Complete layout.tsx Font Section (App Router)
```typescript
// Source: https://nextjs.org/docs/app/api-reference/components/font
import { Playfair_Display, Lora } from "next/font/google";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

// In RootLayout JSX:
<html
  lang="en"
  className={`${playfairDisplay.variable} ${lora.variable} antialiased`}
>
```

### globals.css @theme inline — Botanical Token Addition
```css
/* Source: https://tailwindcss.com/docs/theme */
@theme inline {
  /* NEW: Wildenflower botanical tokens */
  --color-parchment: #F5EDD6;
  --color-terracotta: #C8642A;
  --color-gold: #C9A642;
  --color-sage: #7B8B6F;
  --color-forest: #1E3B30;
  --color-dusty-rose: #D08B7A;
  --color-ink-brown: #5C4033;
  --color-earth: #3B2F2F;

  /* NEW: Font utilities */
  --font-playfair: var(--font-playfair);
  --font-lora: var(--font-lora);

  /* UPDATE: Point semantic tokens at new palette */
  --color-background: #F5EDD6;      /* parchment */
  --color-foreground: #5C4033;      /* inkBrown */

  /* REMOVE: old font mappings */
  /* --font-sans: var(--font-nunito);      ← delete */
  /* --font-heading: var(--font-righteous); ← delete */
  /* --font-accent: var(--font-sacramento); ← delete */
}
```

### globals.css :root — Suppress Dark Mode + Set Background
```css
:root {
  color-scheme: light;  /* NEW: suppress dark mode system UI */

  /* UPDATE semantic variables */
  --background: #F5EDD6;   /* parchment */
  --foreground: #5C4033;   /* inkBrown */
  /* ... existing variables stay ... */
}

/* DELETE entire block: */
/* @media (prefers-color-scheme: dark) { :root { ... } } */
```

### globals.css Body and Heading Defaults
```css
body {
  background-color: var(--background);   /* parchment via updated --background */
  color: var(--foreground);              /* inkBrown via updated --foreground */
  font-family: var(--font-lora), Georgia, serif;
  font-size: 1rem;
  line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-playfair), Georgia, serif;
  font-weight: 700;
}
```

### layout.tsx Metadata
```typescript
// Source: Next.js 16 App Router Metadata API
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://wildenflower.com"),
  title: {
    default: "Wildenflower | Tie-Dye, Leather Goods, Jewelry & Art",
    template: "%s | Wildenflower",
  },
  description:
    "Made by hand. Found by heart. Wildenflower offers tie-dye apparel, leather goods, handcrafted jewelry, and original art — each piece made with care, found by the person it was meant for.",
  keywords: [
    "tie-dye",
    "leather goods",
    "handcrafted jewelry",
    "original art",
    "handmade",
    "botanical",
    "wildenflower",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wildenflower.com",
    siteName: "Wildenflower",
    title: "Wildenflower | Tie-Dye, Leather Goods, Jewelry & Art",
    description:
      "Made by hand. Found by heart. Tie-dye, leather goods, jewelry, and art crafted with care.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1E3B30", // forest green
};
```

### manifest.json theme_color Update
```json
{
  "theme_color": "#1E3B30",
  "background_color": "#F5EDD6",
  "description": "Made by hand. Found by heart. Wildenflower — tie-dye, leather goods, jewelry, and original art."
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` `theme.extend.colors` | `@theme` block in CSS file | Tailwind v4 (2025) | No JS config file needed; all theming in CSS |
| `tailwind.config.js` `theme.extend.fontFamily` | `@theme inline { --font-*: ... }` | Tailwind v4 (2025) | Font utilities declared directly in CSS |
| `next/head` with `<meta name="theme-color">` | `Viewport` export `themeColor` | Next.js 14 (2023) | Type-safe, no raw HTML needed |
| Fonts on `<body>` element | Font variables on `<html>` element | Next.js 13 App Router recommendation | Variables available to entire document tree |

**Deprecated/outdated:**
- `tailwind.config.js`: Tailwind v4 is CSS-first. The project has no tailwind.config.js and that is correct.
- `@next/font`: Renamed to `next/font` in Next.js 13.2. Project already uses the correct `next/font/google` import path.
- Dark mode via `class` strategy on `<html>`: Not used here. This project uses media query dark mode (which is being removed).

---

## Open Questions

1. **Font display strategy: `swap` vs `optional`**
   - What we know: `swap` causes FOUT (flash of unstyled text) but guarantees brand font renders. `optional` prevents FOUT but may permanently show fallback on slow connections.
   - What's unclear: Wildenflower's primary user device profile — mobile with potentially variable connection speed.
   - Recommendation: Use `display: swap`. Typography is a primary brand signal in this migration; the brief flash is preferable to permanent fallback rendering. This is Claude's discretion to decide.

2. **Whether to clean up old psychedelic CSS variables from `:root`**
   - What we know: The old `:root` block has ~80 lines of psychedelic color variables. They are not referenced by Tailwind utilities (once removed from `@theme`), but may be referenced by inline styles or legacy code in components not swept in this phase.
   - What's unclear: Whether any components use `var(--color-primary-600)` etc. directly in CSS-in-JS or style props.
   - Recommendation: Leave the old `:root` variables in place for Phase 1. They are harmless as CSS variables and removing them risks breaking components outside this phase's scope. A future cleanup phase can remove dead code.

---

## Sources

### Primary (HIGH confidence)
- [https://tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme) — `@theme` directive, `--color-*` token generation, font utility pattern
- [https://nextjs.org/docs/app/api-reference/components/font](https://nextjs.org/docs/app/api-reference/components/font) — CSS variable method, `<html>` className pattern, Tailwind CSS v4 integration, multiple fonts, Lora/Playfair_Display weight specification (version 16.1.6, updated 2026-02-20)

### Secondary (MEDIUM confidence)
- [https://fonts.google.com/specimen/Playfair+Display](https://fonts.google.com/specimen/Playfair+Display) — Confirmed Playfair Display available weights (400–900); not a variable font, requires explicit weight
- [https://tailwindcss.com/blog/tailwindcss-v4](https://tailwindcss.com/blog/tailwindcss-v4) — Confirmed CSS-first approach, no `tailwind.config.js` in v4

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Tailwind v4 and Next.js 16 docs fetched directly from official sources (updated 2026-02-20)
- Architecture: HIGH — All patterns verified against official docs; current codebase inspected to confirm file locations and existing patterns
- Pitfalls: HIGH — Identified by direct inspection of actual code being modified (globals.css, layout.tsx, 4 component files)

**Research date:** 2026-02-24
**Valid until:** 2026-03-24 (Tailwind v4 and Next.js 16 are stable; 30-day window appropriate)
