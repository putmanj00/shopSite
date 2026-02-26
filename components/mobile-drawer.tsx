'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { NavItem } from '@/lib/shopify-helpers';

export default function MobileDrawer({ navItems }: { navItems: NavItem[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [shopExpanded, setShopExpanded] = useState(false);
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
                                    <div className="flex flex-col gap-1">
                                        {/* Home */}
                                        <Link
                                            href="/"
                                            className="text-lg font-playfair font-semibold text-parchment hover:text-gold transition-colors block py-1"
                                            onClick={closeDrawer}
                                        >
                                            Home
                                        </Link>

                                        {/* Shop accordion */}
                                        <div>
                                            <button
                                                onClick={() => setShopExpanded((prev) => !prev)}
                                                aria-expanded={shopExpanded}
                                                className="text-lg font-playfair font-semibold text-parchment hover:text-gold transition-colors flex items-center justify-between w-full py-1"
                                            >
                                                Shop
                                                <svg
                                                    className={`w-4 h-4 transition-transform duration-200 ${shopExpanded ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    aria-hidden="true"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            <AnimatePresence>
                                                {shopExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="flex flex-col pl-4 gap-3 py-2">
                                                            {navItems.map((item) => (
                                                                <Link
                                                                    key={item.href}
                                                                    href={item.href}
                                                                    className="text-base text-parchment/90 hover:text-gold transition-colors block"
                                                                    onClick={closeDrawer}
                                                                >
                                                                    {item.label}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* About */}
                                        <Link
                                            href="/about"
                                            className="text-lg font-playfair font-semibold text-parchment hover:text-gold transition-colors block py-1"
                                            onClick={closeDrawer}
                                        >
                                            About
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
