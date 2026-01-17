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
    const [sortBy, setSortBy] = useState('newest');
    const [filterRating, setFilterRating] = useState<number | null>(null);
    const [withPhotos, setWithPhotos] = useState(false);
    const [helpfulClicked, setHelpfulClicked] = useState<Record<string, boolean>>({});

    const fetchReviews = useCallback(async () => {
        try {
            const params = new URLSearchParams({ handle: productId });
            if (sortBy) params.append('sort', sortBy);
            if (filterRating) params.append('rating', filterRating.toString());
            if (withPhotos) params.append('withPhotos', 'true');

            const res = await fetch(`/api/reviews?${params.toString()}`);
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
    }, [productId, sortBy, filterRating, withPhotos]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleHelpful = async (reviewId: string) => {
        if (helpfulClicked[reviewId]) return;

        try {
            const res = await fetch('/api/helpful', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId }),
            });

            if (res.ok) {
                setHelpfulClicked((prev) => ({ ...prev, [reviewId]: true }));
                // Optimistically update
                setReviews((prev) =>
                    prev.map((r) =>
                        r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
                    )
                );
            }
        } catch (error) {
            console.error('Failed to mark helpful:', error);
        }
    };

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

                            <div className="space-y-2 mb-6">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = stats.distribution[star] || 0;
                                    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                                    return (
                                        <button
                                            key={star}
                                            onClick={() => setFilterRating(filterRating === star ? null : star)}
                                            className={`w-full flex items-center text-sm gap-2 hover:bg-gray-100 p-1 rounded -mx-1 transition-colors ${filterRating === star ? 'bg-gray-100 ring-1 ring-gray-300' : ''}`}
                                        >
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
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="pt-4 border-t border-gray-200 space-y-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={withPhotos}
                                        onChange={(e) => setWithPhotos(e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">With Photos Only</span>
                                </label>
                                {(filterRating || withPhotos) && (
                                    <button
                                        onClick={() => { setFilterRating(null); setWithPhotos(false); }}
                                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                                    >
                                        Clear all filters
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <ReviewForm productId={productId} onReviewSubmitted={fetchReviews} />
                </div>

                {/* Right Column: Review List */}
                <div className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-gray-600">{reviews.length} reviews</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="rounded-md border-gray-300 py-1.5 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        >
                            <option value="newest">Newest</option>
                            <option value="highest">Highest Rating</option>
                            <option value="lowest">Lowest Rating</option>
                        </select>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <p className="text-gray-500 text-lg">No reviews match your filters.</p>
                            {(filterRating || withPhotos) && (
                                <button
                                    onClick={() => { setFilterRating(null); setWithPhotos(false); }}
                                    className="mt-2 text-blue-600 hover:text-blue-800 underline"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {reviews.map((review) => (
                                <div key={review.id} className="border-b border-gray-100 pb-8 last:border-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
                                                {review.userName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">{review.userName}</span>
                                                    {review.verifiedPurchase && (
                                                        <span className="inline-flex items-center gap-0.5 text-xs text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                            Verified Buyer
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="mb-2">
                                        <StarRating rating={review.rating} size="sm" />
                                    </div>

                                    <h4 className="font-bold text-gray-900 mb-1">{review.title}</h4>
                                    <p className="text-gray-600 leading-relaxed mb-4">{review.content}</p>

                                    {review.photos && review.photos.length > 0 && (
                                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                            {review.photos.map((photo, idx) => (
                                                <div key={idx} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={photo}
                                                        alt={`Review photo ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
                                        <button
                                            onClick={() => handleHelpful(review.id)}
                                            disabled={!!helpfulClicked[review.id]}
                                            className={`flex items-center gap-1.5 transition-colors ${helpfulClicked[review.id] ? 'text-green-600 cursor-default' : 'hover:text-gray-700'}`}
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                            </svg>
                                            <span>
                                                {helpfulClicked[review.id] ? 'Thank you!' : 'Helpful'}
                                                {review.helpfulCount ? ` (${review.helpfulCount})` : ''}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
