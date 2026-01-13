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


// Fragment for address data
const ADDRESS_FRAGMENT = `
  fragment AddressFragment on MailingAddress {
    id
    address1
    address2
    city
    company
    country
    firstName
    lastName
    phone
    province
    zip
  }
`;

// Fragment for order data
const ORDER_FRAGMENT = `
  fragment OrderFragment on Order {
    id
    orderNumber
    processedAt
    financialStatus
    fulfillmentStatus
    totalPrice {
      ...MoneyFragment
    }
    lineItems(first: 5) {
      edges {
        node {
          title
          quantity
          originalTotalPrice {
            ...MoneyFragment
          }
        }
      }
    }
  }
`;

// Fragment for customer data
const CUSTOMER_FRAGMENT = `
  fragment CustomerFragment on Customer {
    id
    firstName
    lastName
    displayName
    email
    phone
    acceptsMarketing
    defaultAddress {
      ...AddressFragment
    }
    addresses(first: 10) {
      edges {
        node {
          ...AddressFragment
        }
      }
    }
    orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
      edges {
        node {
          ...OrderFragment
        }
      }
    }
  }
`;

// Mutation to create a customer (register)
export const CUSTOMER_CREATE_MUTATION = `
  ${CUSTOMER_FRAGMENT}
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        ...CustomerFragment
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

// Mutation to create an access token (login)
export const CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

// Mutation to delete an access token (logout)
export const CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION = `
  mutation customerAccessTokenDelete($customerAccessToken: String!) {
    customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
      deletedAccessToken
      deletedCustomerAccessTokenId
      userErrors {
        field
        message
      }
    }
  }
`;

// Query to get customer data
export const GET_CUSTOMER_QUERY = `
  ${ADDRESS_FRAGMENT}
  ${ORDER_FRAGMENT}
  ${CUSTOMER_FRAGMENT}
  ${MONEY_FRAGMENT} 
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      ...CustomerFragment
    }
  }
`;

export const GET_ALL_PRODUCTS_HANDLES = `
  query getProductsHandles($first: Int!) {
    products(first: $first) {
      edges {
        node {
          handle
        }
      }
    }
  }
`;

export const GET_ALL_COLLECTIONS_HANDLES = `
  query getCollectionsHandles($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          handle
        }
      }
    }
  }
`;
