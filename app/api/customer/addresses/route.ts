import { NextRequest, NextResponse } from 'next/server';
import { customerAccountFetch, isAuthenticated } from '@/lib/customer-account';

const ADDRESSES_QUERY = `
  query CustomerAddresses {
    customer {
      defaultAddress {
        id
        address1
        address2
        city
        province
        country
        zip
        firstName
        lastName
        phone
      }
      addresses(first: 10) {
        edges {
          node {
            id
            address1
            address2
            city
            province
            country
            zip
            firstName
            lastName
            phone
          }
        }
      }
    }
  }
`;

const CREATE_ADDRESS_MUTATION = `
  mutation CustomerAddressCreate($address: CustomerAddressInput!) {
    customerAddressCreate(address: $address) {
      customerAddress {
        id
        address1
        address2
        city
        province
        country
        zip
        firstName
        lastName
        phone
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_ADDRESS_MUTATION = `
  mutation CustomerAddressUpdate($addressId: ID!, $address: CustomerAddressInput!) {
    customerAddressUpdate(addressId: $addressId, address: $address) {
      customerAddress {
        id
        address1
        address2
        city
        province
        country
        zip
        firstName
        lastName
        phone
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const DELETE_ADDRESS_MUTATION = `
  mutation CustomerAddressDelete($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      userErrors {
        field
        message
      }
    }
  }
`;

const SET_DEFAULT_ADDRESS_MUTATION = `
  mutation CustomerDefaultAddressUpdate($addressId: ID!) {
    customerDefaultAddressUpdate(addressId: $addressId) {
      customer {
        defaultAddress {
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

export interface CustomerAddress {
  id: string;
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  zip: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}

interface AddressesResponse {
  customer: {
    defaultAddress: CustomerAddress | null;
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
    userErrors: { field: string[]; message: string }[];
  };
}

interface UpdateAddressResponse {
  customerAddressUpdate: {
    customerAddress: CustomerAddress | null;
    userErrors: { field: string[]; message: string }[];
  };
}

interface DeleteAddressResponse {
  customerAddressDelete: {
    deletedAddressId: string | null;
    userErrors: { field: string[]; message: string }[];
  };
}

interface SetDefaultAddressResponse {
  customerDefaultAddressUpdate: {
    customer: {
      defaultAddress: { id: string } | null;
    } | null;
    userErrors: { field: string[]; message: string }[];
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
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
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

    const body = await request.json();
    const { action, addressId, address } = body;

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

      if (data.customerDefaultAddressUpdate.userErrors.length > 0) {
        return NextResponse.json(
          { error: data.customerDefaultAddressUpdate.userErrors[0].message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        defaultAddressId: data.customerDefaultAddressUpdate.customer?.defaultAddress?.id,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Address operation error:', error);
    return NextResponse.json(
      { error: 'Failed to perform address operation' },
      { status: 500 }
    );
  }
}
