import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { blogPosts } from '@/data/blog-posts';

export async function generateStaticParams() {
    return blogPosts.map((post) => ({
        slug: post.slug,
    }));
}

interface BlogPostPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        return {
            title: 'Article Not Found',
        };
    }

    return {
        title: `${post.title} | Artisan Journal`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.date,
            authors: [post.author],
            tags: post.tags,
            images: [
                {
                    url: post.imageUrl,
                    alt: post.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
            images: [post.imageUrl],
        },
    };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        notFound();
    }

    // Article Schema
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        image: [post.imageUrl],
        datePublished: post.date,
        dateModified: post.date, // Assuming no modifications for now
        author: [{
            '@type': 'Person',
            name: post.author,
        }],
        description: post.excerpt,
    };

    return (
        <div className="bg-white min-h-screen pb-16">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />

            <div className="relative h-[60vh] min-h-[400px] w-full bg-slate-900">
                <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-12 md:pb-16 max-w-4xl">
                    <Link
                        href="/blog"
                        className="inline-flex items-center text-white/80 hover:text-white mb-6 text-sm font-medium transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Journal
                    </Link>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag) => (
                            <span key={tag} className="bg-terracotta/90 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide backdrop-blur-sm">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4 leading-tight">
                        {post.title}
                    </h1>
                    <div className="flex items-center text-white/90 gap-4 text-sm md:text-base">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-200/20 backdrop-blur flex items-center justify-center">
                                <span className="font-bold text-white">{post.author.charAt(0)}</span>
                            </div>
                            <span className="font-medium">{post.author}</span>
                        </div>
                        <span>•</span>
                        <time dateTime={post.date}>
                            {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </time>
                    </div>
                </div>
            </div>

            <article className="container mx-auto px-4 max-w-3xl py-12">
                <div className="prose prose-lg prose-slate mx-auto prose-headings:font-serif prose-a:text-terracotta prose-img:rounded-xl">
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>

                <div className="mt-16 pt-8 border-t border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Related Topics</h3>
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map(tag => (
                            <Link
                                key={tag}
                                href={`/blog?tag=${tag}`}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                            >
                                {tag}
                            </Link>
                        ))}
                    </div>
                </div>
            </article>
        </div>
    );
}
