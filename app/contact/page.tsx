import type { Metadata } from 'next';
import Link from 'next/link';
import { BotanicalHeader } from '@/components/ui/botanical-header';

export const metadata: Metadata = {
    title: 'Contact Us | Wildenflower',
    description: 'Get in touch with the Wildenflower team. We\'re here to help with orders, questions, and everything in between.',
};

export default function ContactPage() {
    return (
        <>
            <BotanicalHeader />

            {/* Hero */}
            <section className="bg-parchment py-16 lg:py-20">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <span className="text-terracotta font-medium text-sm uppercase tracking-wider">
                        Get in Touch
                    </span>
                    <h1 className="mt-3 text-4xl font-bold font-heading text-ink-brown sm:text-5xl">
                        We&apos;d Love to Hear From You
                    </h1>
                    <p className="mt-4 text-lg text-earth max-w-2xl mx-auto">
                        Whether you have a question about an order, need help finding the perfect piece,
                        or just want to say hello — we&apos;re here for you.
                    </p>
                </div>
            </section>

            {/* Contact Info + Form */}
            <section className="bg-white py-12 lg:py-16">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="grid gap-12 lg:grid-cols-2">
                        {/* Contact Info */}
                        <div>
                            <h2 className="text-2xl font-bold font-heading text-ink-brown mb-6">
                                Contact Information
                            </h2>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <span className="flex-shrink-0 w-10 h-10 bg-sage/20 text-terracotta rounded-lg flex items-center justify-center">
                                        ✉️
                                    </span>
                                    <div>
                                        <p className="font-semibold text-ink-brown">Email</p>
                                        <a href="mailto:hello@wildenflower.com" className="text-terracotta hover:underline">
                                            hello@wildenflower.com
                                        </a>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <span className="flex-shrink-0 w-10 h-10 bg-sage/20 text-terracotta rounded-lg flex items-center justify-center">
                                        📞
                                    </span>
                                    <div>
                                        <p className="font-semibold text-ink-brown">Phone</p>
                                        <a href="tel:1-800-123-4567" className="text-terracotta hover:underline">
                                            1-800-123-4567
                                        </a>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <span className="flex-shrink-0 w-10 h-10 bg-sage/20 text-terracotta rounded-lg flex items-center justify-center">
                                        🕐
                                    </span>
                                    <div>
                                        <p className="font-semibold text-ink-brown">Business Hours</p>
                                        <p className="text-earth text-sm">Mon–Fri: 9am–6pm EST</p>
                                        <p className="text-earth text-sm">Sat–Sun: 10am–4pm EST</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <span className="flex-shrink-0 w-10 h-10 bg-sage/20 text-terracotta rounded-lg flex items-center justify-center">
                                        📍
                                    </span>
                                    <div>
                                        <p className="font-semibold text-ink-brown">Location</p>
                                        <p className="text-earth text-sm">Austin, TX</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 p-6 bg-sage/10 rounded-xl">
                                <p className="text-ink-brown font-semibold mb-2">Quick answers?</p>
                                <p className="text-earth text-sm mb-4">
                                    Check our FAQ for answers to common questions about orders, shipping, and returns.
                                </p>
                                <Link
                                    href="/faq"
                                    className="text-terracotta font-medium hover:underline text-sm"
                                >
                                    Visit FAQ →
                                </Link>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-parchment p-8 rounded-2xl">
                            <h2 className="text-2xl font-bold font-heading text-ink-brown mb-6">
                                Send a Message
                            </h2>
                            <form className="space-y-5">
                                <div>
                                    <label htmlFor="contact-name" className="block text-sm font-medium text-ink-brown mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="contact-name"
                                        className="w-full px-4 py-3 bg-white border border-gold/30 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent text-ink-brown"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="contact-email" className="block text-sm font-medium text-ink-brown mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="contact-email"
                                        className="w-full px-4 py-3 bg-white border border-gold/30 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent text-ink-brown"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="contact-subject" className="block text-sm font-medium text-ink-brown mb-1">
                                        Subject
                                    </label>
                                    <select
                                        id="contact-subject"
                                        className="w-full px-4 py-3 bg-white border border-gold/30 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent text-ink-brown"
                                    >
                                        <option value="">Select a topic...</option>
                                        <option value="order">Order Question</option>
                                        <option value="product">Product Inquiry</option>
                                        <option value="returns">Returns & Exchanges</option>
                                        <option value="wholesale">Wholesale / Partnerships</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="contact-message" className="block text-sm font-medium text-ink-brown mb-1">
                                        Message
                                    </label>
                                    <textarea
                                        id="contact-message"
                                        rows={5}
                                        className="w-full px-4 py-3 bg-white border border-gold/30 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent text-ink-brown resize-none"
                                        placeholder="How can we help?"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-terracotta hover:bg-terracotta/90 text-white font-semibold rounded-lg transition-colors"
                                >
                                    Send Message
                                </button>
                                <p className="text-earth/60 text-xs text-center">
                                    We typically respond within 24 hours.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
