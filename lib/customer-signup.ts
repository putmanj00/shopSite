/**
 * Newsletter + back-in-stock signups → Shopify customers (Admin API).
 *
 * Upsert by email: look the customer up with customerByIdentifier (exact match,
 * no search-index lag, no search-query injection); create if missing, else add
 * tags (+ marketing consent for newsletter). Callers must return the same
 * response whether or not the email already existed (no account enumeration).
 *
 * The Admin fetcher is injected so the upsert decision is unit-testable
 * (scripts/customer-signup.test.ts). Requires read_customers + write_customers.
 */

export type AdminFetch = <T>(args: {
  query: string;
  variables?: Record<string, unknown>;
}) => Promise<T>;

interface UserError {
  field?: string[] | null;
  message: string;
}

export const MAX_EMAIL_LENGTH = 254;

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const email = raw.trim();
  if (!email || email.length > MAX_EMAIL_LENGTH) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

/** `gid://shopify/ProductVariant/123` or `123` → `123`; anything else → null. */
export function numericShopifyId(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const m = /^(?:gid:\/\/shopify\/[A-Za-z]+\/)?(\d{1,20})$/.exec(raw.trim());
  return m ? m[1] : null;
}

export const NEWSLETTER_TAG = 'newsletter';
export const backInStockTag = (variantNumericId: string) => `back-in-stock:${variantNumericId}`;

export const CUSTOMER_LOOKUP = /* GraphQL */ `
  query CustomerByEmail($email: String!) {
    customerByIdentifier(identifier: { emailAddress: $email }) { id }
  }
`;

export const CUSTOMER_CREATE = /* GraphQL */ `
  mutation CustomerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer { id }
      userErrors { field message }
    }
  }
`;

export const TAGS_ADD = /* GraphQL */ `
  mutation TagsAdd($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) {
      userErrors { field message }
    }
  }
`;

export const CONSENT_UPDATE = /* GraphQL */ `
  mutation ConsentUpdate($input: CustomerEmailMarketingConsentUpdateInput!) {
    customerEmailMarketingConsentUpdate(input: $input) {
      userErrors { field message }
    }
  }
`;

const SUBSCRIBED_SINGLE_OPT_IN = {
  marketingState: 'SUBSCRIBED',
  marketingOptInLevel: 'SINGLE_OPT_IN',
} as const;

function assertNoUserErrors(op: string, errors: UserError[] | undefined) {
  if (errors && errors.length > 0) {
    throw new Error(`${op} failed: ${errors.map((e) => e.message).join('; ')}`);
  }
}

async function lookupCustomerId(fetchAdmin: AdminFetch, email: string): Promise<string | null> {
  const data = await fetchAdmin<{ customerByIdentifier: { id: string } | null }>({
    query: CUSTOMER_LOOKUP,
    variables: { email },
  });
  return data.customerByIdentifier?.id ?? null;
}

async function updateExisting(
  fetchAdmin: AdminFetch,
  id: string,
  tags: string[],
  subscribe: boolean
) {
  const tagged = await fetchAdmin<{ tagsAdd: { userErrors: UserError[] } }>({
    query: TAGS_ADD,
    variables: { id, tags },
  });
  assertNoUserErrors('tagsAdd', tagged.tagsAdd?.userErrors);

  if (subscribe) {
    const consent = await fetchAdmin<{
      customerEmailMarketingConsentUpdate: { userErrors: UserError[] };
    }>({
      query: CONSENT_UPDATE,
      variables: {
        input: { customerId: id, emailMarketingConsent: SUBSCRIBED_SINGLE_OPT_IN },
      },
    });
    assertNoUserErrors(
      'customerEmailMarketingConsentUpdate',
      consent.customerEmailMarketingConsentUpdate?.userErrors
    );
  }
}

/**
 * Create-or-update a customer. `subscribe` = set email marketing consent to
 * SUBSCRIBED (newsletter); back-in-stock passes false (transactional request,
 * consent untouched). Throws on any Admin API / userErrors failure.
 */
export async function upsertSignupCustomer(
  fetchAdmin: AdminFetch,
  { email, tags, subscribe }: { email: string; tags: string[]; subscribe: boolean }
): Promise<void> {
  const existingId = await lookupCustomerId(fetchAdmin, email);
  if (existingId) {
    await updateExisting(fetchAdmin, existingId, tags, subscribe);
    return;
  }

  const created = await fetchAdmin<{
    customerCreate: { customer: { id: string } | null; userErrors: UserError[] };
  }>({
    query: CUSTOMER_CREATE,
    variables: {
      input: {
        email,
        tags,
        ...(subscribe ? { emailMarketingConsent: SUBSCRIBED_SINGLE_OPT_IN } : {}),
      },
    },
  });

  const errors = created.customerCreate?.userErrors ?? [];
  if (errors.length === 0 && created.customerCreate?.customer?.id) return;

  // Concurrent signup may have created the customer between lookup and create
  // (UserError has no code field, so re-check rather than match the message).
  const racedId = await lookupCustomerId(fetchAdmin, email);
  if (racedId) {
    await updateExisting(fetchAdmin, racedId, tags, subscribe);
    return;
  }
  assertNoUserErrors('customerCreate', errors.length ? errors : [{ message: 'no customer returned' }]);
}
