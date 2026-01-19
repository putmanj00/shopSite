import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/shopify-helpers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '5', 10);

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ results: [] });
  }

  try {
    const data = await searchProducts(query, { first: limit });
    
    // Transform formatting for frontend
    const results = data.products.edges.map(({ node }) => ({
      id: node.id,
      handle: node.handle,
      title: node.title,
      price: parseFloat(node.priceRange.minVariantPrice.amount),
      currencyCode: node.priceRange.minVariantPrice.currencyCode,
      image: node.images.edges[0]?.node?.url || null,
      imageAlt: node.images.edges[0]?.node?.altText || null,
      category: node.productType,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Predictive search error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    );
  }
}
