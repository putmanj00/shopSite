import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { blogPosts } from '@/data/blog-posts';

export const metadata: Metadata = {
    title: 'Journal | Wildenflower',
    description: 'Stories from the artisan community, craft techniques, and bohemian lifestyle tips.',
};

export default function BlogPage() {
    return (
        <>
            {/* Hero */}
            <section className="relative bg-forest text-white overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="/assets/images/headers/botanical-header-blog.png"
                        alt="Botanical illustration"
                        fill
                        className="object-cover opacity-40"
                        priority
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-forest/60 to-forest/90" />
                </div>
                <div className="relative container mx-auto px-4 py-24 lg:py-32">
                    <div className="max-w-3xl">
                        <span className="text-gold font-medium text-sm uppercase tracking-wider">
                            The Journal
                        </span>
                        <h1 className="mt-4 text-4xl font-bold font-heading sm:text-5xl lg:text-6xl leading-tight">
                            Stories & Inspiration
                        </h1>
                        <p className="mt-6 text-xl text-parchment/80 leading-relaxed">
                            Behind every piece is a story — of the maker, the material, and the tradition.
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" aria-hidden="true">
                        <path d="M0 60V30C360 0 720 0 1080 30C1260 45 1380 52.5 1440 60V60H0Z" fill="currentColor" className="text-parchment" />
                    </svg>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="bg-parchment py-12 lg:py-16 -mt-px">
                <div className="container mx-auto px-4">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                        {blogPosts.map((post) => (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="relative aspect-[3/2] overflow-hidden">
                                    <Image
                                        src={post.imageUrl}
                                        alt={post.title}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />
                                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                                        {post.tags.slice(0, 2).map((tag) => (
                                            <span
                                                key={tag}
                                                className="bg-terracotta/90 text-white text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide backdrop-blur-sm"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h2 className="text-lg font-bold font-heading text-ink-brown group-hover:text-terracotta transition-colors leading-snug">
                                        {post.title}
                                    </h2>
                                    <p className="mt-2 text-earth text-sm leading-relaxed line-clamp-2">
                                        {post.excerpt}
                                    </p>
                                    <div className="mt-4 flex items-center justify-between text-xs text-earth/60">
                                        <span className="font-medium">{post.author}</span>
                                        <time dateTime={post.date}>
                                            {new Date(post.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </time>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
