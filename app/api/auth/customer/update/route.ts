import { NextRequest, NextResponse } from 'next/server';
import { customerAccountFetch, isAuthenticated } from '@/lib/customer-account';

const CUSTOMER_UPDATE_MUTATION = `
  mutation customerUpdate($input: CustomerUpdateInput!) {
    customerUpdate(input: $input) {
      userErrors {
        field
        message
      }
      customer {
        id
        firstName
        lastName
        displayName
        emailAddress {
          emailAddress
        }
      }
    }
  }
`;

interface CustomerUpdateResponse {
  customerUpdate: {
    userErrors: Array<{
      field: string[];
      message: string;
    }>;
    customer: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      displayName: string;
      emailAddress: {
        emailAddress: string;
      } | null;
    } | null;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { firstName, lastName } = body;

    // Validate input
    if (!firstName && !lastName) {
      return NextResponse.json(
        { success: false, error: 'At least one field (firstName or lastName) is required' },
        { status: 400 }
      );
    }

    // Build input object with only provided fields
    const input: Record<string, string> = {};
    if (firstName !== undefined) input.firstName = firstName;
    if (lastName !== undefined) input.lastName = lastName;

    // Call the Customer Account API
    const data = await customerAccountFetch<CustomerUpdateResponse>({
      query: CUSTOMER_UPDATE_MUTATION,
      variables: { input },
    });

    // Check for errors
    if (data.customerUpdate.userErrors.length > 0) {
      const errors = data.customerUpdate.userErrors.map((e) => e.message).join(', ');
      return NextResponse.json(
        { success: false, error: errors },
        { status: 400 }
      );
    }

    // Return updated customer
    const customer = data.customerUpdate.customer;
    return NextResponse.json({
      success: true,
      customer: customer
        ? {
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            displayName: customer.displayName,
            email: customer.emailAddress?.emailAddress || null,
          }
        : null,
    });
  } catch (error) {
    console.error('Customer update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      },
      { status: 500 }
    );
  }
}
