import { getDashboardStats } from '@/lib/admin-data';
import Link from 'next/link';

export default async function AdminDashboardPage() {
    const dashboardStats = await getDashboardStats();

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Total Revenue</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">${dashboardStats.totalRevenue.toLocaleString()}</p>
                    <p className="text-sm text-green-600 mt-1">Last 30 days</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Total Orders</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{dashboardStats.totalOrders}</p>
                    <p className="text-sm text-green-600 mt-1">Last 30 days</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Low Stock Alerts</h3>
                    <p className={`mt-2 text-3xl font-bold ${dashboardStats.lowStockCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>{dashboardStats.lowStockCount}</p>
                    <Link href="/admin/inventory" className="text-sm text-primary-600 mt-1 hover:underline block">View Details &rarr;</Link>
                </div>
            </div>
        </div>
    );
}
