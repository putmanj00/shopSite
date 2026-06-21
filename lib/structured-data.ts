export const SITE_URL = 'https://wildenflower.com';

export function buildBreadcrumbList(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Wildenflower is an online + local-markets brand with no public storefront address,
// so we model it as an OnlineStore (subtype of Organization/Store) rather than a
// LocalBusiness. LocalBusiness implies a visitable address Google expects to be
// present; we deliberately publish no street address or phone. `areaServed` carries
// the Northern-Kentucky local-intent signal without exposing personal contact info.
// For Google Maps presence, set up a Google Business Profile as a *service-area*
// business (which hides the street address) — that is separate from this markup.
export const onlineStoreSchema = {
  '@context': 'https://schema.org',
  '@type': 'OnlineStore',
  name: 'Wildenflower',
  description:
    'Made by hand. Found by heart. Handcrafted tie-dye, leather goods, jewelry, crystals, and original art from Northern Kentucky.',
  url: SITE_URL,
  areaServed: 'Northern Kentucky',
  priceRange: '$$',
  sameAs: ['https://instagram.com/wildenflower/'],
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Wildenflower',
  url: SITE_URL,
  description:
    'Made by hand. Found by heart. Handcrafted goods from independent artisans.',
  sameAs: ['https://instagram.com/wildenflower/'],
};

export function buildFaqPageSchema(
  items: { question: string; answer: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
