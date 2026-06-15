'use client';

import Image from 'next/image';
import Link from 'next/link';
import Price from '@/components/price';

interface EarlyAccessProduct {
  id: string;
  handle: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  price: string;
  currencyCode: string;
  launchDate: string;
}

interface EarlyAccessSectionProps {
  products?: EarlyAccessProduct[];
  isMember?: boolean;
}

// Mock early access products
const mockProducts: EarlyAccessProduct[] = [
  {
    id: '1',
    handle: 'summer-collection-preview',
    title: 'Summer Collection Preview',
    imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop',
    imageAlt: 'Summer collection clothing',
    price: '89.00',
    currencyCode: 'USD',
    launchDate: '2026-02-01',
  },
  {
    id: '2',
    handle: 'limited-edition-leather-tote',
    title: 'Limited Edition Leather Tote',
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',
    imageAlt: 'Limited edition leather bag',
    price: '249.00',
    currencyCode: 'USD',
    launchDate: '2026-01-25',
  },
];

function formatLaunchDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Available now!';
  if (diffDays === 1) return 'Launching tomorrow';
  if (diffDays <= 7) return `Launching in ${diffDays} days`;

  return `Launches ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

export default function EarlyAccessSection({
  products = mockProducts,
  isMember = true,
}: EarlyAccessSectionProps) {
  if (!isMember) {
    return (
      <div className="bg-gradient-to-r from-primary-50 to-[#F5EDD6] border border-primary-200 rounded-lg p-6 text-center">
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">Unlock Early Access</h3>
        <p className="text-sm text-gray-600 mb-4">
          Join our loyalty program to get exclusive early access to new products before they launch.
        </p>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          Learn More
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="font-medium text-gray-900 mb-1">No early access items right now</h3>
        <p className="text-sm text-gray-500">
          Check back soon for exclusive previews of upcoming products!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
          </svg>
          Member Exclusive
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.handle}`}
            className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-primary-300 transition-colors"
          >
            <div className="aspect-[4/3] relative bg-gray-100">
              <Image
                src={product.imageUrl}
                alt={product.imageAlt}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div className="absolute top-2 left-2">
                <span className="inline-block px-2 py-1 bg-black/80 text-white text-xs font-medium rounded">
                  Early Access
                </span>
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                {product.title}
              </h4>
              <div className="flex justify-between items-center mt-2">
                <p className="font-semibold text-gray-900">
                  <Price amount={product.price} currencyCode={product.currencyCode} />
                </p>
                <p className="text-sm text-primary-600 font-medium">
                  {formatLaunchDate(product.launchDate)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
