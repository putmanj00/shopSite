'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth-store';

export default function RegisterPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, checkAuth } = useAuthStore();

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/account');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleCreateAccount = () => {
    // Redirect to Shopify's login/signup flow
    login('/account');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-forest font-heading">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-earth">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary-700 hover:text-primary-800 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md bg-parchment p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-sage"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-forest">
                  Secure account creation
                </h3>
                <div className="mt-2 text-sm text-earth">
                  <p>
                    You&apos;ll be redirected to Shopify to create your account securely.
                    This provides passwordless login for enhanced security.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleCreateAccount}
            disabled={isLoading}
            fullWidth
            size="sm"
            className="disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </span>
            ) : (
              'Create account with Shopify'
            )}
          </Button>

          <p className="text-center text-xs text-earth">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
