import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { blogPosts } from '@/data/blog-posts';

export const metadata: Metadata = {
    title: 'Artisan Journal | Tips, Stories & Guides',
    description: 'Explore the stories behind our artisans, learn about craftsmanship, and discover guides on caring for your handmade goods.',
    openGraph: {
        title: 'Artisan Journal | Tips, Stories & Guides',
        description: 'Explore the stories behind our artisans, learn about craftsmanship, and discover guides on caring for your handmade goods.',
        type: 'website',
    },
};

export default function BlogListingPage() {
    return (
        <div className="bg-white min-h-screen">
            <div className="bg-slate-900 text-white py-16 md:py-24">
                <div className="container mx-auto px-4 max-w-7xl">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">The Artisan Journal</h1>
                    <p className="text-lg text-slate-300 max-w-2xl">
                        Stories behind the craft, interviews with makers, and guides to a handmade lifestyle.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-7xl py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="group flex flex-col h-full bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
                        >
                            <div className="relative aspect-[16/9] w-full bg-gray-200">
                                <Image
                                    src={post.imageUrl}
                                    alt={post.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-full uppercase tracking-wider">
                                        {post.tags[0]}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors">
                                    {post.title}
                                </h2>
                                <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center text-sm font-medium text-primary-600 group-hover:underline">
                                    Read Article
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
