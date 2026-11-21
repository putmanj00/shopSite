import { NextRequest, NextResponse } from 'next/server';
import { customerAccountFetch, isAuthenticated } from '@/lib/customer-account';
import {
  ADDRESSES_QUERY,
  CREATE_ADDRESS_MUTATION,
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  SET_DEFAULT_ADDRESS_MUTATION,
  toCustomerAddressInput,
  type CustomerAddress,
} from '@/lib/customer-address';

export type { CustomerAddress };

type UserError = { field: string[] | null; message: string };

/** Auth failures from customerAccountFetch become 401 so the UI can re-sign-in. */
function errorResponse(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : '';
  if (message === 'Not authenticated' || message === 'Authentication expired') {
    return NextResponse.json({ error: 'Your session has expired. Please sign in again.' }, { status: 401 });
  }
  return NextResponse.json({ error: fallback }, { status: 500 });
}

interface AddressesResponse {
  customer: {
    defaultAddress: { id: string } | null;
    addresses: {
      edges: {
        node: CustomerAddress;
      }[];
    };
  };
}

interface CreateAddressResponse {
  customerAddressCreate: {
    customerAddress: CustomerAddress | null;
    userErrors: UserError[];
  };
}

interface UpdateAddressResponse {
  customerAddressUpdate: {
    customerAddress: CustomerAddress | null;
    userErrors: UserError[];
  };
}

interface DeleteAddressResponse {
  customerAddressDelete: {
    deletedAddressId: string | null;
    userErrors: UserError[];
  };
}

interface SetDefaultAddressResponse {
  customerAddressUpdate: {
    customerAddress: { id: string } | null;
    userErrors: UserError[];
  };
}

export async function GET() {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const data = await customerAccountFetch<AddressesResponse>({
      query: ADDRESSES_QUERY,
    });

    const addresses = data.customer.addresses.edges.map((edge) => edge.node);
    const defaultAddressId = data.customer.defaultAddress?.id || null;

    return NextResponse.json({
      addresses,
      defaultAddressId,
    });
  } catch (error) {
    console.error('Addresses fetch error:', error);
    return errorResponse(error, 'We couldn\'t load your addresses. Please try again.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const { action, addressId } = body as { action?: unknown; addressId?: unknown };
    if (addressId !== undefined && addressId !== null && typeof addressId !== 'string') {
      return NextResponse.json({ error: 'Invalid address ID' }, { status: 400 });
    }

    let address = null;
    if (action === 'create' || action === 'update') {
      const mapped = toCustomerAddressInput((body as { address?: unknown }).address);
      if (!mapped.ok) {
        return NextResponse.json({ error: mapped.error }, { status: 400 });
      }
      address = mapped.input;
    }

    if (action === 'create') {
      const data = await customerAccountFetch<CreateAddressResponse>({
        query: CREATE_ADDRESS_MUTATION,
        variables: { address },
      });

      if (data.customerAddressCreate.userErrors.length > 0) {
        return NextResponse.json(
          { error: data.customerAddressCreate.userErrors[0].message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        address: data.customerAddressCreate.customerAddress,
      });
    }

    if (action === 'update') {
      if (!addressId) {
        return NextResponse.json(
          { error: 'Address ID required' },
          { status: 400 }
        );
      }

      const data = await customerAccountFetch<UpdateAddressResponse>({
        query: UPDATE_ADDRESS_MUTATION,
        variables: { addressId, address },
      });

      if (data.customerAddressUpdate.userErrors.length > 0) {
        return NextResponse.json(
          { error: data.customerAddressUpdate.userErrors[0].message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        address: data.customerAddressUpdate.customerAddress,
      });
    }

    if (action === 'delete') {
      if (!addressId) {
        return NextResponse.json(
          { error: 'Address ID required' },
          { status: 400 }
        );
      }

      const data = await customerAccountFetch<DeleteAddressResponse>({
        query: DELETE_ADDRESS_MUTATION,
        variables: { addressId },
      });

      if (data.customerAddressDelete.userErrors.length > 0) {
        return NextResponse.json(
          { error: data.customerAddressDelete.userErrors[0].message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        deletedAddressId: data.customerAddressDelete.deletedAddressId,
      });
    }

    if (action === 'setDefault') {
      if (!addressId) {
        return NextResponse.json(
          { error: 'Address ID required' },
          { status: 400 }
        );
      }

      const data = await customerAccountFetch<SetDefaultAddressResponse>({
        query: SET_DEFAULT_ADDRESS_MUTATION,
        variables: { addressId },
      });

      if (data.customerAddressUpdate.userErrors.length > 0) {
        return NextResponse.json(
          { error: data.customerAddressUpdate.userErrors[0].message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        defaultAddressId: data.customerAddressUpdate.customerAddress?.id ?? addressId,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Address operation error:', error);
    return errorResponse(error, 'We couldn\'t save that change. Please try again.');
  }
}
