/**
 * Contract test for the account address book (lib/customer-address.ts).
 *
 * Validates every Customer Account API document we send, and the variables
 * the server builds from the address form, against a schema snapshot
 * (scripts/fixtures/customer-account.graphql). Mocked e2e can't catch
 * a schema mismatch: the 11-21 "address save throws" bug shipped that way
 * (Storefront-style province/country/phone sent as CustomerAddressInput).
 *
 * Self-contained tsx style of the other scripts/*.test.ts files.
 * Run: npm run test:customer-address
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  buildSchema,
  getVariableValues,
  Kind,
  parse,
  validate,
  type OperationDefinitionNode,
} from 'graphql';
import {
  ADDRESSES_QUERY,
  CREATE_ADDRESS_MUTATION,
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  SET_DEFAULT_ADDRESS_MUTATION,
  toCustomerAddressInput,
} from '../lib/customer-address';
import { ORDERS_QUERY } from '../lib/customer-orders';

const schema = buildSchema(
  readFileSync(path.join(__dirname, 'fixtures/customer-account.graphql'), 'utf8'),
);

let passed = 0;

function operation(doc: string, label: string): OperationDefinitionNode {
  const ast = parse(doc);
  const errors = validate(schema, ast);
  assert.deepEqual(
    errors.map((e) => e.message),
    [],
    `${label}: document must validate against the Customer Account schema`,
  );
  const op = ast.definitions.find((d) => d.kind === Kind.OPERATION_DEFINITION);
  assert.ok(op, `${label}: has an operation`);
  passed++;
  return op as OperationDefinitionNode;
}

function assertVariablesValid(op: OperationDefinitionNode, vars: Record<string, unknown>, label: string) {
  const result = getVariableValues(schema, op.variableDefinitions ?? [], vars);
  const errors = 'errors' in result && result.errors ? result.errors.map((e) => e.message) : [];
  assert.deepEqual(errors, [], `${label}: variables must coerce to the schema input types`);
  passed++;
}

// 1. Every document we send is valid against the schema.
operation(ADDRESSES_QUERY, 'addresses query');
const createOp = operation(CREATE_ADDRESS_MUTATION, 'create mutation');
const updateOp = operation(UPDATE_ADDRESS_MUTATION, 'update mutation');
operation(DELETE_ADDRESS_MUTATION, 'delete mutation');
const setDefaultOp = operation(SET_DEFAULT_ADDRESS_MUTATION, 'set-default mutation');
const ordersOp = operation(ORDERS_QUERY, 'orders query');
assertVariablesValid(ordersOp, { first: 10 }, 'orders page size');

// 2. What the address-book form actually posts → valid CustomerAddressInput.
const form = {
  firstName: ' Ada ',
  lastName: 'Lovelace',
  address1: '1 Main St',
  address2: '',
  city: 'Louisville',
  province: 'Kentucky',
  country: 'United States',
  zip: '40202',
  phone: '(502) 555-0100',
};
const mapped = toCustomerAddressInput(form);
assert.ok(mapped.ok, 'realistic form maps');
if (mapped.ok) {
  assertVariablesValid(createOp, { address: mapped.input }, 'create from form');
  assertVariablesValid(updateOp, { addressId: 'gid://shopify/CustomerAddress/1', address: mapped.input }, 'update from form');
  assert.deepEqual(
    mapped.input,
    {
      firstName: 'Ada',
      lastName: 'Lovelace',
      address1: '1 Main St',
      address2: '',
      city: 'Louisville',
      zoneCode: 'KY',
      territoryCode: 'US',
      zip: '40202',
      phoneNumber: '+15025550100',
    },
    'form fields map to Customer Account names, trimmed, ISO codes, E.164 phone',
  );
  passed++;
}

// 3. Set-default goes through customerAddressUpdate(defaultAddress: true).
assertVariablesValid(setDefaultOp, { addressId: 'gid://shopify/CustomerAddress/1' }, 'set default');

// 4. Allowlist: unknown/hostile client keys never reach Shopify.
const hostile = toCustomerAddressInput({ ...form, defaultAddress: true, __proto__x: 1, company: 'X', id: 'gid://x' });
assert.ok(hostile.ok);
if (hostile.ok) {
  assert.deepEqual(
    Object.keys(hostile.input).sort(),
    ['address1', 'address2', 'city', 'firstName', 'lastName', 'phoneNumber', 'territoryCode', 'zip', 'zoneCode'],
    'only allowlisted keys forwarded',
  );
  passed++;
}

// 5. Input normalisation cases.
const ok = (overrides: Record<string, unknown>) => {
  const r = toCustomerAddressInput({ ...form, ...overrides });
  assert.ok(r.ok, `expected ok for ${JSON.stringify(overrides)}: ${r.ok ? '' : r.error}`);
  return r.ok ? r.input : ({} as Record<string, unknown>);
};
const bad = (overrides: Record<string, unknown>, label: string) => {
  const r = toCustomerAddressInput({ ...form, ...overrides });
  assert.equal(r.ok, false, `expected error: ${label}`);
  if (!r.ok) assert.ok(r.error.length > 0, `${label}: has a message`);
  passed++;
};

assert.equal(ok({ province: 'ky' }).zoneCode, 'KY', 'state code lower-case'); passed++;
assert.equal(ok({ province: 'new york' }).zoneCode, 'NY', 'multi-word state name'); passed++;
assert.equal(ok({ province: 'District of Columbia' }).zoneCode, 'DC', 'DC'); passed++;
assert.equal(ok({ country: 'US' }).territoryCode, 'US', 'ISO country'); passed++;
assert.equal(ok({ country: 'USA' }).territoryCode, 'US', 'USA alias'); passed++;
assert.equal(ok({ phone: '' }).phoneNumber, undefined, 'blank phone omitted'); passed++;
assert.equal(ok({ phone: '502-555-0100' }).phoneNumber, '+15025550100', 'dashed US phone'); passed++;
assert.equal(ok({ phone: '1 502 555 0100' }).phoneNumber, '+15025550100', 'leading 1'); passed++;
assert.equal(ok({ phone: '+44 20 7946 0958' }).phoneNumber, '+442079460958', 'international E.164'); passed++;
assert.equal(ok({ zip: ' 40202-1234 ' }).zip, '40202-1234', 'zip trimmed'); passed++;

bad({ province: 'Narnia' }, 'unknown US state');
bad({ country: 'France' }, 'non-US country (store ships US only)');
bad({ phone: '555-0100' }, 'too-short phone');
bad({ firstName: '   ' }, 'blank required field');
bad({ zip: 'abcde' }, 'non-numeric US zip');
assert.equal(toCustomerAddressInput(null).ok, false, 'null body'); passed++;
assert.equal(toCustomerAddressInput('x').ok, false, 'string body'); passed++;
assert.equal(toCustomerAddressInput({ ...form, city: 42 }).ok, false, 'non-string field'); passed++;

console.log(`customer-address contract: ${passed} assertions passed`);
