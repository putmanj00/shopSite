import * as dotenv from 'dotenv';
dotenv.config();

import { getShopifyClient, shopifyFetch } from './lib/shopify';
import { GET_ALL_COLLECTIONS_HANDLES, GET_PRODUCTS_QUERY, GET_PRODUCTS_FOR_SITEMAP } from './lib/shopify-queries';

async function test() {
  try {
    const data = await shopifyFetch({
      query: GET_ALL_COLLECTIONS_HANDLES,
      variables: { first: 10 }
    });
    console.log("Collections:", JSON.stringify(data, null, 2));
    
    const prodData = await shopifyFetch({
      query: GET_PRODUCTS_QUERY,
      variables: { first: 1 }
    }) as { products: { edges: unknown[] } };
    console.log("Products count:", prodData.products.edges.length);
  } catch (err) {
    console.error(err);
  }
}

test();
