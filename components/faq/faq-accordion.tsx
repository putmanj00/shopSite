'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { FaqItem } from '@/data/faq-data';

interface FaqAccordionProps {
    items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
    const [openId, setOpenId] = useState<string | null>(null);

    const toggle = (id: string) => {
        setOpenId((prev) => (prev === id ? null : id));
    };

    return (
        <div className="space-y-3">
            {items.map((item) => {
                const isOpen = openId === item.id;
                return (
                    <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <button
                            onClick={() => toggle(item.id)}
                            className="w-full flex items-center justify-between p-5 text-left"
                            aria-expanded={isOpen}
                        >
                            <span className="text-ink-brown font-medium pr-4">{item.question}</span>
                            <Image
                                src={isOpen
                                    ? '/assets/images/icons/ui/fern-collapse.png'
                                    : '/assets/images/icons/ui/fern-expand.png'}
                                alt={isOpen ? 'Collapse' : 'Expand'}
                                width={24}
                                height={24}
                                className="flex-shrink-0"
                            />
                        </button>
                        <div
                            className="transition-all duration-300 ease-in-out overflow-hidden"
                            style={{ maxHeight: isOpen ? '500px' : '0' }}
                        >
                            <div className="px-5 pb-5">
                                <p className="text-earth leading-relaxed">{item.answer}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
