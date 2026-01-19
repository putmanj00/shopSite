import { NextResponse } from 'next/server';
import { customerAccountFetch, isAuthenticated } from '@/lib/customer-account';

const ORDERS_QUERY = `
  query CustomerOrders($first: Int!) {
    customer {
      orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            number
            processedAt
            financialStatus
            fulfillments(first: 10) {
              nodes {
                status
                trackingInfo(first: 5) {
                  number
                  url
                }
                latestShipmentStatus {
                  status
                }
              }
            }
            totalPrice {
              amount
              currencyCode
            }
            lineItems(first: 50) {
              nodes {
                title
                quantity
                image {
                  url
                  altText
                }
                price {
                  amount
                  currencyCode
                }
                variantTitle
                productId
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export interface OrderLineItem {
  title: string;
  quantity: number;
  image: {
    url: string;
    altText: string | null;
  } | null;
  price: {
    amount: string;
    currencyCode: string;
  };
  variantTitle: string | null;
  productId: string | null;
}

export interface OrderFulfillment {
  status: string;
  trackingInfo: {
    number: string;
    url: string;
  }[];
  latestShipmentStatus: {
    status: string;
  } | null;
}

export interface Order {
  id: string;
  number: number;
  processedAt: string;
  financialStatus: string;
  fulfillments: {
    nodes: OrderFulfillment[];
  };
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
  lineItems: {
    nodes: OrderLineItem[];
  };
}

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
