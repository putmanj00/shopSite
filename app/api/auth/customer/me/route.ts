import { NextResponse } from 'next/server';
import { customerAccountFetch, isAuthenticated } from '@/lib/customer-account';

const CUSTOMER_QUERY = `
  query {
    customer {
      id
      emailAddress {
        emailAddress
      }
      firstName
      lastName
      displayName
    }
  }
`;

interface CustomerResponse {
  customer: {
    id: string;
    emailAddress: {
      emailAddress: string;
    } | null;
    firstName: string | null;
    lastName: string | null;
    displayName: string;
  };
}

export async function GET() {
  try {
    // Check if authenticated
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { authenticated: false, customer: null },
        { status: 200 }
      );
    }

    // Fetch customer data
    const data = await customerAccountFetch<CustomerResponse>({
      query: CUSTOMER_QUERY,
    });

    return NextResponse.json({
      authenticated: true,
      customer: {
        id: data.customer.id,
        email: data.customer.emailAddress?.emailAddress || null,
        firstName: data.customer.firstName,
        lastName: data.customer.lastName,
        displayName: data.customer.displayName,
      },
    });
  } catch (error) {
    console.error('Customer fetch error:', error);

    // If authentication error, return not authenticated
    if (error instanceof Error && error.message.includes('authenticated')) {
      return NextResponse.json(
        { authenticated: false, customer: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { authenticated: false, customer: null, error: 'Failed to fetch customer' },
      { status: 200 }
    );
  }
}
