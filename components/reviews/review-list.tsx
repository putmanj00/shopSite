'use client';

import { useState, useEffect, useCallback } from 'react';
import { Review, ReviewStats } from '@/types/reviews';
import StarRating from '@/components/star-rating';
import ReviewForm from './review-form';

interface ReviewListProps {
    productId: string;
}

export default function ReviewList({ productId }: ReviewListProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchReviews = useCallback(async () => {
        try {
            const res = await fetch(`/api/reviews?handle=${productId}`);
            const data = await res.json();
            if (res.ok) {
                setReviews(data.reviews);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to load reviews:', error);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    if (loading) {
        return <div className="py-8 text-center text-gray-500">Loading reviews...</div>;
    }

    return (
        <div className="mt-16 border-t border-gray-200 pt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Column: Stats & Form */}
                <div className="lg:col-span-4 space-y-8">
                    {stats && (
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-5xl font-bold text-gray-900">{stats.averageRating}</span>
                                <div>
                                    <StarRating rating={stats.averageRating} size="lg" />
                                    <p className="text-sm text-gray-500 mt-1">{stats.totalReviews} reviews</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = stats.distribution[star] || 0;
                                    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                                    return (
                                        <div key={star} className="flex items-center text-sm gap-2">
                                            <span className="w-3 text-gray-600">{star}</span>
                                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-yellow-400 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="w-8 text-right text-gray-500">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <ReviewForm productId={productId} onReviewSubmitted={fetchReviews} />
                </div>

                {/* Right Column: Review List */}
                <div className="lg:col-span-8">
                    {reviews.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <p className="text-gray-500 text-lg">No reviews yet. Be the first to write one!</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {reviews.map((review) => (
                                <div key={review.id} className="border-b border-gray-100 pb-8 last:border-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
                                                {review.userName.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-gray-900">{review.userName}</span>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="mb-2">
                                        <StarRating rating={review.rating} size="sm" />
                                    </div>

                                    <h4 className="font-bold text-gray-900 mb-1">{review.title}</h4>
                                    <p className="text-gray-600 leading-relaxed">{review.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
