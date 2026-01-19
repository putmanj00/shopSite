export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  imageUrl: string;
  tags: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'art-of-tie-dye',
    title: 'The Ancient Art of Tie-Dye: From Tradition to Modern Fashion',
    excerpt: 'Discover the rich history behind tie-dye techniques and how modern artisans are reinventing this colorful craft.',
    content: `
      <h2>A Splash of History</h2>
      <p>Tie-dye is more than just a 60s fashion statement. Its roots trace back to ancient Asia and Africa, where distinct techniques like Bandhani and Shibori were developed.</p>
      <h3>Shibori Techniques</h3>
      <p>The Japanese art of Shibori involves intricate folding and binding to create detailed patterns. Unlike the random bursts often associated with tie-dye, Shibori is precise and geometric.</p>
      <h2>Modern Application</h2>
      <p>Today's artisans combine these ancient methods with modern eco-friendly dyes to create sustainable, wearable art. Each piece tells a story of the maker's hand.</p>
    `,
    author: 'Sarah Chen',
    date: '2026-01-15',
    imageUrl: 'https://images.unsplash.com/photo-1598532163257-5226004963d3?q=80&w=2670&auto=format&fit=crop',
    tags: ['Tie-Dye', 'Craftsmanship', 'History'],
  },
  {
    slug: 'leather-care-guide',
    title: 'Ultimate Guide to Caring for Your Handmade Leather Goods',
    excerpt: 'Learn how to make your leather bags and wallets last a lifetime with these simple maintenance tips.',
    content: `
      <h2>Why Leather Needs Love</h2>
      <p>Leather is a natural material that evolves with time. Proper care ensures it develops a beautiful patina rather than cracking or fading.</p>
      <h3>Daily Maintenance</h3>
      <ul>
        <li>Keep it dry: Wipe away moisture immediately.</li>
        <li>Avoid extreme heat: Don't leave it in direct sunlight for prolonged periods.</li>
        <li>Clean gently: Use a soft, damp cloth for regular cleaning.</li>
      </ul>
      <h2>Conditioning</h2>
      <p>Treat your leather every 3-6 months with a high-quality leather conditioner to keep it supple and protected.</p>
    `,
    author: 'Marcus Thorne',
    date: '2026-01-10',
    imageUrl: 'https://images.unsplash.com/photo-1485303433503-491fa396b299?q=80&w=2670&auto=format&fit=crop',
    tags: ['Leather', 'Guides', 'Sustainability'],
  },
  {
    slug: 'meet-the-maker-elena',
    title: 'Meet the Maker: Elena Rodriguez on Sustainable Jewelry',
    excerpt: 'An exclusive interview with one of our top jewelry artists about her commitment to recycled metals and ethical sourcing.',
    content: `
      <h2>Passion for Sustainability</h2>
      <p>Elena Rodriguez started her journey in a small studio in Santa Fe. "I wanted to create beautiful things without adding to the world's waste," she says.</p>
      <h3>Ethical Sourcing</h3>
      <p>All stones used in Elena's collection are ethically sourced, ensuring fair wages and safe conditions for miners. The metal is 100% recycled silver and gold.</p>
      <h2>The Process</h2>
      <p>Each ring is hand-forged, meaning no two are exactly alike. This human touch gives the jewelry a soul that mass-produced items lack.</p>
    `,
    author: 'James Putman',
    date: '2026-01-05',
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2670&auto=format&fit=crop',
    tags: ['Jewelry', 'Interviews', 'Artisan Spotlight'],
  },
];
