import { getAllReviews, calculateReviewStats } from '@/lib/reviews-db';

export default async function AdminDashboardPage() {
    const reviews = await getAllReviews();
    const stats = calculateReviewStats(reviews);

    const pendingCount = reviews.filter(r => r.status === 'pending').length;
    const approvedCount = reviews.filter(r => r.status === 'approved').length;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Total Reviews</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{reviews.length}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Average Rating</h3>
                    <p className="mt-2 text-3xl font-bold text-blue-600">{stats.averageRating} <span className="text-lg text-gray-400">/ 5.0</span></p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Approval Status</h3>
                    <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-green-600 font-semibold">Approved</span>
                            <span className="font-bold">{approvedCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-yellow-600 font-semibold">Pending</span>
                            <span className="font-bold">{pendingCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
