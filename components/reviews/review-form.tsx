'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import StarRating from '@/components/star-rating';

interface ReviewFormProps {
    productId: string;
    onReviewSubmitted: () => void;
}

export default function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
    const { customer, isAuthenticated } = useAuthStore();
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isAuthenticated || !customer) {
        return (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
                <p className="text-gray-600 mb-4">Please sign in to write a review.</p>
                <a
                    href={`/login?returnTo=/products/${productId}`}
                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    Sign In
                </a>
            </div>
        );
    }

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        // Limit to 3 photos
        if (photos.length + files.length > 3) {
            setError('You can only upload up to 3 photos.');
            return;
        }

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotos(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });

        // Clear input value to allow same file selection
        e.target.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a star rating.');
            return;
        }
        setError(null);
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    userId: customer.id,
                    userName: customer.displayName || customer.firstName || 'Anonymous',
                    rating,
                    title,
                    content,
                    photos,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit review');
            }

            // Reset form and notify parent
            setRating(0);
            setTitle('');
            setContent('');
            setPhotos([]);
            onReviewSubmitted();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h3>

            {error && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="mb-4">
                <span id="rating-label" className="block text-sm font-medium text-gray-700 mb-1">Rating</span>
                <StarRating rating={rating} size="lg" interactive onRatingChange={setRating} ariaLabelledBy="rating-label" />
            </div>

            <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Review Title
                </label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    placeholder="Give your review a title"
                />
            </div>

            <div className="mb-6">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Review Content
                </label>
                <textarea
                    id="content"
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    placeholder="Share your thoughts about this product..."
                />
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Photos (optional)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {photos.map((photo, index) => (
                        <div key={index} className="relative w-20 h-20 border border-gray-200 rounded-lg overflow-hidden group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Remove photo"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                    <label className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoUpload}
                            className="hidden"
                        />
                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="sr-only">Upload photos</span>
                    </label>
                </div>
                <p className="text-xs text-gray-500">You can upload up to 3 photos.</p>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </form >
    );
}
