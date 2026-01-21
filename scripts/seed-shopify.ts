
import dotenv from 'dotenv';
import { adminApiFetch, getAdminAccessToken } from '../lib/shopify-admin';

// Load environment variables
dotenv.config();

const COLLECTIONS = [
  {
    title: 'Tie-Dye',
    handle: 'tie-dye',
    description: 'Vibrant, hand-dyed textiles and apparel',
    image: 'https://images.unsplash.com/photo-1527576539890-dfa815648363?w=800&q=80',
    products: [
      {
        title: 'Spiral Tie-Dye Hoodie',
        description: 'Hand-dyed spiral pattern hoodie made from organic cotton.',
        price: '65.00',
        image: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&q=80'
      },
      {
        title: 'Shibori Indigo Scarf',
        description: 'Traditional Japanese shibori dyeing technique on silk.',
        price: '45.00',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80'
      },
      {
        title: 'Rainbow Swirl Tee',
        description: 'Classic rainbow swirl design on a premium heavyweight tee.',
        price: '35.00',
        image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80'
      }
    ]
  },
  {
    title: 'Leather',
    handle: 'leather',
    description: 'Hand-tooled bags, wallets, and accessories',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    products: [
      {
        title: 'Classic Leather Tote',
        description: 'Full-grain vegetable tanned leather tote bag.',
        price: '195.00',
        image: 'https://images.unsplash.com/photo-1590874102752-e6335372208d?w=800&q=80'
      },
      {
        title: 'Minimalist Bi-Fold Wallet',
        description: 'Slim profile wallet crafted from premium saddle leather.',
        price: '55.00',
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80'
      },
      {
        title: 'Hand-Stitched Belt',
        description: 'Durable leather belt with solid brass buckle.',
        price: '45.00',
        image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&q=80'
      }
    ]
  },
  {
    title: 'Jewelry',
    handle: 'jewelry',
    description: 'Unique handcrafted pieces and gemstones',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
    products: [
      {
        title: 'Moonstone Silver Ring',
        description: 'Sterling silver ring with a glowing rainbow moonstone.',
        price: '85.00',
        image: 'https://images.unsplash.com/photo-1605100804763-ebea2401a71c?w=800&q=80'
      },
      {
        title: 'Hammered Gold Cuff',
        description: '14k gold-filled cuff bracelet with hammered texture.',
        price: '65.00',
        image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'
      },
      {
        title: 'Turquoise Drop Earrings',
        description: 'Genuine sleeping beauty turquoise stones.',
        price: '55.00',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'
      }
    ]
  },
  {
    title: 'Art',
    handle: 'art',
    description: 'Original paintings, prints, and sculptures',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80',
    products: [
      {
        title: 'Abstract Coastline Print',
        description: 'Limited edition giclee print of original oil painting.',
        price: '120.00',
        image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80'
      },
      {
        title: 'Ceramic Vase',
        description: 'Hand-thrown stoneware vase with matte glaze.',
        price: '85.00',
        image: 'https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?w=800&q=80'
      },
      {
        title: 'Wooden Sculpture',
        description: 'Carved reclaimed wood abstract form.',
        price: '250.00',
        image: 'https://images.unsplash.com/photo-1549887552-93f8efb871a2?w=800&q=80'
      }
    ]
  }
];

async function seedShopify() {
  console.log('🌱 Starting database seed...');
  
  if (!process.env.SHOPIFY_STORE_DOMAIN || !process.env.SHOPIFY_CLIENT_ID) {
    console.error('❌ Missing Shopify Admin credentials in .env');
    process.exit(1);
  }

  // Get Location ID for inventory
  const locationId = await getLocationId();
  if (!locationId) {
      console.error('❌ No location found in Shopify store. Cannot set inventory.');
      process.exit(1);
  }
  console.log(`📍 Using Location ID: ${locationId}`);

  // 1. Get existing collections to avoid duplicates
  const existingCollectionsQuery = `
    query GetCollections {
      collections(first: 50) {
        edges {
          node {
            id
            handle
            title
          }
        }
      }
    }
  `;
  
  const collectionsData = await adminApiFetch<{ collections: { edges: Array<{ node: { id: string, handle: string } }> } }>({
    query: existingCollectionsQuery
  });
  
  const existingHandles = new Set(collectionsData.collections.edges.map(e => e.node.handle));

  for (const collection of COLLECTIONS) {
    let collectionId = '';

    if (existingHandles.has(collection.handle)) {
      console.log(`ℹ️ Collection '${collection.title}' already exists.`);
      // Find ID
      collectionId = collectionsData.collections.edges.find(e => e.node.handle === collection.handle)?.node.id || '';
    } else {
      console.log(`Creating collection: ${collection.title}...`);
      const createCollectionMutation = `
        mutation CreateCollection($input: CollectionInput!) {
          collectionCreate(input: $input) {
            collection {
              id
              handle
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      
      const result = await adminApiFetch<{ collectionCreate: { collection: { id: string }, userErrors: any[] } }>({
        query: createCollectionMutation,
        variables: {
          input: {
            title: collection.title,
            handle: collection.handle,
            descriptionHtml: `<p>${collection.description}</p>`,
            image: {
                src: collection.image
            }
          }
        }
      });

      if (result.collectionCreate.userErrors.length > 0) {
        console.error(`❌ Failed to create collection ${collection.title}:`, result.collectionCreate.userErrors);
        continue;
      }
      
      collectionId = result.collectionCreate.collection.id;
      console.log(`✅ Created collection: ${collection.title}`);

      // Auto-publish collection to all channels
      const pubQuery = `query { publications(first: 10) { edges { node { id } } } }`;
      const pubData = await adminApiFetch<{ publications: { edges: Array<{ node: { id: string } }> } }>({ query: pubQuery });
      const pubInput = pubData.publications.edges.map(e => ({ publicationId: e.node.id }));
      
      const publishColMutation = `
        mutation PublishCollection($id: ID!, $input: [PublicationInput!]!) {
          publishablePublish(id: $id, input: $input) {
            userErrors { field message }
          }
        }
      `;
      await adminApiFetch({
        query: publishColMutation,
        variables: { id: collectionId, input: pubInput }
      });
      console.log(`   📢 Published collection to ${pubInput.length} channels`);
    }

    // Create Products for this Collection
    for (const product of collection.products) {
      console.log(`   Creating product: ${product.title}...`);
      
      // Step 1: Create product using productSet mutation (2026-01 API)
      // This handles product + variant creation in a single call
      const createProductMutation = `
        mutation CreateProduct($productSet: ProductSetInput!, $synchronous: Boolean!) {
          productSet(input: $productSet, synchronous: $synchronous) {
            product {
              id
              variants(first: 1) {
                edges {
                  node {
                    id
                    inventoryItem {
                      id
                    }
                  }
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      
      const productResult = await adminApiFetch<{ 
        productSet: { 
          product: { 
            id: string, 
            variants: { edges: Array<{ node: { id: string, inventoryItem: { id: string } } }> } 
          }, 
          userErrors: any[] 
        } 
      }>({
        query: createProductMutation,
        variables: {
          synchronous: true,
          productSet: {
            title: product.title,
            descriptionHtml: `<p>${product.description}</p>`,
            vendor: 'Wildenflower',
            status: 'ACTIVE',
            productOptions: [
              {
                name: 'Title',
                position: 1,
                values: [{ name: 'Default Title' }]
              }
            ],
            variants: [{
              optionValues: [{ optionName: 'Title', name: 'Default Title' }],
              price: product.price
            }]
          }
        }
      });

      if (productResult.productSet.userErrors.length > 0) {
          console.warn(`      Product creation warning/error:`, productResult.productSet.userErrors);
          continue;
      }
      
      const productId = productResult.productSet.product.id;
      console.log(`   ✅ Created product: ${product.title}`);

      // Step 2: Add product to collection
      if (collectionId) {
        const addToCollectionMutation = `
          mutation AddProductToCollection($id: ID!, $productIds: [ID!]!) {
            collectionAddProducts(id: $id, productIds: $productIds) {
              collection {
                id
              }
              userErrors {
                field
                message
              }
            }
          }
        `;
        await adminApiFetch({
          query: addToCollectionMutation,
          variables: {
            id: collectionId,
            productIds: [productId]
          }
        });
      }

      // Step 3: Add product media (image) using productCreateMedia
      const addMediaMutation = `
        mutation AddProductMedia($productId: ID!, $media: [CreateMediaInput!]!) {
          productCreateMedia(productId: $productId, media: $media) {
            media {
              ... on MediaImage {
                id
              }
            }
            mediaUserErrors {
              field
              message
            }
          }
        }
      `;
      
      const mediaResult = await adminApiFetch<{ productCreateMedia: { mediaUserErrors: any[] } }>({
        query: addMediaMutation,
        variables: {
          productId: productId,
          media: [{
            originalSource: product.image,
            mediaContentType: 'IMAGE'
          }]
        }
      });

      if (mediaResult.productCreateMedia.mediaUserErrors.length > 0) {
        console.warn(`      Media warning:`, mediaResult.productCreateMedia.mediaUserErrors);
      }

      // Step 4: Set inventory for the variant
      const variantData = productResult.productSet.product.variants.edges[0]?.node;
      if (variantData?.inventoryItem?.id && locationId) {
        const setInventoryMutation = `
          mutation SetInventoryQuantities($input: InventorySetQuantitiesInput!) {
            inventorySetQuantities(input: $input) {
              inventoryAdjustmentGroup {
                createdAt
              }
              userErrors {
                field
                message
              }
            }
          }
        `;
        
        await adminApiFetch({
          query: setInventoryMutation,
          variables: {
            input: {
              name: "available",
              reason: "correction",
              quantities: [{
                inventoryItemId: variantData.inventoryItem.id,
                locationId: locationId,
                quantity: 50
              }]
            }
          }
        });
      }

      // Step 5: Publish product to all sales channels
      const publishMutation = `
        mutation PublishProduct($id: ID!, $input: [PublicationInput!]!) {
          publishablePublish(id: $id, input: $input) {
            publishable {
              ... on Product {
                id
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      
      // Get all publication IDs and publish to all
      const publicationsQuery = `
        query GetPublications {
          publications(first: 10) {
            edges {
              node {
                id
              }
            }
          }
        }
      `;
      const pubData = await adminApiFetch<{ publications: { edges: Array<{ node: { id: string } }> } }>({ query: publicationsQuery });
      const publicationInput = pubData.publications.edges.map(e => ({ publicationId: e.node.id }));
      
      await adminApiFetch({
        query: publishMutation,
        variables: {
          id: productId,
          input: publicationInput
        }
      });
      console.log(`   📢 Published to ${publicationInput.length} sales channels`);
    }
  }

  console.log('✅ Seed completed!');
}

async function getLocationId() {
    // Helper to get primary location for inventory
    const query = `
    query {
        locations(first: 1) {
            edges {
                node {
                    id
                }
            }
        }
    }`;
    const data = await adminApiFetch<{ locations: { edges: Array<{ node: { id: string } }> } }>({ query });
    return data.locations.edges[0]?.node.id;
}

// Improved runner that gets location first
async function main() {
    try {
        await seedShopify();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();
