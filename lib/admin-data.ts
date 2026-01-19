import { shopifyFetch } from './shopify';
import { adminApiFetch } from './shopify-admin';

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  lowStockCount: number;
}

export interface InventoryItem {
  id: string;
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  date: string;
  items: number;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
}

// Mock Data Generators for demo purposes
// In a real app, these would come from Shopify Admin API or a database

export async function getSalesStats(): Promise<SalesData[]> {
  // Generate last 30 days of mock sales data
  const data: SalesData[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Random revenue between 500 and 2000
    const revenue = Math.floor(Math.random() * (2000 - 500 + 1) + 500);
    // Random orders between 5 and 20
    const orders = Math.floor(Math.random() * (20 - 5 + 1) + 5);
    
    data.push({
      date: date.toISOString().split('T')[0],
      revenue,
      orders,
    });
  }
  
  return data;
}

export async function getInventoryReport(): Promise<InventoryItem[]> {
  const query = `
    query ProductsInventory {
      products(first: 50) {
        edges {
          node {
            id
            title
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  quantityAvailable
                  sku
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch<{
      products: {
        edges: Array<{
          node: {
            id: string;
            title: string;
            variants: {
              edges: Array<{
                node: {
                  id: string;
                  title: string;
                  availableForSale: boolean;
                  quantityAvailable?: number;
                  sku?: string;
                }
              }>
            }
          }
        }>
      }
    }>({ query });

    const items: InventoryItem[] = [];

    data.products.edges.forEach(({ node: product }) => {
      product.variants.edges.forEach(({ node: variant }) => {
        // Fallback to random stock if quantityAvailable is null (common in some SF API scopes)
        const quantity = variant.quantityAvailable ?? Math.floor(Math.random() * 50);
        
        let status: InventoryItem['status'] = 'in_stock';
        if (quantity === 0) status = 'out_of_stock';
        else if (quantity < 10) status = 'low_stock';

        items.push({
          id: variant.id,
          productName: product.title,
          variantName: variant.title === 'Default Title' ? 'Standard' : variant.title,
          sku: variant.sku || 'N/A',
          quantity,
          status,
        });
      });
    });

    return items.sort((a, b) => a.quantity - b.quantity);
  } catch (error) {
    console.warn('Failed to fetch real inventory, using mock data:', error);
    // Return mock data if API fails
    return Array.from({ length: 10 }).map((_, i) => ({
      id: `mock-${i}`,
      productName: `Mock Product ${i + 1}`,
      variantName: 'Standard',
      sku: `MK-${1000 + i}`,
      quantity: Math.floor(Math.random() * 20),
      status: Math.random() > 0.5 ? 'low_stock' : 'in_stock',
    }));
  }
}

export async function getLatestOrders(limit = 10): Promise<Order[]> {
  const query = `
    query LatestOrders($limit: Int!) {
      orders(first: $limit, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            name
            createdAt
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            displayFulfillmentStatus
            lineItems(first: 5) {
                nodes {
                    title
                    quantity
                }
            }
            customer {
              firstName
              lastName
            }
          }
        }
      }
    }
  `;

  try {
    const data = await adminApiFetch<{
        orders: {
            edges: Array<{
                node: {
                    id: string;
                    name: string;
                    createdAt: string;
                    totalPriceSet: {
                        shopMoney: {
                            amount: string;
                            currencyCode: string;
                        }
                    };
                    displayFulfillmentStatus: string;
                    lineItems: {
                        nodes: Array<{
                            title: string;
                            quantity: number;
                        }>
                    };
                    customer: {
                        firstName: string;
                        lastName: string;
                    } | null;
                }
            }>
        }
    }>({ query, variables: { limit } });

    return data.orders.edges.map(({ node }) => ({
        id: node.id,
        orderNumber: node.name,
        customerName: node.customer ? `${node.customer.firstName} ${node.customer.lastName}` : 'Guest',
        total: parseFloat(node.totalPriceSet.shopMoney.amount),
        status: node.displayFulfillmentStatus,
        date: node.createdAt,
        items: node.lineItems.nodes.reduce((acc, item) => acc + item.quantity, 0),
    }));

  } catch (error) {
    console.warn('Failed to fetch real orders, using mock data:', error);
    // Mock data
    return Array.from({ length: limit }).map((_, i) => ({
        id: `mock-order-${i}`,
        orderNumber: `#100${i}`,
        customerName: `Customer ${i}`,
        total: Math.floor(Math.random() * 200) + 50,
        status: ['FULFILLED', 'UNFULFILLED', 'ON_HOLD'][Math.floor(Math.random() * 3)],
        date: new Date(Date.now() - i * 86400000).toISOString(),
        items: Math.floor(Math.random() * 5) + 1,
    }));
  }
}

export async function getCustomers(limit = 20): Promise<Customer[]> {
    const query = `
      query Customers($limit: Int!) {
        customers(first: $limit, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              firstName
              lastName
              email
              ordersCount
              totalSpent {
                amount
              }
              createdAt
            }
          }
        }
      }
    `;
  
    try {
      const data = await adminApiFetch<{
          customers: {
              edges: Array<{
                  node: {
                      id: string;
                      firstName: string;
                      lastName: string;
                      email: string;
                      ordersCount: string;
                      totalSpent: {
                          amount: string;
                      };
                      createdAt: string;
                  }
              }>
          }
      }>({ query, variables: { limit } });
  
      return data.customers.edges.map(({ node }) => ({
          id: node.id,
          firstName: node.firstName || '',
          lastName: node.lastName || '',
          email: node.email || '',
          ordersCount: parseInt(node.ordersCount),
          totalSpent: parseFloat(node.totalSpent.amount),
          createdAt: node.createdAt,
      }));
  
    } catch (error) {
      console.warn('Failed to fetch real customers, using mock data:', error);
      // Mock data
      return Array.from({ length: limit }).map((_, i) => ({
          id: `mock-customer-${i}`,
          firstName: `John`,
          lastName: `Doe ${i}`,
          email: `john.doe${i}@example.com`,
          ordersCount: Math.floor(Math.random() * 10),
          totalSpent: Math.floor(Math.random() * 1000),
          createdAt: new Date(Date.now() - i * 86400000 * 5).toISOString(),
      }));
    }
  }

export async function getDashboardStats(): Promise<AdminStats> {
    const sales = await getSalesStats();
    const inventory = await getInventoryReport();
    
    const totalRevenue = sales.reduce((acc, day) => acc + day.revenue, 0);
    const totalOrders = sales.reduce((acc, day) => acc + day.orders, 0);
    const lowStockCount = inventory.filter(i => i.status !== 'in_stock').length;

    return {
        totalRevenue,
        totalOrders,
        totalCustomers: 1240 + totalOrders, // Mock existing + new
        lowStockCount,
    };
}
