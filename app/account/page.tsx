'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import OrderHistory from '@/components/account/order-history';
import AddressBook from '@/components/account/address-book';
import WishlistPreview from '@/components/account/wishlist-preview';
import RecentlyViewed from '@/components/account/recently-viewed';
import LoyaltyCard from '@/components/account/loyalty-card';
import ReferralSection from '@/components/account/referral-section';
import BirthdaySection from '@/components/account/birthday-section';
import EarlyAccessSection from '@/components/account/early-access-section';

type TabId = 'overview' | 'orders' | 'addresses' | 'wishlist' | 'rewards';

interface Tab {
  id: TabId;
  name: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  {
    id: 'overview',
    name: 'Overview',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    id: 'orders',
    name: 'Orders',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    id: 'addresses',
    name: 'Addresses',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'wishlist',
    name: 'Wishlist',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    id: 'rewards',
    name: 'Rewards',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function AccountPage() {
  const router = useRouter();
  const { customer, isAuthenticated, logout, isLoading, isUpdating, error, checkAuth, updateProfile, clearError } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle client-side hydration
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Check auth status on mount
  useEffect(() => {
    if (isMounted) {
      checkAuth();
    }
  }, [isMounted, checkAuth]);

  // Protect route - redirect to login if not authenticated
  useEffect(() => {
    if (isMounted && !isLoading && !isAuthenticated) {
      router.push('/login?returnTo=/account');
    }
  }, [isMounted, isLoading, isAuthenticated, router]);

  // Initialize form values when customer data is loaded
  useEffect(() => {
    if (customer) {
      const timer = setTimeout(() => {
        setFirstName(customer.firstName || '');
        setLastName(customer.lastName || '');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [customer]);

  // Show loading state while checking auth
  if (!isMounted || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center">
            <svg
              className="animate-spin h-8 w-8 text-primary-600 mb-4"
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
            <p className="text-gray-600">Loading account...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setSuccessMessage('');
    clearError();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFirstName(customer?.firstName || '');
    setLastName(customer?.lastName || '');
    clearError();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    const success = await updateProfile({ firstName, lastName });

    if (success) {
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {customer?.firstName || customer?.displayName || 'there'}!
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="self-start md:self-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          {/* Profile Card */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Profile</h2>
              {!isEditing && (
                <button
                  onClick={handleEditClick}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    placeholder="Enter your last name"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900 break-all text-sm">
                    {customer?.email || 'Not available'}
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUpdating ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">
                    {customer?.firstName && customer?.lastName
                      ? `${customer.firstName} ${customer.lastName}`
                      : customer?.firstName || customer?.lastName || <span className="text-gray-400 italic">Not set</span>}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900 break-all">
                    {customer?.email || 'Not available'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <nav className="bg-white shadow rounded-lg overflow-hidden" aria-label="Account navigation">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                }`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {tab.icon}
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white shadow rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary-600">0</p>
                  <p className="text-sm text-gray-500">Orders</p>
                </div>
                <div className="bg-white shadow rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary-600">0</p>
                  <p className="text-sm text-gray-500">Wishlist</p>
                </div>
                <div className="bg-white shadow rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary-600">0</p>
                  <p className="text-sm text-gray-500">Reviews</p>
                </div>
                <div className="bg-white shadow rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary-600">0</p>
                  <p className="text-sm text-gray-500">Points</p>
                </div>
              </div>

              {/* Early Access Section */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Early Access</h2>
                <EarlyAccessSection />
              </section>

              {/* Birthday Section */}
              <section>
                <BirthdaySection />
              </section>

              {/* Recently Viewed */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recently Viewed</h2>
                <RecentlyViewed />
              </section>
            </div>
          )}

          {activeTab === 'orders' && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order History</h2>
              <OrderHistory />
            </section>
          )}

          {activeTab === 'addresses' && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Saved Addresses</h2>
              <AddressBook />
            </section>
          )}

          {activeTab === 'wishlist' && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">My Wishlist</h2>
              <WishlistPreview />
            </section>
          )}

          {activeTab === 'rewards' && (
            <div className="space-y-8">
              {/* Loyalty Card */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Loyalty Status</h2>
                <LoyaltyCard points={250} tier="bronze" nextTierPoints={500} />
              </section>

              {/* Referral Section */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Refer a Friend</h2>
                <div className="bg-white shadow rounded-lg p-6">
                  <ReferralSection />
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
