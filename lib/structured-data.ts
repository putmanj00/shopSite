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

// TODO: Replace placeholder address/phone/hours with real Wildenflower data (Alexandria, KY)
export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Wildenflower',
  description:
    'Made by hand. Found by heart. Handcrafted tie-dye, leather goods, jewelry, crystals, and original art from Northern Kentucky.',
  url: SITE_URL,
  // address placeholder — update with real NAP once confirmed
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Alexandria',
    addressRegion: 'KY',
    addressCountry: 'US',
  },
  areaServed: 'Northern Kentucky',
  priceRange: '$$',
  sameAs: ['https://instagram.com/wildenflower/'],
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
