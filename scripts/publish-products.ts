/**
 * Script to publish all products to all sales channels
 * (Online Store, Shop, Point of Sale, My Store Headless)
 */
import dotenv from 'dotenv';
import { adminApiFetch, clearTokenCache } from '../lib/shopify-admin';

dotenv.config();

async function publishAllProducts() {
  console.log('📢 Publishing all products to all sales channels...\n');
  
  // Clear token cache to get fresh token with new scopes
  clearTokenCache();
  
  // Step 1: Get all publications (sales channels)
  const publicationsQuery = `
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
  
  const pubData = await adminApiFetch<{ 
    publications: { edges: Array<{ node: { id: string, name: string } }> } 
  }>({ query: publicationsQuery });
  
  const publications = pubData.publications.edges.map(e => e.node);
  console.log('Available Sales Channels:');
  publications.forEach(p => console.log(`  - ${p.name}: ${p.id}`));
  
  // Step 2: Get all products
  const productsQuery = `
    query GetAllProducts {
      products(first: 100) {
        edges {
          node {
            id
            title
            status
          }
        }
      }
    }
  `;
  
  const productsData = await adminApiFetch<{
    products: { edges: Array<{ node: { id: string, title: string, status: string } }> }
  }>({ query: productsQuery });
  
  const products = productsData.products.edges.map(e => e.node);
  console.log(`\n📦 Found ${products.length} products\n`);
  
  // Step 3: Publish each product to all channels
  for (const product of products) {
    console.log(`Publishing: ${product.title}...`);
    
    const publishMutation = `
      mutation PublishProduct($id: ID!, $input: [PublicationInput!]!) {
        publishablePublish(id: $id, input: $input) {
          publishable {
            ... on Product {
              id
              title
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    
    // Publish to all channels
    const input = publications.map(p => ({ publicationId: p.id }));
    
    const result = await adminApiFetch<{
      publishablePublish: { userErrors: Array<{ field: string, message: string }> }
    }>({
      query: publishMutation,
      variables: {
        id: product.id,
        input
      }
    });
    
    if (result.publishablePublish.userErrors.length > 0) {
      console.warn(`  ⚠️ Warning:`, result.publishablePublish.userErrors);
    } else {
      console.log(`  ✅ Published to ${publications.length} channels!`);
    }
  }
  
  console.log('\n✅ All products published to all sales channels!');
}

publishAllProducts().catch(console.error);
