/**
 * Customer Account API address documents + the server-side form → input mapper.
 *
 * The Customer Account API is NOT the Storefront API: addresses use
 * `zoneCode` / `territoryCode` (ISO codes) and `phoneNumber` (E.164), and
 * there is no `customerDefaultAddressUpdate` — the default is set with
 * `customerAddressUpdate(defaultAddress: true)`. Every document here is
 * validated against scripts/fixtures/customer-account.graphql by
 * scripts/customer-address.test.ts.
 */

const ADDRESS_FIELDS = `
  id
  firstName
  lastName
  address1
  address2
  city
  province
  zoneCode
  country
  territoryCode
  zip
  phoneNumber
`;

export const ADDRESSES_QUERY = `
  query CustomerAddresses {
    customer {
      defaultAddress {
        id
      }
      addresses(first: 10) {
        edges {
          node {${ADDRESS_FIELDS}}
        }
      }
    }
  }
`;

const USER_ERRORS = `
  userErrors {
    field
    message
  }
`;

export const CREATE_ADDRESS_MUTATION = `
  mutation CustomerAddressCreate($address: CustomerAddressInput!) {
    customerAddressCreate(address: $address) {
      customerAddress {${ADDRESS_FIELDS}}
      ${USER_ERRORS}
    }
  }
`;

export const UPDATE_ADDRESS_MUTATION = `
  mutation CustomerAddressUpdate($addressId: ID!, $address: CustomerAddressInput!) {
    customerAddressUpdate(addressId: $addressId, address: $address) {
      customerAddress {${ADDRESS_FIELDS}}
      ${USER_ERRORS}
    }
  }
`;

export const DELETE_ADDRESS_MUTATION = `
  mutation CustomerAddressDelete($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      ${USER_ERRORS}
    }
  }
`;

export const SET_DEFAULT_ADDRESS_MUTATION = `
  mutation CustomerAddressSetDefault($addressId: ID!) {
    customerAddressUpdate(addressId: $addressId, defaultAddress: true) {
      customerAddress {
        id
      }
      ${USER_ERRORS}
    }
  }
`;

export interface CustomerAddress {
  id: string;
  firstName: string | null;
  lastName: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  zoneCode: string | null;
  country: string | null;
  territoryCode: string | null;
  zip: string | null;
  phoneNumber: string | null;
}

/** Shape of CustomerAddressInput fields we send. */
export interface CustomerAddressInput {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  zoneCode: string;
  territoryCode: string;
  zip: string;
  phoneNumber?: string;
}

export type MapResult =
  | { ok: true; input: CustomerAddressInput }
  | { ok: false; error: string };

// US states, DC and inhabited territories Shopify accepts as US zones.
const US_ZONES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois',
  IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
  ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan',
  MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana',
  NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
  OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota',
  TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia',
  WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  PR: 'Puerto Rico', GU: 'Guam', VI: 'U.S. Virgin Islands',
  AS: 'American Samoa', MP: 'Northern Mariana Islands',
  AA: 'Armed Forces Americas', AE: 'Armed Forces Europe', AP: 'Armed Forces Pacific',
};
const US_ZONE_BY_NAME = new Map(
  Object.entries(US_ZONES).map(([code, name]) => [name.toLowerCase(), code]),
);
const US_COUNTRY_ALIASES = new Set(['us', 'usa', 'united states', 'united states of america']);

/** Two-letter US zone code for a state code or name, else null. */
export function usZoneCode(value: string): string | null {
  const v = value.trim();
  const upper = v.toUpperCase();
  if (US_ZONES[upper]) return upper;
  return US_ZONE_BY_NAME.get(v.toLowerCase()) ?? null;
}

/** Display name for a US zone code (form prefill), falling back to the input. */
export function usZoneName(code: string | null | undefined): string {
  if (!code) return '';
  return US_ZONES[code.toUpperCase()] ?? code;
}

function toE164(raw: string): string | null {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('+')) return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return null;
}

const REQUIRED = {
  firstName: 'First name',
  lastName: 'Last name',
  address1: 'Address line 1',
  city: 'City',
  province: 'State',
  zip: 'ZIP code',
  country: 'Country',
} as const;
const OPTIONAL = ['address2', 'phone'] as const;

/**
 * Allowlist-map the address form body into CustomerAddressInput. Never
 * forwards raw client objects.
 *
 * simple: US addresses only (state + ZIP validation); upgrade to a country
 * select + per-country zone list if the store enables international shipping.
 * simple: blank phone is omitted, so an update can't clear a saved phone;
 * upgrade to sending phoneNumber: null on update if customers ask for that.
 */
export function toCustomerAddressInput(body: unknown): MapResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Address is required.' };
  }
  const src = body as Record<string, unknown>;
  const v: Record<string, string> = {};
  for (const key of [...Object.keys(REQUIRED), ...OPTIONAL]) {
    const raw = src[key];
    if (raw === undefined || raw === null) {
      v[key] = '';
      continue;
    }
    if (typeof raw !== 'string') return { ok: false, error: `Invalid value for ${key}.` };
    v[key] = raw.trim();
  }
  for (const [key, label] of Object.entries(REQUIRED)) {
    if (!v[key]) return { ok: false, error: `${label} is required.` };
  }

  if (!US_COUNTRY_ALIASES.has(v.country.toLowerCase())) {
    return { ok: false, error: 'Saved addresses support United States addresses only for now.' };
  }
  const zoneCode = usZoneCode(v.province);
  if (!zoneCode) return { ok: false, error: 'Enter a valid US state (e.g. KY or Kentucky).' };
  if (!/^\d{5}(-\d{4})?$/.test(v.zip)) {
    return { ok: false, error: 'Enter a valid ZIP code (e.g. 40202).' };
  }

  const input: CustomerAddressInput = {
    firstName: v.firstName,
    lastName: v.lastName,
    address1: v.address1,
    address2: v.address2,
    city: v.city,
    zoneCode,
    territoryCode: 'US',
    zip: v.zip,
  };
  if (v.phone) {
    const phoneNumber = toE164(v.phone);
    if (!phoneNumber) {
      return { ok: false, error: 'Enter a valid phone number, e.g. (502) 555-0100.' };
    }
    input.phoneNumber = phoneNumber;
  }
  return { ok: true, input };
}
