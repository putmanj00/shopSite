'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import OrderList from '@/components/order-list';
import AddressBook from '@/components/address-book';

export default function AccountPage() {
    const router = useRouter();
    const { customer, accessToken, logout, isLoading, fetchCustomer } = useAuthStore();
    // Use state initialization to avoid setState in effect
    const [isMounted, setIsMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'orders' | 'addresses'>('orders');

    // Handle client-side hydration for Zustand store
    useEffect(() => {
        // Using setTimeout to prevent cascading renders
        const timer = setTimeout(() => setIsMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    // Protect route
    useEffect(() => {
        if (isMounted && !accessToken) {
            router.push('/login');
        }
    }, [isMounted, accessToken, router]);

    // Fetch customer data if missing or if just mounted (to get latest orders)
    useEffect(() => {
        if (isMounted && accessToken) {
            // Always fetch fresh data on mount to get latest orders/addresses
            // The store logic will handle the actual API call
            fetchCustomer();
        }
    }, [isMounted, accessToken, fetchCustomer]);

    if (!isMounted || !accessToken) {
        return null; // Or loading spinner
    }

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    // Safe access to edges
    const orders = customer?.orders?.edges?.map(edge => edge.node) || [];
    const addresses = customer?.addresses?.edges?.map(edge => edge.node) || [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
                    <p className="text-gray-500 mt-1">
                        Welcome back, {customer?.firstName || 'Guest'}
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="self-start md:self-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    {isLoading ? 'Signing out...' : 'Sign Out'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar / Navigation */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">Profile</h2>
                        {customer ? (
                            <div className="space-y-2 text-sm">
                                <p className="font-medium text-gray-900">{customer.displayName}</p>
                                <p className="text-gray-500 break-all">{customer.email}</p>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">Loading...</p>
                        )}
                    </div>

                    <nav className="space-y-1">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'orders'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            Order History
                        </button>
                        <button
                            onClick={() => setActiveTab('addresses')}
                            className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'addresses'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            Address Book
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <div className="bg-white shadow rounded-lg p-6 min-h-[400px]">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            {activeTab === 'orders' ? 'Order History' : 'Address Book'}
                        </h2>

                        {activeTab === 'orders' ? (
                            <OrderList orders={orders} />
                        ) : (
                            <AddressBook
                                addresses={addresses}
                                defaultAddress={customer?.defaultAddress || null}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
