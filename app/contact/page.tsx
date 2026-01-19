import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us | Artisan Collective',
    description: 'Get in touch with the Artisan Collective team. We would love to hear from you about custom orders, questions, or partnerships.',
    openGraph: {
        title: 'Contact Us | Artisan Collective',
        description: 'Get in touch with the Artisan Collective team. We would love to hear from you.',
    },
};

export default function ContactPage() {
    return (
        <div className="bg-white min-h-screen">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16 md:py-24">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                        Get in Touch
                    </h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                        Questions about an order, interested in custom work, or want to partner with us? We&apos;d love to hear from you.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject
                                </label>
                                <select
                                    id="subject"
                                    name="subject"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Select a topic</option>
                                    <option value="order">Order Inquiry</option>
                                    <option value="custom">Custom Order Request</option>
                                    <option value="partnership">Partnership Opportunity</option>
                                    <option value="press">Press Inquiry</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={5}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-gray-50 rounded-2xl p-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Other ways to reach us</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Email</p>
                                        <a href="mailto:hello@artisancollective.com" className="text-primary-600 hover:underline">
                                            hello@artisancollective.com
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Response Time</p>
                                        <p className="text-gray-600">We aim to respond within 24 hours</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Looking for quick answers?</h3>
                            <p className="text-gray-600 mb-4">
                                Check out our FAQ page for answers to common questions about orders, shipping, and more.
                            </p>
                            <a
                                href="/faq"
                                className="inline-flex items-center text-primary-600 font-medium hover:underline"
                            >
                                Visit FAQ
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
