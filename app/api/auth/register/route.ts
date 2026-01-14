import { NextRequest, NextResponse } from 'next/server';
import { getShopifyClient } from '@/lib/shopify';
import { CUSTOMER_CREATE_MUTATION, CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION } from '@/lib/shopify-queries';
import type { CustomerCreatePayload, CustomerAccessTokenCreatePayload } from '@/types/shopify';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const cleanEmail = email?.trim();
    const cleanPassword = password?.trim();
    const cleanFirstName = firstName?.trim();
    const cleanLastName = lastName?.trim();

    console.log(`[Register] Attempting to create user: '${cleanEmail}' (Pass len: ${cleanPassword?.length})`);

    const client = getShopifyClient();

    // Create the customer
    const createResponse = await client.request<{
      customerCreate: CustomerCreatePayload;
    }>(CUSTOMER_CREATE_MUTATION, {
      variables: {
        input: { 
            email: cleanEmail, 
            password: cleanPassword, 
            firstName: cleanFirstName, 
            lastName: cleanLastName 
        },
      },
    });

    const { data: createData, errors: createErrors } = createResponse;

    if (createErrors) {
        console.error('[Register] GraphQL Errors:', JSON.stringify(createErrors));
        const errorMessage = Array.isArray(createErrors) ? createErrors[0].message : 'GraphQL Error';
        return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { customerUserErrors, customer } = createData?.customerCreate || {};

    if (customerUserErrors && customerUserErrors.length > 0) {
      return NextResponse.json(
        { error: customerUserErrors[0].message },
        { status: 400 }
      );
    }
    
    console.log(`[Register] Customer created successfully: ${customer?.id}. Waiting for propagation...`);

    // Wait 3 seconds to allow Shopify propagation (fix for UNIDENTIFIED_CUSTOMER race condition)
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log(`[Register] Attempting auto-login for: '${cleanEmail}'`);

    // Automatically login after successful registration
    const loginResponse = await client.request<{
      customerAccessTokenCreate: CustomerAccessTokenCreatePayload;
    }>(CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION, {
      variables: {
        input: { email: cleanEmail, password: cleanPassword },
      },
    });

    const { data: loginData } = loginResponse;
    const { customerAccessToken, customerUserErrors: loginErrors } =
      loginData?.customerAccessTokenCreate || {};

    if (loginErrors && loginErrors.length > 0) {
      console.warn('Auto-login failed for email:', email);
      console.warn('Auto-login Error Code:', loginErrors[0].code);
      console.warn('Auto-login Message:', loginErrors[0].message);
      
      // Return success but indicate login failed
      return NextResponse.json({
        success: true,
        requiresLogin: true,
        message: 'Account created successfully. Please check your email to verify your account before logging in.'
      });
    }

    // Trigger Welcome Email (Fire and forget)
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/welcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, firstName: firstName || 'Customer' }),
    }).catch(err => console.error('Failed to trigger welcome email:', err));

    return NextResponse.json({
      accessToken: customerAccessToken?.accessToken,
      expiresAt: customerAccessToken?.expiresAt,
    });
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 500 }
    );
  }
}
