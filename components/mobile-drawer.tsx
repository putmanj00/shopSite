'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close the drawer when the route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Lock body scroll when the drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const toggleDrawer = () => setIsOpen((prev) => !prev);
    const closeDrawer = () => setIsOpen(false);

    const categories = [
        { name: 'Shop All', href: '/collections/all' },
        { name: 'Leather Goods', href: '/collections/leather' },
        { name: 'Jewelry', href: '/collections/jewelry' },
        { name: 'Tie-Dye', href: '/collections/tie-dye' },
        { name: 'Art', href: '/collections/art' },
    ];

    const supportLinks = [
        { name: 'Contact Us', href: '/contact' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Sign In', href: '/login' },
    ];

    return (
        <>
            <button
                onClick={toggleDrawer}
                className="lg:hidden p-2 text-parchment hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                    />
                </svg>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Dark Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                            onClick={closeDrawer}
                            aria-hidden="true"
                        />

                        {/* Sliding Drawer Panel */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 30,
                            }}
                            className="fixed top-0 left-0 h-full w-[80vw] max-w-sm bg-forest shadow-2xl z-50 overflow-y-auto flex flex-col lg:hidden"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Mobile navigation menu"
                        >
                            <div className="flex items-center justify-end p-4">
                                <button
                                    onClick={closeDrawer}
                                    className="p-2 text-parchment hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full"
                                    aria-label="Close menu"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex flex-col flex-1 px-6 py-2">
                                <nav aria-label="Primary mobile navigation" className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-4">
                                        {categories.map((category) => (
                                            <Link
                                                key={category.name}
                                                href={category.href}
                                                className="text-lg font-playfair font-semibold text-parchment hover:text-gold transition-colors block"
                                                onClick={closeDrawer}
                                            >
                                                {category.name}
                                            </Link>
                                        ))}
                                        <Link
                                            href="/about"
                                            className="text-lg font-playfair font-semibold text-parchment hover:text-gold transition-colors block"
                                            onClick={closeDrawer}
                                        >
                                            Our Story
                                        </Link>
                                    </div>
                                </nav>

                                <div className="mt-8 mb-8 border-t border-gold opacity-50"></div>

                                <nav aria-label="Secondary mobile navigation" className="flex flex-col gap-4">
                                    {supportLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            className="text-base text-parchment/80 hover:text-gold transition-colors block"
                                            onClick={closeDrawer}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </nav>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
