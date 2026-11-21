import { NextResponse } from 'next/server';
import { customerAccountFetch, isAuthenticated } from '@/lib/customer-account';
import { ORDERS_QUERY, type Order } from '@/lib/customer-orders';

export type { Order, OrderFulfillment, OrderLineItem } from '@/lib/customer-orders';

interface OrdersResponse {
  customer: {
    orders: {
      edges: {
        node: Order;
      }[];
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
  };
}

export async function GET(request: Request) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const data = await customerAccountFetch<OrdersResponse>({
      query: ORDERS_QUERY,
      variables: { first: Math.min(limit, 50) },
    });

    const orders = data.customer.orders.edges.map((edge) => edge.node);

    return NextResponse.json({
      orders,
      hasNextPage: data.customer.orders.pageInfo.hasNextPage,
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
