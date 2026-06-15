'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading, checkAuth } = useAuthStore();

  const error = searchParams.get('error');
  const returnTo = searchParams.get('returnTo') || '/account';

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(returnTo);
    }
  }, [isAuthenticated, isLoading, router, returnTo]);

  // Auto-redirect to Shopify login after a brief moment
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !error) {
      // Small delay to show the page briefly
      const timer = setTimeout(() => {
        login(returnTo);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, error, login, returnTo]);

  const handleLogin = () => {
    login(returnTo);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-forest font-heading">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-earth">
            You&apos;ll be redirected to Shopify to sign in securely
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {decodeURIComponent(error)}
                </h3>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <svg
                className="animate-spin h-8 w-8 text-terracotta"
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
              <p className="mt-4 text-sm text-earth">
                {isAuthenticated ? 'Redirecting...' : 'Checking authentication...'}
              </p>
            </div>
          ) : (
            <>
              <button
                onClick={handleLogin}
                className="group relative flex w-full justify-center rounded-md bg-terracotta py-3 px-3 text-sm font-semibold text-white hover:bg-terracotta/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta transition-colors"
              >
                Continue with Shopify
              </button>

              <p className="text-center text-xs text-earth">
                Don&apos;t have an account? You can create one during sign-in.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
