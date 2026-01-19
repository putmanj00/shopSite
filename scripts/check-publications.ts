import dotenv from 'dotenv';
import { adminApiFetch } from '../lib/shopify-admin';

dotenv.config();

async function checkPublications() {
  // Get available publications (sales channels)
  const query = `
    query GetPublications {
      publications(first: 10) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `;
  
  const data = await adminApiFetch<{ publications: { edges: Array<{ node: { id: string, name: string } }> } }>({ query });
  console.log('Available Publications (Sales Channels):');
  data.publications.edges.forEach(e => console.log(`  - ${e.node.name}: ${e.node.id}`));
  
  // Check a product's publication status
  const productQuery = `
    query GetProducts {
      products(first: 5) {
        edges {
          node {
            id
            title
            status
            publishedAt
          }
        }
      }
    }
  `;
  
  const products = await adminApiFetch<{ products: { edges: Array<{ node: { id: string, title: string, status: string, publishedAt: string | null } }> } }>({ query: productQuery });
  console.log('\nProducts Status:');
  products.products.edges.forEach(e => console.log(`  - ${e.node.title}: status=${e.node.status}, published=${e.node.publishedAt || 'NOT PUBLISHED'}`));
}

checkPublications().catch(console.error);
