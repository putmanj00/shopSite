// GraphQL queries for Shopify Storefront API

// Fragment for product image data
const IMAGE_FRAGMENT = `
  fragment ImageFragment on Image {
    url
    altText
    width
    height
  }
`;

// Fragment for money data
const MONEY_FRAGMENT = `
  fragment MoneyFragment on MoneyV2 {
    amount
    currencyCode
  }
`;

// Fragment for product variant data
const VARIANT_FRAGMENT = `
  fragment VariantFragment on ProductVariant {
    id
    title
    availableForSale
    quantityAvailable
    price {
      ...MoneyFragment
    }
    compareAtPrice {
      ...MoneyFragment
    }
    selectedOptions {
      name
      value
    }
    image {
      ...ImageFragment
    }
  }
`;

// Fragment for product data
const PRODUCT_FRAGMENT = `
  fragment ProductFragment on Product {
    id
    handle
    title
    description
    descriptionHtml
    availableForSale
    priceRange {
      minVariantPrice {
        ...MoneyFragment
      }
      maxVariantPrice {
        ...MoneyFragment
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyFragment
      }
      maxVariantPrice {
        ...MoneyFragment
      }
    }
    images(first: 10) {
      edges {
        node {
          ...ImageFragment
        }
      }
    }
    variants(first: 100) {
      edges {
        node {
          ...VariantFragment
        }
      }
    }
    tags
    productType
    vendor
    createdAt
    updatedAt
  }
`;

// Query to get all products
export const GET_PRODUCTS_QUERY = `
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${VARIANT_FRAGMENT}
  ${PRODUCT_FRAGMENT}

  query getProducts($first: Int = 20, $after: String, $query: String, $sortKey: ProductSortKeys) {
    products(first: $first, after: $after, query: $query, sortKey: $sortKey) {
      edges {
        node {
          ...ProductFragment
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

// Query to get a single product by handle
export const GET_PRODUCT_BY_HANDLE_QUERY = `
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${VARIANT_FRAGMENT}
  ${PRODUCT_FRAGMENT}

  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFragment
    }
  }
`;

// Query to get all collections
export const GET_COLLECTIONS_QUERY = `
  ${IMAGE_FRAGMENT}

  query getCollections($first: Int = 20, $after: String, $sortKey: CollectionSortKeys) {
    collections(first: $first, after: $after, sortKey: $sortKey) {
      edges {
        node {
          id
          handle
          title
          description
          descriptionHtml
          image {
            ...ImageFragment
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

// Query to get a single collection by handle with products
export const GET_COLLECTION_BY_HANDLE_QUERY = `
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${VARIANT_FRAGMENT}
  ${PRODUCT_FRAGMENT}

  query getCollectionByHandle($handle: String!, $first: Int = 20, $after: String, $sortKey: ProductCollectionSortKeys) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      image {
        ...ImageFragment
      }
      products(first: $first, after: $after, sortKey: $sortKey) {
        edges {
          node {
            ...ProductFragment
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
      }
    }
  }
`;

// Query to search products
export const SEARCH_PRODUCTS_QUERY = `
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${VARIANT_FRAGMENT}
  ${PRODUCT_FRAGMENT}

  query searchProducts($query: String!, $first: Int = 20, $after: String) {
    search(query: $query, first: $first, after: $after, types: PRODUCT) {
      edges {
        node {
          ... on Product {
            ...ProductFragment
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

// Fragment for cart line data
const CART_LINE_FRAGMENT = `
  fragment CartLineFragment on CartLine {
    id
    quantity
    merchandise {
      ... on ProductVariant {
        id
        title
        availableForSale
        quantityAvailable
        price {
          ...MoneyFragment
        }
        compareAtPrice {
          ...MoneyFragment
        }
        selectedOptions {
          name
          value
        }
        image {
          ...ImageFragment
        }
        product {
          id
          handle
          title
          productType
          vendor
        }
      }
    }
    cost {
      totalAmount {
        ...MoneyFragment
      }
      amountPerQuantity {
        ...MoneyFragment
      }
    }
  }
`;

// Fragment for cart data
const CART_FRAGMENT = `
  fragment CartFragment on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        ...MoneyFragment
      }
      totalAmount {
        ...MoneyFragment
      }
      totalTaxAmount {
        ...MoneyFragment
      }
    }
    lines(first: 100) {
      edges {
        node {
          ...CartLineFragment
        }
      }
    }
  }
`;

// Mutation to create a cart
export const CREATE_CART_MUTATION = `
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${CART_LINE_FRAGMENT}
  ${CART_FRAGMENT}

  mutation createCart($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Mutation to add lines to a cart
export const ADD_TO_CART_MUTATION = `
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${CART_LINE_FRAGMENT}
  ${CART_FRAGMENT}

  mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Mutation to update lines in a cart
export const UPDATE_CART_MUTATION = `
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${CART_LINE_FRAGMENT}
  ${CART_FRAGMENT}

  mutation updateCart($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Mutation to remove lines from a cart
export const REMOVE_FROM_CART_MUTATION = `
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${CART_LINE_FRAGMENT}
  ${CART_FRAGMENT}

  mutation removeFromCart($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Query to get an existing cart
export const GET_CART_QUERY = `
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${CART_LINE_FRAGMENT}
  ${CART_FRAGMENT}

  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFragment
    }
  }
`;
