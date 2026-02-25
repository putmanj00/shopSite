export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const FAQ_CATEGORIES = ['All', 'Getting Started', 'Shipping', 'Makers', 'Returns'] as const;

export const faqItems: FaqItem[] = [
  {
    id: '1',
    question: 'What makes Wildenflower products unique?',
    answer: 'Every item in our shop is handcrafted by independent artisans who pour their hearts into their work. We personally vet each maker to ensure quality, authenticity, and ethical practices. No mass production — just genuine craftsmanship.',
    category: 'Getting Started',
  },
  {
    id: '2',
    question: 'How do I know which size to choose?',
    answer: 'Each product listing includes detailed measurements and a size guide. If you are between sizes, we recommend sizing up for a comfortable fit. You can also reach out to us directly and we will help you find the perfect fit.',
    category: 'Getting Started',
  },
  {
    id: '3',
    question: 'How long does shipping take?',
    answer: 'Standard shipping takes 5–7 business days within the US. Express shipping (2–3 business days) is available at checkout. International orders typically arrive within 10–14 business days. Because many items are made to order, please allow an additional 3–5 days for crafting.',
    category: 'Shipping',
  },
  {
    id: '4',
    question: 'Do you ship internationally?',
    answer: 'Yes! We ship to over 40 countries. International shipping rates and delivery times vary by destination. Customs duties and taxes may apply and are the responsibility of the buyer.',
    category: 'Shipping',
  },
  {
    id: '5',
    question: 'Who are your makers?',
    answer: 'Our makers are independent artisans from around the world — ceramicists, weavers, woodworkers, jewelers, and more. We build long-term relationships with each maker and ensure they receive fair compensation. You can learn more about individual makers on each product page.',
    category: 'Makers',
  },
  {
    id: '6',
    question: 'What is your return policy?',
    answer: 'We offer a 30-day return policy for unused items in their original packaging. Handmade items may have slight variations that are part of their charm and are not considered defects. If you receive a damaged item, contact us within 48 hours for a full refund or replacement.',
    category: 'Returns',
  },
  {
    id: '7',
    question: 'Can I exchange an item?',
    answer: 'Absolutely! We are happy to help with exchanges. Simply initiate a return and place a new order for the item you would like. If you need help choosing, our team is always available to assist.',
    category: 'Returns',
  },
];
