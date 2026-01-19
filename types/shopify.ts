// Shopify Storefront API Type Definitions

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number;
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  image: ShopifyImage | null;
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  compareAtPriceRange: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  images: {
    edges: {
      node: ShopifyImage;
    }[];
  };
  variants: {
    edges: {
      node: ShopifyProductVariant;
    }[];
  };
  tags: string[];
  productType: string;
  vendor: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  image: ShopifyImage | null;
  products: {
    edges: {
      node: ShopifyProduct;
    }[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: ShopifyMoney;
    totalAmount: ShopifyMoney;
    totalTaxAmount: ShopifyMoney | null;
  };
  lines: {
    edges: {
      node: ShopifyCartLine;
    }[];
  };
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: ShopifyProductVariant & {
    product: {
      id: string;
      handle: string;
      title: string;
      productType: string;
      vendor: string;
    };
  };
  cost: {
    totalAmount: ShopifyMoney;
    amountPerQuantity: ShopifyMoney;
  };
}

export interface ShopifyMailingAddress {
  id: string;
  address1: string | null;
  address2: string | null;
  city: string | null;
  company: string | null;
  country: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  province: string | null;
  zip: string | null;
}

export interface ShopifyOrder {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPrice: ShopifyMoney;
  lineItems: {
    edges: {
      node: {
        title: string;
        quantity: number;
        originalTotalPrice: ShopifyMoney;
      };
    }[];
  };
}

export interface ShopifyCustomer {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  phone: string | null;
  acceptsMarketing: boolean;
  createdAt: string;
  updatedAt: string;
  defaultAddress: ShopifyMailingAddress | null;
  addresses: {
    edges: {
      node: ShopifyMailingAddress;
    }[];
  };
  orders: {
    edges: {
      node: ShopifyOrder;
    }[];
  };
}

// GraphQL Response Types
export interface ProductsQueryResponse {
  products: {
    edges: {
      node: ShopifyProduct;
    }[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface SearchQueryResponse {
  search: {
    edges: {
      node: ShopifyProduct;
    }[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface ProductQueryResponse {
  product: ShopifyProduct | null;
}

export interface CollectionsQueryResponse {
  collections: {
    edges: {
      node: ShopifyCollection;
    }[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface CollectionQueryResponse {
  collection: ShopifyCollection | null;
}

export interface CartQueryResponse {
  cart: ShopifyCart | null;
}

export interface CartMutationResponse {
  cart: ShopifyCart;
  userErrors: {
    field: string[];
    message: string;
  }[];
}

// Auth Types
export interface ShopifyCustomerAccessToken {
  accessToken: string;
  expiresAt: string;
}



export interface CustomerCreatePayload {
  customer: ShopifyCustomer | null;
  customerUserErrors: {
    code: string;
    field: string[];
    message: string;
  }[];
}

export interface CustomerAccessTokenCreatePayload {
  customerAccessToken: ShopifyCustomerAccessToken | null;
  customerUserErrors: {
    code: string;
    field: string[];
    message: string;
  }[];
}

export interface CustomerAccessTokenDeletePayload {
  deletedAccessToken: string | null;
  deletedCustomerAccessTokenId: string | null;
  userErrors: {
    field: string[];
    message: string;
  }[];
}

export interface CustomerQueryResponse {
  customer: ShopifyCustomer | null;
}

