/**
 * Customer Account API order-history document + response types.
 * Validated against scripts/fixtures/customer-account.graphql by
 * scripts/customer-address.test.ts (Customer Account, not Storefront, names:
 * trackingInformation, enum latestShipmentStatus, LineItem.name).
 */

export const ORDERS_QUERY = `
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
                trackingInformation {
                  number
                  url
                }
                latestShipmentStatus
              }
            }
            totalPrice {
              amount
              currencyCode
            }
            lineItems(first: 50) {
              nodes {
                title: name
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
  } | null;
  variantTitle: string | null;
  productId: string | null;
}

export interface OrderFulfillment {
  status: string | null;
  trackingInformation: {
    number: string | null;
    url: string | null;
  }[];
  latestShipmentStatus: string | null;
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
