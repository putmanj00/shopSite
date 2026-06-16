import { getAllReviews, calculateReviewStats } from '@/lib/reviews-db';
import { getDashboardStats } from '@/lib/admin-data';
import Link from 'next/link';

export default async function AdminDashboardPage() {
    const reviews = await getAllReviews();
    const stats = calculateReviewStats(reviews);
    const dashboardStats = await getDashboardStats();

    const pendingCount = reviews.filter(r => r.status === 'pending').length;
    const approvedCount = reviews.filter(r => r.status === 'approved').length;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Pending Reviews</h3>
                    <p className={`mt-2 text-3xl font-bold ${pendingCount > 0 ? 'text-amber-500' : 'text-gray-900'}`}>{pendingCount}</p>
                    <Link href="/admin/reviews" className="text-sm text-primary-600 mt-1 hover:underline block">Moderate &rarr;</Link>
                </div>
            </div>

            {/* Review Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Review Performance</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm text-gray-500">Average Rating</p>
                        <p className="mt-1 text-4xl font-bold text-gray-900">{stats.averageRating} <span className="text-xl text-gray-400">/ 5.0</span></p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Reviews</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">{reviews.length}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Approval Rate</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">
                            {reviews.length > 0 ? Math.round((approvedCount / reviews.length) * 100) : 0}%
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
